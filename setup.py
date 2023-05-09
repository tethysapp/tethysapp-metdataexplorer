from setuptools import setup, find_namespace_packages
from setup_helper import find_all_resource_files

# -- Apps Definition -- #
namespace = 'tethysapp'
app_package = 'metdataexplorer'
release_package = 'tethysapp-' + app_package

# -- Python Dependencies -- #
dependencies = []

# -- Get Resource File -- #
resource_files = find_all_resource_files(app_package, namespace)




setup(
    name=release_package,
    version='2.0.0',
    description='An app for viewing and analysing gridded data served from a THREDDS DATA SERVER.',
    long_description='',
    keywords='netCDF, THREDDS, meteorological, gridded data',
    author='J Enoch Jones',
    author_email='jonenochjones@gmail.com',
    url='',
    license='',
    packages=find_namespace_packages(),
    package_data={'': resource_files},
    include_package_data=True,
    zip_safe=False,
    install_requires=dependencies,
)
