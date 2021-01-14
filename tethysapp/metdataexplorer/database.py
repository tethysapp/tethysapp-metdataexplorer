from django.http import JsonResponse
import json

from .model import Thredds, Groups
from .app import metdataexplorer as app


def update_database(request):
    database_info = request.GET.dict()
    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    db = Thredds(
        server_type=database_info['type'],
        name=database_info['name'],
        group=database_info['group'],
        title=database_info['title'],
        tags=database_info['tags'],
        url=database_info['URLS'],
        spatial=database_info['spatial'],
        color=database_info['colorRange'],
        description=database_info['description'],
        attributes=database_info['attributes'],
        time=database_info['timeDimensions'],
        units=database_info['units'],
    )

    session.add(db)
    session.commit()

    session.close()

    success = 'Dababase Updated'
    return JsonResponse({'success': success})


def delete_all(request):

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    session.query(Thredds).delete(synchronize_session=False)
    session.query(Groups).delete(synchronize_session=False)

    session.commit()

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

'''
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
    spatial = session.query(Thredds.spatial.ST_AsGeoJSON()).filter(Thredds.group == group).filter(Thredds.name == name).first()
    session.close()

    array['name'] = db.name
    array['description'] = db.description
    array['url'] = db.url
    array['description'] = db.description

    coordinates = {}
    spatial_array = json.loads(spatial[0])

    for list_one in spatial_array['coordinates']:
        coordinates['geometry'] = list_one

    array['spatial'] = {
        'type': 'Feature',
        'geometry': {
            "type": "Polygon",
            "coordinates": coordinates['geometry'],
        }
    }
    return JsonResponse({'array': array})
'''
