from django.http import JsonResponse
import geopandas
import os
import glob
import json

###################################################################################

# MAP CONTROLLERS

def rename_shp(request):
    try:
        shp_name = request.GET['shp_name'].strip('"')
        new_name = request.GET['new_name'].strip('"')
        directory = os.path.join(os.path.dirname(__file__), 'workspaces', 'app_workspace')
        os.rename(os.path.join(directory, shp_name + '.geojson'), os.path.join(directory, new_name + '.geojson'))
        result = True
    except:
        result = False

    return JsonResponse({'new_name': new_name, 'result': result})


def delete_shp(request):
    try:
        shp_name = request.GET['shp_name'].strip('"')
        directory = os.path.join(os.path.dirname(__file__), 'workspaces', 'app_workspace')
        os.remove(os.path.join(directory, shp_name + '.geojson'))
        result = True
    except:
        result = False

    return JsonResponse({'result': result})


####################################################################################

def shp_to_geojson(file_path):
    file_list = glob.glob(os.path.join(file_path, '*.shp'))
    filepath = file_list[0]
    file = os.path.basename(filepath)
    filename = os.path.splitext(file)[0]
    new_directory = os.path.join(os.path.dirname(__file__), 'workspaces', 'app_workspace')

    shpfile = geopandas.read_file(filepath)
    shpfile.to_file(os.path.join(new_directory, filename + '.geojson'), driver='GeoJSON')

    book = open(os.path.join(new_directory, filename + '.geojson'), "r")
    geojson_file = book.read()

    return geojson_file, filename


def uploadShapefile(request):
    files = request.FILES.getlist('files')
    shp_path = os.path.join(os.path.dirname(__file__), 'workspaces', 'user_workspaces')

    # write the new files to the directory
    for n, file in enumerate(files):
        with open(os.path.join(shp_path, file.name), 'wb') as dst:
            for chunk in files[n].chunks():
                dst.write(chunk)


    geojson, filename = shp_to_geojson(shp_path)
    filenames = json.dumps(filename)

    for file in glob.glob(os.path.join(shp_path, '*')):
        if os.path.splitext(os.path.basename(file))[0] == filename:
            os.remove(file)

    return JsonResponse({'filenames': filenames})

def user_geojsons(request):
    geojson_path = os.path.join(os.path.dirname(__file__), 'workspaces', 'app_workspace')
    files = glob.glob(os.path.join(geojson_path, '*.geojson'))
    geojson = []
    filenames = []

    for file in files:
        geojson.append(geopandas.read_file(file))
        filenames.append(os.path.basename(file)[:-8])

    geojson = json.dumps(geojson)
    filenames = json.dumps(filenames)
    return JsonResponse({'geojson': geojson, 'filenames': filenames})

############################################################################################