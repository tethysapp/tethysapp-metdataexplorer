from django.http import JsonResponse
import os
import geoalchemy2

from .model import Base, Thredds, Groups
from .app import metdataexplorer as app


def delete_all(request):

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    session.query(Thredds).delete(synchronize_session=False)
    session.query(Groups).delete(synchronize_session=False)

    session.commit()

    success = True
    return JsonResponse({'success': success})


def save_group(request):
    name = request.GET['name']
    description = request.GET['description']

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    db = Groups(name=name, description=description)

    session.add(db)
    session.commit()
    session.close()

    success = True
    return JsonResponse({'success': success})


def save_thredds(request):
    url = request.GET['url']
    name = request.GET['name']
    description = request.GET['description']
    #geojson = request.GET['map']
    tags = request.GET['tags']
    group = request.GET['group']

    path = os.path.join(os.path.dirname(__file__), 'workspaces', 'app_workspace', 'temp.geojson')
    book = open(path, "r")
    geojson = book.read()

    spatial = geoalchemy2.functions.ST_GeomFromGeoJSON(geojson)
    print(spatial)
    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    db = Thredds(url=url, name=name, description=description, spatial=spatial, tags=tags, group=group)

    session.add(db)
    session.commit()
    session.close()

    success = True
    return JsonResponse({'success': success})


def delete_group(request):
    group = request.GET['group']

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    session.query(Thredds).filter(Thredds.group == group).delete(synchronize_session=False)
    deletegroup = session.query(Groups).filter(Groups.name == group).first()

    session.delete(deletegroup)
    session.commit()

    success = True
    return JsonResponse({'success': success})


def delete_url(request):
    name = request.GET['name']
    group = request.GET['group']

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    deleteurl = session.query(Thredds).filter(Thredds.group == group).filter(Thredds.name == name).first()

    session.delete(deleteurl)
    session.commit()

    success = True
    return JsonResponse({'success': success})


def group_info(request):
    group = request.GET['group']
    group_array = {}

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    groups = session.query(Groups).filter(Groups.name == group).first()

    session.close()

    group_array['name'] = groups.name
    group_array['description'] = groups.description
    return JsonResponse({'group': group_array})


def thredds_info(request):
    name = request.GET['name']
    group = request.GET['group']
    array = {}

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    db = session.query(Thredds).filter(Thredds.group == group).filter(Thredds.name == name).first()

    session.close()

    array['name'] = db.name
    array['description'] = db.description
    array['url'] = db.url
    array['description'] = db.description
    array['spatial'] = db.spatial

    return JsonResponse({'array': array})

