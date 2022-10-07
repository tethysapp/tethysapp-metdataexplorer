from tethys_sdk.app_settings import PersistentStoreDatabaseSetting, CustomSetting
from tethys_sdk.base import TethysAppBase, url_map_maker

import os


class Metdataexplorer(TethysAppBase):
    """
    Tethys app class for Met Data Explorer Clean.
    """

    name = 'Met Data Explorer'
    index = 'metdataexplorer:home'
    icon = 'metdataexplorer/images/mde.png'
    package = 'metdataexplorer'
    root_url = 'metdataexplorer'
    color = '#5a6268'
    description = 'An app for viewing and analysing grided data servered from a THREDDS DATA SERVER.'
    tags = '"Hydrology", "Grided Data", "THREDDS"'
    enable_feedback = False
    feedback_emails = []

    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            # UrlMap(
            #     name='addCredentialToServer',
            #     url='addCredentialToServer/',
            #     controller='metdataexplorer.authenticationCredentials.write_authentication_credentials_to_file'
            # ),
            UrlMap(
                name='getCredentialsFromServer',
                url='getCredentialsFromServer/',
                controller='metdataexplorer.authenticationCredentials.get_authentication_credentials_from_file'
            ),
            UrlMap(
                name='removeCredentialsFromServer',
                url='removeCredentialsFromServer/',
                controller='metdataexplorer.authenticationCredentials.remove_authentication_credentials_from_file'
            ),
            UrlMap(
                name='addFileToDatabase',
                url='addFileToDatabase/',
                controller='metdataexplorer.databaseInterface.add_file_to_database'
            ),
            UrlMap(
                name='addGroupToDatabase',
                url='addGroupToDatabase/',
                controller='metdataexplorer.databaseInterface.add_group_to_database'
            ),
            UrlMap(
                name='addShapefileToDAtabase',
                url='addShapefileToDAtabase/',
                controller='metdataexplorer.databaseInterface.add_shapefile_to_database'
            ),
            UrlMap(
                name='calculateNewDataset',
                url='calculateNewDataset/',
                controller='metdataexplorer.databaseInterface.calculate_new_dataset'
            ),
            UrlMap(
               name='deleteFilesFromDatabase',
               url='deleteFilesFromDatabase/',
               controller='metdataexplorer.databaseInterface.delete_files_from_database'
            ),
            UrlMap(
                name='deleteGroupsFromDatabase',
                url='deleteGroupsFromDatabase/',
                controller='metdataexplorer.databaseInterface.delete_groups_from_database'
            ),
            UrlMap(
                name='deleteShapefileFromDatabase',
                url='deleteShapefileFromDatabase/',
                controller='metdataexplorer.databaseInterface.delete_shapefile_from_database'
            ),
            UrlMap(
               name='getAllGroupsFromDatabase',
               url='getAllGroupsFromDatabase/',
               controller='metdataexplorer.databaseInterface.get_all_groups_from_database'
            ),
            UrlMap(
                name='getAllThreddsFilesFromDatabase',
                url='getAllThreddsFilesFromDatabase/',
                controller='metdataexplorer.databaseInterface.get_all_files_from_a_group'
            ),
            UrlMap(
                name='getDisclaimerFromServer',
                url='getDisclaimerFromServer/',
                controller='metdataexplorer.databaseInterface.get_disclaimer'
            ),
            UrlMap(
                name='getShapefileCoordinatesFromDatabase',
                url='getShapefileCoordinatesFromDatabase/',
                controller='metdataexplorer.databaseInterface.get_shapefile_coordinates'
            ),
            UrlMap(
                name='getShapefileNamesFromDatabase',
                url='getShapefileNamesFromDatabase/',
                controller='metdataexplorer.databaseInterface.get_shapefile_names'
            ),
            UrlMap(
                name='getFoldersAndFilesFromCatalog',
                url='getFoldersAndFilesFromCatalog/',
                controller='metdataexplorer.dataRemoteAccess.get_files_and_folders_from_catalog'
            ),
            UrlMap(
                name='getPermissionsFromServer',
                url='getPermissionsFromServer/',
                controller='metdataexplorer.dataRemoteAccess.get_permissions_from_server'
            ),
            UrlMap(
                name='getVariablesAndDimensionsForFile',
                url='getVariablesAndDimensionsForFile/',
                controller='metdataexplorer.dataRemoteAccess.get_variables_and_dimensions_for_file'
            ),
            UrlMap(
                name='getWMSImageFromServer',
                url='getWMSImageFromServer/',
                controller='metdataexplorer.dataRemoteAccess.wms_image_from_server'
            ),
            UrlMap(
                name='getLegendImageFromServer',
                url='getLegendImageFromServer/',
                controller='metdataexplorer.dataRemoteAccess.legend_image_from_server'
            ),
            UrlMap(
                name='updateFileData',
                url='updateFileData/',
                controller='metdataexplorer.dataRemoteAccess.update_files'
            ),
            UrlMap(
                name='extractTimeseries',
                url='extractTimeseries/',
                controller='metdataexplorer.gridsPackage.extract_time_series_using_grids'
            ),
            UrlMap(
                name='formatParametersForGrids',
                url='formatParametersForGrids/',
                controller='metdataexplorer.gridsPackage.format_parameters_for_grids'
            ),
            UrlMap(
                name='home',
                url='metdataexplorer',
                controller='metdataexplorer.controllers.home'
            )
        )

        return url_maps

    def persistent_store_settings(self):
        ps_settings = (
            PersistentStoreDatabaseSetting(
                name='thredds_db',
                description='A database for storing thredds catalogs',
                initializer='metdataexplorer.init_stores.init_thredds_db',
                required=True
            ),
        )
        return ps_settings

    def custom_settings(self):
        """
        Example custom_settings method.
        """
        if 'HOME' in os.environ:
            home_variable = os.environ['HOME']
        else:
            home_variable = None

        if home_variable is not None:
            description = f'Path to the home directory (default: {home_variable}).'
            home_var_string = home_variable
        else:
            description = f'Path to the home directory'
            home_var_string = ''

        custom_settings = (
            CustomSetting(
                name='disclaimer_header',
                type=CustomSetting.TYPE_STRING,
                description='Disclaimer Header',
                required=False
            ),
            CustomSetting(
                name='disclaimer_message',
                type=CustomSetting.TYPE_STRING,
                description='Disclaimer Message',
                required=False
            ),
            CustomSetting(
                name='server_home_directory',
                type=CustomSetting.TYPE_STRING,
                description=description,
                default=home_var_string,
                required=True
            )
        )
        return custom_settings
