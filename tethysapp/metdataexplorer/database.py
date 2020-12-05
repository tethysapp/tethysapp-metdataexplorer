from django.http import JsonResponse
from .model import Base, Thredds, Groups

from .app import metdataexplorer as app


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
    spatial = request.GET['map']
    tags = request.GET['tags']

    SessionMaker = app.get_persistent_store_database('thredds_db', as_sessionmaker=True)
    session = SessionMaker()

    db = Thredds(url=url, name=name, description=description, spatial=spatial, tags=tags)

    session.add(db)
    session.commit()
    session.close()

    success = True
    return JsonResponse({'success': success})
