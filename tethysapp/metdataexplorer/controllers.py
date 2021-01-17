from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from tethys_sdk.permissions import login_required
from siphon.catalog import TDSCatalog
import requests
import netCDF4

from .model import Thredds, Groups
from .app import metdataexplorer as app


@login_required()
def home(request):

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    groups = session.query(Groups).all()
    thredds = session.query(Thredds).all()

    session.close()

    context = {
        'groups': groups,
        'thredds': thredds
    }
    return render(request, 'metdataexplorer/home.html', context)


def get_files_and_folders(request):
    url = request.GET['url']
    data_tree = {}
    folders_dict = {}
    files_dict = {}

    try:
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
    variables = []
    file_metadata = ''

    try:
        ds = netCDF4.Dataset(url)
    except OSError:
        exception = False
        return JsonResponse({'variables_sorted': exception})

    for metadata_string in ds.__dict__:
        file_metadata += '<b>' + str(metadata_string) + '</b><br><p>' + str(ds.__dict__[metadata_string]) + '</p>'

    for variable in ds.variables:
        variables.append(variable)

    variables_sorted = sorted(variables)
    return JsonResponse({'variables_sorted': variables_sorted, 'file_metadata': file_metadata})


def get_dimensions_and_variable_metadata(request):
    url = request.GET['opendapURL']
    variable = request.GET['variable']
    dimensions = []
    variable_metadata = ''

    try:
        ds = netCDF4.Dataset(url)
    except OSError:
        exception = False
        return JsonResponse({'variables': exception})

    for dimension in ds[variable].dimensions:
        dimensions.append(dimension)

    for metadata_string in ds[variable].__dict__:
        variable_metadata += '<b>' + str(metadata_string) + '</b><br><p>' + str(ds[variable].__dict__[metadata_string]) + '</p>'

    dimensions.sort()
    return JsonResponse({'dimensions': dimensions, 'variable_metadata': variable_metadata})


def thredds_proxy(request):
    if 'main_url' in request.GET:
        request_url = request.GET['main_url']
        query_params = request.GET.dict()
        query_params.pop('main_url', None)
        r = requests.get(request_url, params=query_params)

        return HttpResponse(r.content, content_type="image/png")
    else:
        return JsonResponse({})
