from django.http import JsonResponse, HttpResponse

from .app import metdataexplorer as app


def geoserver_create_workspace(workspace_name):
    engine = app.get_spatial_dataset_service('geoserver', as_engine=True)
    engine.create_workspace(workspace_id=workspace_name, uri='http://localhost:8000/apps/metdataexplorer/' + workspace_name + '/')


def geoserver_upload_shapefile(path_to_shp, filename):
    engine = app.get_spatial_dataset_service('geoserver', as_engine=True)
    result = engine.create_shapefile_resource(store_id='MetData:' + filename, shapefile_base=path_to_shp, overwrite=True)
    if not result['success']:
        raise


def delet_geoserver_layer(layer_id):
    engine = app.get_spatial_dataset_service('geoserver', as_engine=True)
    result = engine.delete_layer(layer_id, store_id=None, purge=False, recurse=False, debug=False)
    if not result['success']:
        raise


def list_geoserver_layers(request):
    engine = app.get_spatial_dataset_service('geoserver', as_engine=True)
    result = engine.list_layers(with_properties=False, debug=False)
    print(result)
    if not result['success']:
        raise
    return JsonResponse({'result': result['result']})
