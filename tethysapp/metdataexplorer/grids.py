from django.http import JsonResponse, HttpResponse
import grids
import tempfile
import os
import json
# import urllib
import requests
# import pandas
# import math
import geopandas as gpd
# import netCDF4 as nc
from geojson import dump

from .timestamp import iterate_files


def get_full_array(request):
    attribute_array = json.loads(request.GET['containerAttributes'])
    data = organize_array(attribute_array)
    print(data)
    return JsonResponse({'result': data})


def organize_array(attribute_array):
    access_urls = {}
    variables = ''
    if attribute_array['timestamp'] == 'true':
        access_urls, file_name = iterate_files(attribute_array['url'])
    else:
        access_urls['OPENDAP'] = attribute_array['url'].split(',')[0][4:]
        access_urls['WMS'] = attribute_array['url'].split(',')[1][4:]
        access_urls['NetcdfSubset'] = attribute_array['url'].split(',')[2][4:]

    for variable in attribute_array['attributes']:
        variables += 'var=' + variable + '&'

    epsg = attribute_array['epsg']
    geojson_geometry, geojson_path = get_geojson_and_data(attribute_array['spatial'], epsg) #variables, access_urls['NetcdfSubset'],
    #files,

    data = {}
    for variable in attribute_array['attributes']:
        dims = attribute_array['attributes'][variable]['dimensions'].split(',')
        dim_order = (dims[0], dims[1], dims[2])
        stats_value = 'mean'
        timeseries = get_timeseries_at_geojson([access_urls['OPENDAP']], variable, dim_order, geojson_geometry)
        data[variable] = timeseries

    os.remove(geojson_path)
#    os.remove(files)
    return data


def get_geojson_and_data(spatial, epsg): #netcdf_subset_url,var,
    print(spatial)
    print(type(spatial))
    geojson_path = os.path.join(tempfile.gettempdir(), 'temp.json')
    if type(spatial) == dict:
        spatial['properties']['id'] = 'Shape'
        data = os.path.join(tempfile.gettempdir(), 'new_geo_temp.json')
        with open(data, 'w') as f:
            dump(spatial, f)
        geojson_geometry = gpd.read_file(data)
        os.remove(data)
    elif spatial[:4] == 'http':
        data = requests.Request('GET', spatial).url
        geojson_geometry = gpd.read_file(data)
    else:
        data = os.path.join(os.path.dirname(__file__), 'workspaces', 'app_workspace', spatial + '.geojson')
        geojson_geometry = gpd.read_file(data)

#    west = math.floor(min(geojson_geometry['geometry'].bounds['minx']) - 1)
#    south = math.floor(min(geojson_geometry['geometry'].bounds['miny']) - 1)
#    east = math.ceil(max(geojson_geometry['geometry'].bounds['maxx']) + 1)
#    north = math.ceil(max(geojson_geometry['geometry'].bounds['maxy']) + 1)
#    subset_url = netcdf_subset_url + '?' + var + 'north=' + str(north) + '&west=' + str(west) + '&east=' + str(east) + '&south=' + str(south) + '&disableProjSubset=on&horizStride=1&temporal=all'
#    path_to_netcdf = os.path.join(tempfile.gettempdir(), 'temp.nc')
#    urllib.request.urlretrieve(subset_url, path_to_netcdf)

    if not str(epsg) == 'false':
        print(str(geojson_geometry.crs)[5:])
        if not str(epsg)[:4] == str(geojson_geometry.crs)[5:]:
            geojson_geometry = geojson_geometry.to_crs('EPSG:' + str(epsg)[:4])
        if len(epsg) > 4:
            shift_lat = int(epsg.split(',')[2][2:])
            shift_lon = int(epsg.split(',')[1][2:])
            geojson_geometry['geometry'] = geojson_geometry.translate(xoff=shift_lon, yoff=shift_lat)

    return geojson_geometry, geojson_path #path_to_netcdf,


def get_timeseries_at_geojson(files, var, dim_order, geojson_geometry): # geojson_path, stats_value):
    series = grids.TimeSeries(files=files, var=var, dim_order=dim_order)
    timeseries_array = series.shape(vector=geojson_geometry, behavior='features', labelby='id')
    print(timeseries_array)
    # series.interp_units = True
    # data_frame = pandas.DataFrame()
    # data_frame.name = var
    # for index, row in geojson_geometry.iterrows():
    #    print(row.id)
    #    new_geom = gpd.GeoSeries(row.geometry)
    #    new_geom.to_file(geojson_path, driver="GeoJSON")
    #    timeseries = series.shape(geojson_path, )
    #    if index == 0:
    #        data_frame['datetime'] = timeseries['datetime']
    #        data_frame[row.id] = timeseries[stats_value]
    #    else:
    #        data_frame[row.id] = timeseries[stats_value]

    # ###############Remove when grids formats times#################
    # netcdf = nc.Dataset(files[0])
    # units = netcdf[dim_order[0]].units
    # times = netcdf[dim_order[0]][:]
    # time_list = []
    # for ti in times:
    #    t = nc.num2date(ti, units)
    #    time_list.append(str(t))
    # data_frame['datetime'] = time_list
    ################################################################
    return timeseries_array  # data_frame
