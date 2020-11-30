from django.http import JsonResponse
import json
import requests
import os
import urllib
import netCDF4 as nc
import numpy as np
import pandas as pd

#############################Modified geomatics package##############################
def mean_of_timeseries(path: str, variable: str, time_dim: str):
    results = {}
    numlist = []
    time_list = []
    netcdf = nc.Dataset(path)

    units = netcdf[time_dim].units
    times = netcdf[time_dim][:]

    for ti in times:
        t = nc.num2date(ti, units)
        time_list.append(str(t))

    results['timeseries'] = time_list

    array = netcdf[variable][:]
    array[array == -9999] = np.nan

    for dat in array:
        numlist.append(np.nanmean(dat))

    results['mean'] = numlist
    df = pd.DataFrame(data=results)
    return df

###########################################################################################

def get_box_values(request):
    time = request.GET['time']
    subset_url = request.GET['subsetURL']
    var = request.GET['var']
    path_to_netcdf = os.path.join(os.path.dirname(__file__), 'workspaces', 'app_workspace', 'temp.nc')
    try:
        urllib.request.urlretrieve(json.loads(subset_url), path_to_netcdf)
    except RuntimeError:
        return JsonResponse({'data': 'Invalid file'})

    try:
        data = mean_of_timeseries(path_to_netcdf, var, time)
    except RuntimeError:
        return JsonResponse({'data': 'Invalid dimensions'})

    return JsonResponse({'data': data})
