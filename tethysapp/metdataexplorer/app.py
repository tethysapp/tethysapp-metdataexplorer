from tethys_sdk.app_settings import PersistentStoreDatabaseSetting, CustomSetting
from tethys_sdk.base import TethysAppBase

import os


class Metdataexplorer(TethysAppBase):
    """
    Tethys app class for Met Data Explorer Clean.
    """

    name = 'Met Data Explorer'
    index = 'home'
    icon = 'metdataexplorer/images/mde.png'
    package = 'metdataexplorer'
    root_url = 'metdataexplorer'
    color = '#5a6268'
    description = 'An app for viewing and analysing grided data servered from a THREDDS DATA SERVER.'
    tags = '"Hydrology", "Grided Data", "THREDDS"'
    enable_feedback = False
    feedback_emails = []

    controller_modules = ['controllers', 'gridsPackage', 'dataRemoteAccess', 'databaseInterface',
                          'authenticationCredentials']

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
