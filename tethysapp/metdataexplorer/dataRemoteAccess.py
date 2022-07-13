from django.http import JsonResponse, HttpResponse
from siphon.catalog import TDSCatalog
from tethys_sdk.permissions import login_required, has_permission
from .databaseInterface import determine_dimension_type, get_variable_metadata

import os
import netCDF4
import requests


def set_rc_vars():
    old_dodsrcfile = os.environ.get('DAPRCFILE')
    old_netrc = os.environ.get('NETRC')
    os.environ['DAPRCFILE'] = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                           'workspaces', 'app_workspace', '.dodsrc')
    os.environ['NETRC'] = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                       'workspaces', 'app_workspace', '.netrc')
    return old_dodsrcfile, old_netrc


def reset_rc_vars(old_dodsrcfile, old_netrc):
    if old_dodsrcfile is not None:
        os.environ['DAPRCFILE'] = old_dodsrcfile
    else:
        os.environ.pop('DAPRCFILE')
    if old_netrc is not None:
        os.environ['NETRC'] = old_netrc
    else:
        os.environ.pop('NETRC')


def get_files_and_folders_from_catalog(request):
    try:
        old_dodsrcfile, old_netrc = set_rc_vars()
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

        reset_rc_vars(old_dodsrcfile, old_netrc)
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
        old_dodsrcfile, old_netrc = set_rc_vars()

        opendap_url = request.POST.get('opendapURL')
        list_of_variables = {}

        ds = netCDF4.Dataset(opendap_url)
        all_variables = []

        for variable in ds.variables:
            list_of_dimensions = []
            all_variables.append(variable)

            # if len(ds[variable].dimensions) > 1:
            #     if variable != ds[variable].dimensions[0]:
            for dimension in ds[variable].dimensions:
                list_of_dimensions.append(dimension)

            list_of_variables[variable] = list_of_dimensions

        dict_to_return = {
            'data': {
                'listOfVariables': list_of_variables,
                'allVariables': all_variables
            }
        }
        reset_rc_vars(old_dodsrcfile, old_netrc)
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
            old_dodsrcfile, old_netrc = set_rc_vars()
            r = requests.get(request_url, params=query_params)
            reset_rc_vars(old_dodsrcfile, old_netrc)
            return HttpResponse(r.content, content_type="image/png")
        else:
            return JsonResponse({})
    except Exception as e:
        print(e)
        return JsonResponse({'error': e})
