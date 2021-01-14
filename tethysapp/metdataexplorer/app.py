from tethys_sdk.base import TethysAppBase, url_map_maker
from tethys_sdk.app_settings import PersistentStoreDatabaseSetting


class metdataexplorer(TethysAppBase):
    """
    Tethys app class for NetCDF Viewer.
    """

    name = 'Met Data Explorer'
    index = 'metdataexplorer:home'
    icon = 'metdataexplorer/images/nc.png'
    package = 'metdataexplorer'
    root_url = 'metdataexplorer'
    color = '#1600F0'
    description = 'An app for viewing files on a Thredds Data Server'
    tags = 'netCDF4, CHIRPS,'
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='metdataexplorer/',
                controller='metdataexplorer.controllers.home'
            ),
            UrlMap(
                name='buildDataTree',
                url='metdataexplorer/buildDataTree/',
                controller='metdataexplorer.controllers.build_data_tree'
            ),
            UrlMap(
                name='uploadShapefile',
                url='metdataexplorer/uploadShapefile/',
                controller='metdataexplorer.shapefile.upload_shapefile'
            ),
            UrlMap(
                name='userGeojson',
                url='metdataexplorer/userGeojsons/',
                controller='metdataexplorer.shapefile.user_geojsons'
            ),
            UrlMap(
                name='getBoxValues',
                url='metdataexplorer/getBoxValues/',
                controller='metdataexplorer.timeseries.get_box_values'
            ),
            UrlMap(
                name='metadata',
                url='metdataexplorer/metadata/',
                controller='metdataexplorer.controllers.metadata'
            ),
            UrlMap(
                name='getDimensions',
                url='metdataexplorer/getDimensions/',
                controller='metdataexplorer.controllers.get_dimensions'
            ),
            UrlMap(
                name='deleteContainer',
                url='metdataexplorer/deleteContainer/',
                controller='metdataexplorer.database.delete_container'
            ),
            UrlMap(
                name='threddsProxy',
                url='metdataexplorer/threddsProxy/',
                controller='metdataexplorer.controllers.thredds_proxy'
            ),
            UrlMap(
                name='updateDB',
                url='metdataexplorer/updateDB/',
                controller='metdataexplorer.database.update_database'
            ),
        )

        return url_maps

    def persistent_store_settings(self):
        ps_settings = (
            PersistentStoreDatabaseSetting(
                name='thredds_db',
                description='Database to store thredds URLs.',
                initializer='metdataexplorer.init_stores.init_thredds_db',
                required=True
            ),
        )

        return ps_settings
