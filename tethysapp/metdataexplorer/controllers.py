from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from tethys_sdk.permissions import login_required #, has_permission
from siphon.catalog import TDSCatalog
import requests
import netCDF4
import logging

from .model import Thredds, Groups
from .app import metdataexplorer as app

log = logging.getLogger('tethys.metdataexplorer')

@login_required()
def home(request):
    #ToDo fix permissions
    #demo_group = has_permission(request, 'edit_demo_group')

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    groups = session.query(Groups).all()
    thredds = session.query(Thredds).all()

    session.close()

    context = {
        'groups': groups,
        'thredds': thredds,
        'permission': True,#demo_group,
    }
    return render(request, 'metdataexplorer/home.html', context)


def get_files_and_folders(request):
    url = request.GET['url']
    data_tree = {}
    folders_dict = {}
    files_dict = {}

    try:
        #ToDo error on gfs catalog top folder, server error
        ds = TDSCatalog(url)
    except OSError:
        exception = 'Invalid URL'
        return JsonResponse({'dataTree': exception})

    folders = ds.catalog_refs
    for x in enumerate(folders):
        folders_dict[folders[x[0]].title] = folders[x[0]].href

    files = ds.datasets
    for x in enumerate(files):
        files_dict[files[x[0]].name] = files[x[0]].access_urls

    data_tree['folders'] = folders_dict
    data_tree['files'] = files_dict

    correct_url = ds.catalog_url
    return JsonResponse({'dataTree': data_tree, 'correct_url': correct_url})


def get_variables_and_file_metadata(request):
    url = request.GET['opendapURL']
    variables = {}
    file_metadata = ''

    try:
        ds = netCDF4.Dataset(url)
    except OSError:
        log.exception('get_variables_and_file_metadata')
        exception = False
        return JsonResponse({'variables_sorted': exception})

    for metadata_string in ds.__dict__:
        file_metadata += '<b>' + str(metadata_string) + '</b><br><p>' + str(ds.__dict__[metadata_string]) + '</p>'

    for variable in ds.variables:
        dimension_list = []
        for dimension in ds[variable].dimensions:
            dimension_list.append(dimension)
        array = {'dimensions': dimension_list, 'units': 'false', 'color': 'false'}
        variables[variable] = array

    return JsonResponse({'variables_sorted': variables, 'file_metadata': file_metadata})


def get_variable_metadata(request):
    url = request.GET['opendapURL']
    variable = request.GET['variable']
    variable_metadata = ''

    try:
        ds = netCDF4.Dataset(url)
    except OSError:
        exception = False
        return JsonResponse({'variables': exception})

    for metadata_string in ds[variable].__dict__:
        variable_metadata += '<b>' + str(metadata_string) + '</b><br><p>' + str(ds[variable].__dict__[metadata_string]) + '</p>'

    return JsonResponse({'variable_metadata': variable_metadata})


def thredds_proxy(request):
    if 'main_url' in request.GET:
        request_url = request.GET['main_url']
        query_params = request.GET.dict()
        query_params.pop('main_url', None)
        r = requests.get(request_url, params=query_params)

        return HttpResponse(r.content, content_type="image/png")
    else:
        return JsonResponse({})
