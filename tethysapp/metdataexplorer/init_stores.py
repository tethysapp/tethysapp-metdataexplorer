from sqlalchemy.orm import sessionmaker
from .model import Base, Thredds, Groups


def init_thredds_db(engine, first_time):
    """
    An example persistent store initializer function
    """
    # Create tables
    Base.metadata.create_all(engine)

    # Initial data
    if first_time:
        # Make session
        SessionMaker = sessionmaker(bind=engine)
        session = SessionMaker()
        group_one = Groups(
            name='Demo Group',
            description='This group contains pre-configured containers of commonly used data. '
                        'You can configure your own containers in User Groups.',
        )
        group_two = Groups(
            name='User Group',
            description='You can configure custom groups to make your data accessible',
        )
        session.add(group_one)
        session.add(group_two)

        container_one = Thredds(
            server_type='file',
            name='Best GFS One Degree Forecast Time Series',
            group='Demo Group',
            title='GFS One Degree File',
            tags='GFS,Precipitation,Rain',
            url='opd:https://thredds.ucar.edu/thredds/dodsC/grib/NCEP/GFS/Global_onedeg/Best,wms:https://thredds.ucar.edu/thredds/wms/grib/NCEP/GFS/Global_onedeg/Best,sub:https://thredds.ucar.edu/thredds/ncss/grib/NCEP/GFS/Global_onedeg/Best',
            spatial='',
            color='0,0.001',
            description='This is the GFS One Degree Forecast File.',
            attributes='Precipitation_rate_surface,Precipitation_rate_surface_Mixed_intervals_Average',
            time='time1',
            units='mm',
            timestamp='false',
        )
        session.add(container_one)
        session.commit()
        session.close()
