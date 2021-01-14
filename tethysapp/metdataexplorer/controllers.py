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


def build_data_tree(request):
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


def metadata(request):
    url = request.GET['opendapURL']
    str_attrs = {}
    variables = []

    try:
        ds = netCDF4.Dataset(url)
    except OSError:
        exception = False
        return JsonResponse({'variables_sorted': exception})

    for attr in ds.__dict__:
        str_attrs[str(attr)] = str(ds.__dict__[attr])

    for var in ds.variables:
        variables.append(var)

    variables_sorted = sorted(variables)
    return JsonResponse({'variables_sorted': variables_sorted, 'attrs': str_attrs})


def get_dimensions(request):
    url = request.GET['opendapURL']
    variable = request.GET['variable']
    variables = {}
    var_attr = {}
    dimensions = []

    try:
        ds = netCDF4.Dataset(url)
    except OSError:
        exception = False
        return JsonResponse({'variables': exception})

    for dim in ds[variable].dimensions:
        dimensions.append(dim)

    for attr in ds[variable].__dict__:
        var_attr[str(attr)] = str(ds[variable].__dict__[attr])

    variables[variable] = var_attr

    dimensions.sort()
    return JsonResponse({'variables': variables, 'dims': dimensions})


def thredds_proxy(request):
    if 'main_url' in request.GET:
        request_url = request.GET['main_url']
        query_params = request.GET.dict()
        query_params.pop('main_url', None)
        r = requests.get(request_url, params=query_params)

        return HttpResponse(r.content, content_type="image/png")
    else:
        return JsonResponse({})
