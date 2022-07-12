
from django.shortcuts import render
from tethys_sdk.permissions import login_required, has_permission
from tethys_sdk.routing import controller
from .gridsPackage import *  # Why is the gridspackage not being recognized?
# EJones TMelcher NSwain


from .app import Metdataexplorer as app


@controller(
    name='home',
    url='metdataexplorer',
)
def home(request):
    """
    Controller for the app home page.
    """

    context = {
        'can_delete_groups': has_permission(request, 'delete_groups'),
        'can_add_groups': has_permission(request, 'add_groups'),
    }

    return render(request, 'metdataexplorer/home.html', context)

@controller(
    name='extractTimeseries',
    url='extractTimeseries/',
)
def extract_time_series_using_grids(request):
    import grids
    import json
    import os
    from django.http import JsonResponse
    try:
        if request.is_ajax() and request.method == 'POST':
            credentials = json.loads(request.POST.get('userCredentials'))
            dimensions = request.POST.getlist('dimensions[]')
            dimension_values = json.loads(request.POST.get('dimensionsAndValues'))
            geojson_feature = json.loads(request.POST.get('geojson'))
            geojson_type = request.POST.get('geojsonType')
            opendap_url = request.POST.get('opendapURL')
            variable = request.POST.get('variable')

            dimensions_for_grids, final_coordinates, formatted_values, filepath_to_geojson, filepath_to_shifted_geojson \
                = prep_parameters_for_grids(geojson_type, geojson_feature, dimensions, dimension_values)

            if credentials != 'none':
                grids_initializer = grids.TimeSeries([opendap_url], variable, dimensions_for_grids,
                                                     user=credentials['username'], pswd=credentials['password'])
            else:
                grids_initializer = grids.TimeSeries([opendap_url], variable, dimensions_for_grids)

            if geojson_type == 'marker':
                time_series = get_time_series_with_point(grids_initializer, formatted_values)
            elif geojson_type == 'rectangle':
                time_series = get_time_series_with_box(grids_initializer, formatted_values)
            else:
                time_series = get_time_series_with_shapefile(grids_initializer, formatted_values, filepath_to_shifted_geojson, 'dissolve')

            time_series['datetime'] = format_datetime(time_series['datetime'])

            os.remove(filepath_to_geojson)
            os.remove(filepath_to_shifted_geojson)

            time_series_array = {
                'timeSeries': time_series
            }
        else:
            time_series_array = {
                'errorMessage': 'The time series could not be retrieved',
                'error': 'The time series could not be retrieved',
            }
    except Exception as e:
        print(e)
        time_series_array = {
            'errorMessage': 'The time series could not be retrieved',
            'error': str(e)
        }
    return JsonResponse(time_series_array)


@controller(
    name='formatParametersForGrids',
    url='formatParametersForGrids/',
)
def format_parameters_for_grids(request):
    try:
        if request.is_ajax() and request.method == 'POST':
            credentials = json.loads(request.POST.get('userCredentials'))
            dimensions = request.POST.getlist('dimensions[]')
            dimension_values = json.loads(request.POST.get('dimensionsAndValues'))
            geojson_feature = json.loads(request.POST.get('geojson'))
            geojson_type = request.POST.get('geojsonType')
            opendap_url = request.POST.get('opendapURL')
            variable = request.POST.get('variable')

            dimensions_for_grids, final_coordinates, formatted_values, filepath_to_geojson, filepath_to_shifted_geojson \
                = prep_parameters_for_grids(geojson_type, geojson_feature, dimensions, dimension_values)

            if credentials != 'none':
                grids_initializer = f"grids_time_series = grids.TimeSeries(['{opendap_url}'], '{variable}', " \
                                    f"{dimensions_for_grids}, user='{credentials['username']}', " \
                                    f"pswd='{credentials['password']}')"
            else:
                grids_initializer = f"grids_time_series = grids.TimeSeries(['{opendap_url}'], " \
                                    f"'{variable}', {dimensions_for_grids})"

            if geojson_type == 'marker':
                if len(formatted_values[0]) == 1:
                    time_series = f"time_series = grids_time_series.point({formatted_values[0][1]})"
                elif len(formatted_values[0]) == 2:
                    time_series = f"time_series = grids_time_series.point({formatted_values[0][0]}, {formatted_values[0][1]})"
                elif len(formatted_values[0]) == 3:
                    time_series = f"time_series = grids_time_series.point({formatted_values[0][0]}, {formatted_values[0][1]}, " \
                                  f"{formatted_values[0][2]})"
                elif len(formatted_values[0]) == 4:
                    time_series = f"time_series = grids_time_series.point({formatted_values[0][0]}, {formatted_values[0][1]}, " \
                                  f"{formatted_values[0][2]}, {formatted_values[0][3]})"
                elif len(formatted_values[0]) == 5:
                    time_series = f"time_series = grids_time_series.point({formatted_values[0][0]}, {formatted_values[0][1]}, " \
                                  f"{formatted_values[0][2]}, {formatted_values[0][3]}, {formatted_values[0][4]})"
            elif geojson_type == 'rectangle':
                time_series = f"time_series = grids_time_series.bound({formatted_values[0]}, {formatted_values[1]}, stats='all')"
            else:
                time_series = f"time_series = grids_time_series.shape('Add the filepath to your geojson here!', behavior='dissolve', stats='all')"

            os.remove(filepath_to_geojson)
            os.remove(filepath_to_shifted_geojson)

            formatted_array = {
                'gridsInitializer': grids_initializer,
                'timeSeries': time_series
            }
        else:
            formatted_array = {
                'errorMessage': 'Failed to generate the notebook',
                'error': 'Failed to generate the notebook'
            }
    except Exception as e:
        print(e)
        formatted_array = {
            'errorMessage': 'Failed to generate the notebook',
            'error': str(e)
        }
    return JsonResponse(formatted_array)