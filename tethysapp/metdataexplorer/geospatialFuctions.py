from tethys_sdk.workspaces import get_app_workspace
from .app import Metdataexplorer as app

import os
import geojson
import geopandas as gpd


def print_geojson_to_file(geojson_geometry, filename):
    app_workspace = get_app_workspace(app)
    filepath = os.path.join(app_workspace.path, filename + '.geojson')
    with open(filepath, 'w') as f:
        geojson.dump(geojson_geometry, f)
    return filepath


def check_lat_lon_within(geo_bounds, bounds):
    bounds_keys = list(bounds.keys())
    if geo_bounds['lat']['min'] <= bounds[bounds_keys[1]]['min'] and geo_bounds['lat']['max'] \
            <= bounds[bounds_keys[1]]['min']:
        lat = 1
    elif geo_bounds['lat']['max'] >= bounds[bounds_keys[1]]['max'] and geo_bounds['lat']['min'] >= \
            bounds[bounds_keys[1]]['max']:
        lat = 2
    elif geo_bounds['lat']['min'] <= bounds[bounds_keys[1]]['min'] <= geo_bounds['lat']['max']:
        lat = 3
    elif geo_bounds['lat']['max'] >= bounds[bounds_keys[1]]['max'] >= geo_bounds['lat']['min']:
        lat = 4
    else:
        lat = 5
    if geo_bounds['lon']['min'] <= bounds[bounds_keys[0]]['min'] and geo_bounds['lon']['max'] \
            <= bounds[bounds_keys[0]]['min']:
        lon = 1
    elif geo_bounds['lon']['max'] >= bounds[bounds_keys[0]]['max'] and geo_bounds['lon']['min'] >= \
            bounds[bounds_keys[0]]['max']:
        lon = 2
    elif geo_bounds['lon']['min'] <= bounds[bounds_keys[0]]['min'] <= geo_bounds['lon']['max']:
        lon = 3
    elif geo_bounds['lon']['max'] >= bounds[bounds_keys[0]]['max'] >= geo_bounds['lon']['min']:
        lon = 4
    else:
        lon = 5
    case = [lat, lon]
    return case


def find_shift(coord, case):
    """
    case 0 1 - shift negative up by 180
    case 0 2 -
    case 0 3 -
    case 0 4 -
    case 0 5 - no shift
    case 1 1 - shift negative right by 360
    case 1 2 -
    case 1 3 -
    case 1 4 -
    case 1 5 - no shift
    """

    lon = coord[0]
    lat = coord[1]
    if case[0] == 1 or case[0] == 3:
        if lat < 0:
            lat += 180
    if case[1] == 1 or case[1] == 3:
        if lon < 0:
            lon += 360
    return [lon, lat]


def shift_shape_bounds(bounds, filepath):
    geojson_geometry = gpd.read_file(filepath)
    geo_bounds = {'lat': {'max': max(geojson_geometry.geometry.bounds['maxy']),
                          'min': min(geojson_geometry.geometry.bounds['miny'])},
                  'lon': {'max': max(geojson_geometry.geometry.bounds['maxx']),
                          'min': min(geojson_geometry.geometry.bounds['minx'])}}

    case = check_lat_lon_within(geo_bounds, bounds)

    if (case[0] == 1 or case[0] == 3) and (case[1] == 1 or case[1] == 3):
        x = 0
        new_geom = []

        properties_list = []

        for key in geojson_geometry.keys():
            if not key == "geometry":
                properties_list.append(key)

        for index, shape in enumerate(geojson_geometry['geometry']):
            new_shp = {}
            if shape.type == 'Point':
                lonlat = find_shift(shape.coords[0], case)
                new_shp = geojson.Point(tuple((lonlat[0], lonlat[1])))
            elif shape.type == 'Polygon':
                new_coords = []
                for coord in shape.exterior.coords:
                    lonlat = find_shift(coord, case)
                    new_coords.append(tuple((lonlat[0], lonlat[1])))
                new_shp = geojson.Polygon([new_coords])
            elif shape.type == 'MultiPolygon':
                multipolygons = []
                for shp in shape.geoms:
                    new_coords = []
                    for coord in shp.exterior.coords:
                        lonlat = find_shift(coord, case)
                        new_coords.append(tuple((lonlat[0], lonlat[1])))
                    poly = new_coords
                    multipolygons.append(poly)
                new_shp = geojson.MultiPolygon([multipolygons])
            properties = {}

            for feature_property in properties_list:
                properties[feature_property] = geojson_geometry[feature_property][index]

            new_feature = geojson.Feature(properties=properties, geometry=new_shp)
            new_geom.append(new_feature)
            x += 1
        new_fc = geojson.FeatureCollection(crs='CRS(' + str(geojson_geometry.crs) + ')', features=new_geom)
    else:
        new_fc = geojson_geometry

    new_filepath = print_geojson_to_file(new_fc, 'temp_two')
    return new_filepath
