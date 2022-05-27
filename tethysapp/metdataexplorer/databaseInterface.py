import os
import json
import netCDF4
import geopandas
import math
import numpy as np

from glob import glob
from math import sqrt
from datetime import datetime

from tethys_sdk.permissions import has_permission
from django.http import JsonResponse
from .app import Metdataexplorer as app
from .model import Dimensions, Files, Groups, Variables, Shapefiles

Persistent_Store_Name = 'thredds_db'


def add_variables_to_opendap_url(opendap_url, list_of_variables):
    opendap_url += '?'
    for variable in list_of_variables:
        if variable == list_of_variables[-1]:
            opendap_url += variable
        else:
            opendap_url += variable + ','
    return opendap_url


def add_file_to_database(request):
    try:

        if request.is_ajax() and request.method == 'POST':
            file_dictionary = {
                'accessURLs': json.loads(request.POST.get('url')),
                'description': request.POST.get('description'),
                'dimensions': {},
                'fileMetadata': {},
                'group': request.POST.get('group'),
                'title': request.POST.get('title'),
                'userCredentials': json.loads(request.POST.get('userCredentials')),
                'variables': {},
                'variablesAndDimensions': json.loads(request.POST.get('variablesAndDimensions'))
            }
            all_variables = request.POST.getlist('allVariables[]')
            list_for_opendap = []

            SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
            session = SessionMaker()

            current_group = session.query(Groups).filter(Groups.title == file_dictionary['group'])[0]

            for file_to_check in current_group.files:
                if file_to_check.title == file_dictionary['title']:
                    array_to_return = {
                        'errorMessage': 'There is already a file with that name. Please provide a different name.'
                    }
                    session.close()
                    return JsonResponse(array_to_return)

            for variable in file_dictionary['variablesAndDimensions']:
                list_for_opendap.append(variable)
                for dimension in file_dictionary['variablesAndDimensions'][variable]:
                    if dimension in all_variables and dimension not in list_for_opendap:
                        list_for_opendap.append(dimension)

            opendap_url = add_variables_to_opendap_url(file_dictionary['accessURLs']['OPENDAP'], list_for_opendap)

            dataset = netCDF4.Dataset(opendap_url)

            for key in dataset.__dict__:
                file_dictionary['fileMetadata'][key] = str(dataset.__dict__[key])

            file_to_add = Files(
                authentication=json.dumps(file_dictionary['userCredentials']),
                description=file_dictionary['description'],
                file_metadata=json.dumps(file_dictionary['fileMetadata']),
                title=file_dictionary['title'],
                urls=json.dumps(file_dictionary['accessURLs']),
            )

            for dimension in dataset.dimensions:
                dimension_type = determine_dimension_type(dimension)
                if dimension in all_variables:
                    has_variable = 'true'
                    dimension_metadata = get_variable_metadata(dataset.variables[dimension])
                    if dimension_type == 'time':
                        if 'units' in dimension_metadata:
                            if 'calendar' in dimension_metadata:
                                calendar = dimension_metadata['calendar']
                            else:
                                calendar = 'standard'
                            date_time_list = netCDF4.num2date(dataset.variables[dimension][:].data.tolist(),
                                                              dimension_metadata['units'], calendar)
                            values = []
                            for time in date_time_list:
                                values.append(str(time))
                        else:
                            values = dataset.variables[dimension][:].data.tolist()
                    else:
                        values = dataset.variables[dimension][:].data.tolist()
                else:
                    has_variable = 'false'
                    values = 'false'
                    dimension_metadata = 'false'

                file_dictionary['dimensions'][dimension] = {
                    'dimensionMetadata': dimension_metadata,
                    'dimensionType': dimension_type,
                    'hasVariable': has_variable,
                    'title': dataset.dimensions[dimension].name,
                    'size': dataset.dimensions[dimension].size,
                    'values': values,
                }

                dimension_to_add = Dimensions(
                    has_variable=file_dictionary['dimensions'][dimension]['hasVariable'],
                    dimension_metadata=json.dumps(file_dictionary['dimensions'][dimension]['dimensionMetadata']),
                    dimension_type=file_dictionary['dimensions'][dimension]['dimensionType'],
                    title=file_dictionary['dimensions'][dimension]['title'],
                    size=json.dumps(file_dictionary['dimensions'][dimension]['size']),
                    values=json.dumps(file_dictionary['dimensions'][dimension]['values']),
                )

                file_to_add.dimensions.append(dimension_to_add)

            for variable in file_dictionary['variablesAndDimensions']:
                file_dictionary['variables'][variable] = {
                    'title': variable,
                    'dimensions': file_dictionary['variablesAndDimensions'][variable],
                    'shape': dataset.variables[variable].shape,
                    'wmsDisplayColor': 'boxfill/rainbow',
                    'valueRange': get_approximate_variable_value_range(dataset.variables[variable]),
                    'variableMetadata': get_variable_metadata(dataset.variables[variable])
                }

                variable_to_add = Variables(
                    dimensions=json.dumps(file_dictionary['variables'][variable]['dimensions']),
                    title=file_dictionary['variables'][variable]['title'],
                    shape=json.dumps(file_dictionary['variables'][variable]['shape']),
                    value_range=json.dumps(file_dictionary['variables'][variable]['valueRange']),
                    variable_metadata=json.dumps(file_dictionary['variables'][variable]['variableMetadata']),
                    wms_display_color=file_dictionary['variables'][variable]['wmsDisplayColor']
                )

                file_to_add.variables.append(variable_to_add)

            current_group.files.append(file_to_add)
            session.add(current_group)
            session.commit()
            session.close()
            file_to_return = {
                'file': file_dictionary
            }

        else:
            file_to_return = {'errorMessage': 'There was an error while adding the group'}

    except Exception as e:
        file_to_return = {
            'errorMessage': 'There was an error while adding the group',
            'error': str(e)
        }

    return JsonResponse(file_to_return)


def add_group_to_database(request):
    try:
        if request.is_ajax() and request.method == 'POST':
            SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
            session = SessionMaker()
            group = {
                'title': request.POST.get('title'),
                'description': request.POST.get('description')
            }
            group_database_obj = Groups(title=group['title'], description=group['description'])
            session.add(group_database_obj)
            session.commit()
            session.close()
        else:
            group = {'errorMessage': 'There was an error while adding the group'}
    except Exception as e:
        group = {
            'errorMessage': 'There was an error while adding the group',
            'error': str(e)
        }
    return JsonResponse(group)


def calculate_new_dataset(request):
    try:
        if request.is_ajax() and request.method == 'POST':
            dataset_array = json.loads(request.POST.get('datasetArray'))
            math_string = dataset_array['mathString'].replace('^', '**')
            new_name = dataset_array['newName']
            new_dataset_values = []
            datasets_in_expression = []
            datetime_lists = []
            datetimes_match = True
            cumulative = False

            if math_string[:10] == 'Cumulative':
                cumulative = True
                math_string = math_string[11:-10]

            split_math_string = math_string.split('!')

            for index, parts_of_expression in enumerate(split_math_string):
                if index % 2 == 1:
                    datasets_in_expression.append(parts_of_expression)

            for dataset in datasets_in_expression:
                datetime_list = []
                for time in dataset_array[dataset]['x']:
                    datetime_list.append(datetime.strptime(time, '%Y-%m-%d %H:%M:%S'))
                datetime_lists.append(datetime_list)

            for datetime_list in datetime_lists:
                if not datetime_list == datetime_lists[0]:
                    print('they dont match')
                    datetimes_match = False

            if datetimes_match:

                if len(split_math_string) >= 1:
                    for value in range(len(dataset_array[split_math_string[1]]['y'])):
                        math_expression = ''
                        for index, expression in enumerate(split_math_string):
                            if index % 2 == 0:
                                math_expression += expression
                            else:
                                math_expression += str(dataset_array[expression]['y'][value])
                        new_dataset_values.append(eval(math_expression))

                if cumulative:
                    print('need to add')
                    time_series_values = np.array(new_dataset_values)
                    time_series_length = len(time_series_values)
                    ones_triangle = np.tril(np.ones((time_series_length, time_series_length)), 0)
                    cumulative = np.matmul(ones_triangle, time_series_values)
                    new_dataset_values = cumulative.tolist()

                time_series = {
                    new_name: new_dataset_values,
                    'datetime': dataset_array[split_math_string[1]]['x']
                }

                array_to_return = {'dataArray': time_series}
            else:
                array_to_return = {'errorMessage': 'The timesteps for each dataset used must match.'}
        else:
            array_to_return = {'errorMessage': 'There was an error while calculating the new dataset.'}
    except Exception as e:
        array_to_return = {
            'errorMessage': 'There was an error while calculating the new dataset.',
            'error': str(e)
        }
    return JsonResponse(array_to_return)


def commit_shapefile_to_database(geojson, filename):
    SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
    session = SessionMaker()
    shapefiles = session.query(Shapefiles).all()
    has_same_name = False

    for shapefile_to_check in shapefiles:
        if filename == shapefile_to_check.title:
            has_same_name = True
        else:
            has_same_name = False

    if has_same_name:
        session.close()
        return True
    else:
        shapefile = Shapefiles(title=filename, geometry=geojson)
        session.add(shapefile)
        session.commit()
        session.close()
        return False


def add_shapefile_to_database(request):
    try:
        if request.is_ajax() and request.method == 'POST':
            shapefiles = request.FILES.getlist('uploadedFiles')
            path_to_shapefile_folder = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                                    'workspaces', 'user_workspaces')

            for n, shapefile in enumerate(shapefiles):
                with open(os.path.join(path_to_shapefile_folder, shapefile.name), 'wb') as dst:
                    for chunk in shapefiles[n].chunks():
                        dst.write(chunk)

            main_shapefile = glob(os.path.join(path_to_shapefile_folder, '*.shp'))[0]
            shapefile_name = os.path.splitext(os.path.basename(main_shapefile))[0]
            all_shapefiles = glob(os.path.join(path_to_shapefile_folder, shapefile_name + '*'))
            path_to_shapefile = os.path.join(path_to_shapefile_folder, shapefile_name + '.shp')

            geojson = geopandas.read_file(path_to_shapefile)

            for shapefile_to_delete in all_shapefiles:
                os.remove(shapefile_to_delete)

            has_same_name = commit_shapefile_to_database(geojson, shapefile_name)

            if has_same_name:
                shapefile_array = {
                    'errorMessage': 'There is already a shapefile with that name. '
                                    'Please rename your file and try again.',
                    'error': 'There is already a shapefile with that name. '
                             'Please rename your file and try again.'
                }
            else:
                shapefile_array = {
                    'name': shapefile_name,
                }
        else:
            shapefile_array = {
                'errorMessage': 'There was an error while saving the shapefile',
                'error': 'There was an error while saving the shapefile'
            }
    except Exception as e:
        shapefile_array = {
            'errorMessage': 'There was an error while saving the shapefile',
            'error': str(e)
        }
    return JsonResponse(shapefile_array)


def delete_files_from_database(request):
    try:
        if has_permission(request, "delete_groups"):
            if request.is_ajax() and request.method == 'POST':
                files = request.POST.getlist("titles[]")


                SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
                session = SessionMaker()

                for current_file in files:
                    current_file_from_database = session.query(Files).filter(Files.title == current_file).first()
                    session.delete(current_file_from_database)

                session.commit()
                session.close()
                result_message = {'successMessage': 'The files were deleted.'}
            else:
                result_message = {
                    'errorMessage': 'The files were not deleted due to an error',
                    'error': 'The files were not deleted due to an error'
                }
    except Exception as e:
        result_message = {
            'errorMessage': 'The files were not deleted due to an error',
            'error': str(e)
        }
    return JsonResponse(result_message)


def delete_groups_from_database(request):
    try:
        if has_permission(request, "delete_groups"):
            if request.is_ajax() and request.method == 'POST':
                groups = request.POST.getlist("titles[]")

                SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
                session = SessionMaker()

                for group in groups:
                    group_from_database = session.query(Groups).filter(Groups.title == group).first()
                    session.delete(group_from_database)

                session.commit()
                session.close()
                result_message = {'successMessage': 'The groups were deleted.'}
            else:
                result_message = {
                    'errorMessage': 'The groups were not deleted due to an error',
                    'error': 'The groups were not deleted due to an error'
                }
    except Exception as e:
        result_message = {
            'errorMessage': 'The groups were not deleted due to an error',
            'error': str(e)
        }
    return JsonResponse(result_message)


def delete_shapefile_from_database(request):
    try:
        if request.is_ajax() and request.method == 'POST':
            shapefile_name = request.POST.get("name")

            SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
            session = SessionMaker()

            shapefile_from_database = session.query(Shapefiles).filter(Shapefiles.title == shapefile_name).first()
            session.delete(shapefile_from_database)

            session.commit()
            session.close()
            result_message = {'successMessage': 'The shapefile was deleted.'}
        else:
            result_message = {
                'errorMessage': 'The groups were not deleted due to an error',
                'error': 'The groups were not deleted due to an error'
            }
    except Exception as e:
        result_message = {
            'errorMessage': 'The shapefile was not deleted due to an error',
            'error': str(e)
        }
    return JsonResponse(result_message)


def determine_dimension_type(dimension):
    list_of_time_dimensions = ['time', 'date', 'month', 'day', 'year', 'hour', 'minute', 'second']
    list_of_x_dimensions = ['lon', 'lng', 'longitude', 'x', 'degrees east', 'degrees west']
    list_of_y_dimensions = ['lat', 'latitude', 'y', 'degrees north', 'degrees south']

    if dimension.lower() in list_of_time_dimensions or 'time' in dimension.lower():
        dimension_type = 'time'
    elif dimension.lower() in list_of_x_dimensions or 'lon' in dimension.lower():
        dimension_type = 'x'
    elif dimension.lower() in list_of_y_dimensions or 'lat' in dimension.lower():
        dimension_type = 'y'
    else:
        dimension_type = 'other'
    return dimension_type


def get_all_groups_from_database(request):
    try:
        thredds_groups_list = []

        SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
        session = SessionMaker()

        thredds_groups = session.query(Groups).all()

        for group in thredds_groups:
            layer_obj = {"title": group.title, "description": group.description}
            thredds_groups_list.append(layer_obj)

        list_catalog = {'groups': thredds_groups_list}
        session.close()
    except Exception as e:
        list_catalog = {
            'errorMessage': 'There was an error while adding the group',
            'error': str(e)
        }
    return JsonResponse(list_catalog)


def get_all_files_from_a_group(request):
    try:
        group_title = request.GET.get('group')

        SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
        session = SessionMaker()  # Initiate a session
        files_in_group = session.query(Groups).filter(Groups.title == group_title)[0].files
        list_of_files = []

        for current_file in files_in_group:
            current_file_array = {
                'accessURLs': json.loads(current_file.urls),
                'description': current_file.description,
                'dimensions': {},
                'fileMetadata': json.loads(current_file.file_metadata),
                'title': current_file.title,
                'userCredentials': json.loads(current_file.authentication),
                'variables': {},
            }

            for dimension in current_file.dimensions:
                dimension_array = {
                    'dimensionMetadata': json.loads(dimension.dimension_metadata),
                    'dimensionType': dimension.dimension_type,
                    'hasVariable': dimension.has_variable,
                    'title': dimension.title,
                    'size': json.loads(dimension.size),
                    'values': json.loads(dimension.values)
                }
                current_file_array['dimensions'][dimension.title] = dimension_array

            for variable in current_file.variables:
                variable_array = {
                    'dimensions': json.loads(variable.dimensions),
                    'shape': json.loads(variable.shape),
                    'title': variable.title,
                    'wmsDisplayColor': variable.wms_display_color,
                    'valueRange': json.loads(variable.value_range),
                    'variableMetadata': json.loads(variable.variable_metadata)
                }
                current_file_array['variables'][variable.title] = variable_array

            list_of_files.append(current_file_array)

        array_to_return = {'listOfFiles': list_of_files}
    except Exception as e:
        array_to_return = {
            'listOfFiles': {
                'errorMessage': 'An error occurred while retrieving the files',
                'error': str(e)
            }
        }
    return JsonResponse(array_to_return)


def get_approximate_variable_value_range(variable):
    try:
        var_size = variable.shape
        indexing_list = []

        for dim_size in var_size:
            if dim_size <= 5:
                index_number = 1
            else:
                index_number = math.floor(dim_size / 5)

            indexing_list.append(index_number)

        if len(var_size) == 1:
            small_array = variable[::indexing_list[0]]
        elif len(var_size) == 2:
            small_array = variable[::indexing_list[0], ::indexing_list[1]]
        elif len(var_size) == 3:
            small_array = variable[::indexing_list[0], ::indexing_list[1], ::indexing_list[2]]
        elif len(var_size) == 4:
            small_array = variable[::indexing_list[0], ::indexing_list[1], ::indexing_list[2], ::indexing_list[3]]
        elif len(var_size) == 5:
            small_array = variable[::indexing_list[0], ::indexing_list[1], ::indexing_list[2], ::indexing_list[3],
                          ::indexing_list[4]]
        elif len(var_size) == 6:
            small_array = variable[::indexing_list[0], ::indexing_list[1], ::indexing_list[2], ::indexing_list[3],
                          ::indexing_list[4], ::indexing_list[5]]

        min_value = np.nanmin(small_array)
        max_value = np.nanmax(small_array)
        min_max_array = {
            'min': str(min_value),
            'max': str(max_value)
        }
    except Exception as e:
        print(e)
        min_max_array = {
            'min': str(0),
            'max': str(100)
        }
    return min_max_array


def get_variable_metadata(variable):
    variable_metadata = {}
    for key in variable.__dict__:
        variable_metadata[key] = str(variable.__dict__[key])
    return variable_metadata


def get_shapefile_coordinates(request):
    try:
        if request.is_ajax() and request.method == 'POST':
            shapefile_name = request.POST.get("name")

            SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
            session = SessionMaker()

            shapefile_from_database = session.query(Shapefiles).filter(Shapefiles.title == shapefile_name).first()

            session.close()
            array_to_return = {
                'geojson': json.loads(shapefile_from_database.geometry),
                'name': shapefile_from_database.title
            }
        else:
            array_to_return = {
                'errorMessage': 'The shapefile could not be retrieved',
                'error': 'The shapefile could not be retrieved'
            }
    except Exception as e:
        array_to_return = {
            'errorMessage': 'The shapefile could not be retrieved',
            'error': str(e)
        }
    return JsonResponse(array_to_return)


def get_shapefile_names(request):
    try:
        list_of_names = []
        SessionMaker = app.get_persistent_store_database(Persistent_Store_Name, as_sessionmaker=True)
        session = SessionMaker()
        shapefiles = session.query(Shapefiles).all()

        for shapefile in shapefiles:
            list_of_names.append(shapefile.title)

        array_to_return = {'listOfShapefileNames': list_of_names}
        session.close()
    except Exception as e:
        array_to_return = {
            'listOfFiles': {
                'errorMessage': 'An error occurred while retrieving the files',
                'error': str(e)
            }
        }
    return JsonResponse(array_to_return)
