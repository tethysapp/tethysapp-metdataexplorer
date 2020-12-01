from tethys_sdk.base import TethysAppBase, url_map_maker


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
                name='api',
                url='metdataexplorer/api',
                controller='metdataexplorer.controllers.api'
            ),
            UrlMap(
                name='build_data_tree',
                url='metdataexplorer/buildDataTree',
                controller='metdataexplorer.controllers.build_data_tree'
            ),
            UrlMap(
                name='uploadShapefile',
                url='metdataexplorer/shapefile/uploadShapefile/',
                controller='metdataexplorer.shapefile.uploadShapefile'
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
        )

        return url_maps
