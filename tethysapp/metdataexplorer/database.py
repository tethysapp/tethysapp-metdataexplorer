from django.http import JsonResponse

from .model import Thredds
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
        url=database_info['url'],
        spatial=database_info['spatial'],
        color=database_info['colorRange'],
        description=database_info['description'],
        attributes=database_info['attributes'],
        time=database_info['time'],
        units=database_info['units'],
    )

    session.add(db)
    session.commit()

    session.close()

    success = 'Dababase Updated'
    return JsonResponse({'success': success})


def delete_container(request):
    array = request.GET.dict()

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    if array['all'] == 'true':
        session.query(Thredds).delete(synchronize_session=False)
    else:
        delete_url = session.query(Thredds).filter(Thredds.group == array['group']).filter(
            Thredds.title == array['title']).first()
        session.delete(delete_url)

    session.commit()
    success = True
    return JsonResponse({'success': success})

