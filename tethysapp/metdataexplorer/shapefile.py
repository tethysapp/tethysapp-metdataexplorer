from django.http import JsonResponse
import geopandas
import os
import glob

from .geoserver import *


def shp_to_geojson(file_path):
    file_list = glob.glob(os.path.join(file_path, '*.shp'))
    filepath = file_list[0]
    file = os.path.basename(filepath)
    filename = os.path.splitext(file)[0]
    new_directory = os.path.join(os.path.dirname(__file__), 'workspaces', 'app_workspace')

    shpfile = geopandas.read_file(filepath)
    shpfile.to_file(os.path.join(new_directory, 'temp.geojson'), driver='GeoJSON')

    book = open(os.path.join(new_directory, 'temp.geojson'), "r")
    geojson_file = book.read()

    return geojson_file, filename


def upload_shapefile(request):
    files = request.FILES.getlist('files')
    shp_path = os.path.join(os.path.dirname(__file__), 'workspaces', 'user_workspaces')

    # write the new files to the directory
    for n, shp_file in enumerate(files):
        with open(os.path.join(shp_path, shp_file.name), 'wb') as dst:
            for chunk in files[n].chunks():
                dst.write(chunk)

    filepath = glob.glob(os.path.join(shp_path, '*.shp'))[0]
    filename = os.path.splitext(os.path.basename(filepath))[0]
    path_to_shp = os.path.join(shp_path, filename)

    return JsonResponse({'path_to_shp': path_to_shp, 'filename': filename})


def upload_shapefile_to_geoserver(request):
    workspace = request.GET['workspace']
    store_name = request.GET['storeName']
    path_to_shp = request.GET['pathToShp']
    filename = request.GET['filename']
    print(workspace)
    print(filename)
    print(store_name)
    print(path_to_shp)
    result = geoserver_upload_shapefile(path_to_shp, store_name, workspace)

    if not result:
        raise

    for shp_file in glob.glob(os.path.join(path_to_shp, '*')):
        if os.path.splitext(os.path.basename(shp_file))[0] == filename:
            os.remove(shp_file)
    return JsonResponse({'success': result})


def user_geojsons(request):
    geojson_path = os.path.join(os.path.dirname(__file__), 'workspaces', 'app_workspace')
    files = glob.glob(os.path.join(geojson_path, '*.geojson'))
    geojson = {}

    if len(files) == 0:
        geojson = False
    else:
        for file in files:
            geojson[os.path.basename(file)[:-8]] = geopandas.read_file(file)

    return JsonResponse({'geojson': geojson})

############################################################################################
