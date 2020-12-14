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
                url='metdataexplorer',
                controller='metdataexplorer.controllers.home'
            ),
            UrlMap(
                name='build_data_tree',
                url='metdataexplorer/buildDataTree',
                controller='metdataexplorer.controllers.build_data_tree'
            ),
            UrlMap(
                name='uploadShapefile',
                url='metdataexplorer/shapefile/uploadShapefile/',
                controller='metdataexplorer.shapefile.upload_shapefile'
            ),
            UrlMap(
                name='user_geojson',
                url='metdataexplorer/shapefile/user_geojsons/',
                controller='metdataexplorer.shapefile.user_geojsons'
            ),
            UrlMap(
                name='get_box_values',
                url='metdataexplorer/timeseries/get_box_values/',
                controller='metdataexplorer.timeseries.get_box_values'
            ),
            UrlMap(
                name='metadata',
                url='metdataexplorer/metadata',
                controller='metdataexplorer.controllers.metadata'
            ),
            UrlMap(
                name='getDimensions',
                url='metdataexplorer/getDimensions',
                controller='metdataexplorer.controllers.get_dimensions'
            ),
            #UrlMap(
            #    name='deleteShapefile',
            #    url='metdataexplorer/shapefile/delete',
            #    controller='metdataexplorer.shapefile.delete_shp'
            #),
            UrlMap(
                name='saveThredds',
                url='metdataexplorer/database/saveThredds',
                controller='metdataexplorer.database.save_thredds'
            ),
            UrlMap(
                name='saveGroup',
                url='metdataexplorer/database/saveGroup',
                controller='metdataexplorer.database.save_group'
            ),
            UrlMap(
                name='deleteGroup',
                url='metdataexplorer/database/deleteGroup',
                controller='metdataexplorer.database.delete_group'
            ),
            UrlMap(
                name='deleteURL',
                url='metdataexplorer/database/deleteURL',
                controller='metdataexplorer.database.delete_url'
            ),
            UrlMap(
                name='deleteAll',
                url='metdataexplorer/database/deleteAll',
                controller='metdataexplorer.database.delete_all'
            ),
            UrlMap(
                name='groupInfo',
                url='metdataexplorer/database/groupInfo',
                controller='metdataexplorer.database.group_info'
            ),
            UrlMap(
                name='threddsInfo',
                url='metdataexplorer/database/threddsInfo/',
                controller='metdataexplorer.database.thredds_info'
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
