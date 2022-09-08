from django.http import JsonResponse, HttpResponse
from siphon.catalog import TDSCatalog
from tethys_sdk.permissions import login_required, has_permission

from .app import Metdataexplorer as app
from .databaseInterface import determine_dimension_type, get_variable_metadata

import cfbuild
import os
import netCDF4
import requests


def set_rc_vars():
    home_variable = app.get_custom_setting('server_home_directory')
    return home_variable


def reset_home_var(home_variable):
    if home_variable is not None:
        os.environ['HOME'] = home_variable
    else:
        os.environ.pop('HOME')


def get_files_and_folders_from_catalog(request):
    try:
        home_variable = set_rc_vars()
        dict_of_folders = {}
        dict_of_files = {}

        url_for_catalog = request.POST.get('urlForCatalog')
        ds = TDSCatalog(url_for_catalog)
        correct_url = ds.catalog_url
        list_of_folders = ds.catalog_refs
        list_of_files = ds.datasets

        for folder_counter in range(len(list_of_folders)):
            dict_of_folders[list_of_folders[folder_counter].title] = list_of_folders[folder_counter].href

        for file_counter in range(len(list_of_files)):
            access_url_array = {}

            for url_type in list_of_files[file_counter].access_urls:
                access_url_array[url_type.upper()] = list_of_files[file_counter].access_urls[url_type]

            dict_of_files[list_of_files[file_counter].name] = access_url_array

        dict_to_return = {
            'data': {
                'correctURL': correct_url,
                'files': dict_of_files,
                'folders': dict_of_folders
            }
        }

        reset_home_var(home_variable)
    except Exception as e:
        dict_to_return = {
            'data': {
                'errorMessage': 'An error occurred while connecting to the THREDDS catalog.',
                'error': str(e)
            }
        }
    return JsonResponse(dict_to_return)


def get_permissions_from_server(request):
    try:
        permissions = {
            'canDeleteGroups': has_permission(request, 'delete_groups'),
            'canAddGroups': has_permission(request, 'add_groups'),
        }
    except Exception as e:
        permissions = {
            'data': {
                'errorMessage': 'An error occurred while loading the page.',
                'error': str(e)
            }
        }
    return JsonResponse(permissions)


def get_variables_and_dimensions_for_file(request):
    try:
        home_variable = set_rc_vars()

        opendap_url = request.POST.get('opendapURL')
        list_of_variables = {}

        ds = cfbuild.Dataset(opendap_url)
        all_variables = []

        for variable in ds.variables:
            if variable.variable_type == 'Georeferenced Data Variable':
                list_of_dimensions = []
                all_variables.append(variable.name)

                for dimension in variable.dimensions:
                    list_of_dimensions.append(dimension)

                list_of_variables[variable.name] = list_of_dimensions

        dict_to_return = {
            'data': {
                'listOfVariables': list_of_variables,
                'allVariables': all_variables
            }
        }
        reset_home_var(home_variable)
    except Exception as e:
        dict_to_return = {
            'data': {
                'errorMessage': 'An error occurred while connecting to the THREDDS catalog.',
                'error': str(e)
            }
        }
    return JsonResponse(dict_to_return)


def update_dimensions(request):
    try:
        url = request.POST.get('url')
        dimensions = request.POST.getlist('dimensions[]')
        updated_values = {}
        url += '?'

        for dimension in dimensions:
            url += dimension
            if dimension != dimensions[len(dimensions) - 1]:
                url += ','

        ds = netCDF4.Dataset(url)

        for dimension in ds.dimensions:
            dimension_type = determine_dimension_type(ds.dimensions[dimension], ds.variables)
            dimension_metadata = get_variable_metadata(ds.variables[dimension])
            if dimension_type == 'time':
                if 'units' in dimension_metadata:
                    if 'calendar' in dimension_metadata:
                        calendar = dimension_metadata['calendar']
                    else:
                        calendar = 'standard'
                    date_time_list = netCDF4.num2date(ds.variables[dimension][:].data.tolist(),
                                                      dimension_metadata['units'], calendar)
                    values = []
                    for time in date_time_list:
                        values.append(str(time))
                    updated_values[dimension] = values
                else:
                    updated_values[dimension] = ds.variables[dimension][:].data.tolist()
            else:
                updated_values[dimension] = ds.variables[dimension][:].data.tolist()

        dict_to_return = {
            'data': {
                'updatedValues': updated_values
            }
        }
    except Exception as e:
        print(e)
        dict_to_return = {
            'data': {
                'errorMessage': 'An error occurred while connecting to the THREDDS catalog.',
                'error': str(e)
            }
        }
    return JsonResponse(dict_to_return)


def wms_image_from_server(request):
    try:
        if 'main_url' in request.GET:
            request_url = request.GET.get('main_url')
            query_params = request.GET.dict()
            query_params.pop('main_url', None)
            home_variable = set_rc_vars()
            r = requests.get(request_url, params=query_params)
            reset_home_var(home_variable)
            return HttpResponse(r.content, content_type="image/png")
        else:
            return JsonResponse({})
    except Exception as e:
        print(e)
        return JsonResponse({'error': e})


def legend_image_from_server(request):
    try:
        if 'main_url' in request.GET:
            request_url = request.GET.get('main_url')
            print(request_url)
            home_variable = set_rc_vars()
            r = requests.get(request_url)
            reset_home_var(home_variable)
            print('success')
            return HttpResponse(r.content, content_type="image/png")
        else:
            return JsonResponse({})
    except Exception as e:
        print(e)
        return JsonResponse({'error': e})
