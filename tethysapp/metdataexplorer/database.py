from django.http import JsonResponse
import json
import os

from .model import Thredds
from .app import metdataexplorer as app


def update_database(request):
    database_info = json.loads(request.GET["data"])
    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()
    print(database_info)
    db = Thredds(
        server_type=database_info['type'],
        group=database_info['group'],
        title=database_info['title'],
        url=database_info['url'],
        epsg=database_info['epsg'],
        spatial=json.dumps(database_info['spatial']),
        description=database_info['description'],
        attributes=json.dumps(database_info['attributes']),
        timestamp=database_info['timestamp'],
    )

    session.add(db)
    session.commit()

    session.close()

    success = 'Dababase Updated'
    return JsonResponse({'success': success})


def delete_container(request):
    array = request.GET.dict()
    print(array)

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    if array['all'] == 'true':
        session.query(Thredds).delete(synchronize_session=False)
    else:
        delete_url = session.query(Thredds).filter(Thredds.group == array['group']).filter(
            Thredds.title == array['title']).first()
        session.delete(delete_url)

    session.commit()
    print(array['spatial'])
    if not array['spatial'] == 'false':
        os.remove(os.path.join(os.path.dirname(__file__), 'workspaces', 'app_workspace', array['spatial'] + '.geojson'))
    success = True
    return JsonResponse({'success': success})

