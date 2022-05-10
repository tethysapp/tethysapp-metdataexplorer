==============================
NetCDF Formatting Requirements
==============================

Introduction
************

NetCDF files are one of the most popular formats for storing and distributing meteorological or earth observational
data. They have several advantages over other common file formats. The netCDF format is notable for its ease of use,
portability, simple data model, and strong user support. The netCDF format is made to be highly flexible, allowing
users to define and organize the data as they see best while still allowing the data to be shared across machines
and be self-describing, i.e. the data is human readable without reference to an external source.

Within the Met Data Explorer, the data displayed and analyzed in the app are retrieved from netCDF files that are
read from a THREDDS Data Server. To be compatible with the THREDDS Data Server and the services it provides which
the Met Data Explorer uses, the netCDF files on the THREDDS Data Server must be CF compliant
(the Climate and Forecast (CF) conventions are recommendations and standards for netCDF files) and adhere to
several additional guidelines.

This document outlines the CF conventions and additional guidelines to make netCDF files compatible
with the Met Data Explorer.

Dimension Names
***************
Many gridded datasets are spatiotemporal in nature, meaning that the data spans both space and time.
These datasets will have at least two spatial dimensions, defining a location on the earth, and a temporal dimension,
defining a point in time. These dimensions must be named correctly or the Met Data Explorer will not be able to parse
the dimensions correctly.

The dimension spanning the abscissa axis must contain x, lon, or longitude. We recommend naming this dimension x.
The dimension spanning the ordinate axis must contain y, lat, or latitude. We recommend naming this dimension y.
The time dimension must contain time or date. We recommend naming the temporal dimension time. If multiple dimensions
of the same type are needed, add an increasing number to the dimension name (e.g. time, time1, time2).
Additional dimensions (such as height, pressure, ect.) do not require specific names, but should be logical and
understandable.

|

.. image:: netcdf_images/F1.png
   :width: 800
   :align: center

|

Variables for Dimensions
************************
Every dimension in the netCDF file that contains values must have a corresponding variable that has the exact same
name as the dimension to which it corresponds. If there is a dimension named x then there must be a variable named
x, if there is a dimension named time then there must be a variable named time, ect. The dimension defines the shape
(number of values) and the variable lists the values, attributes, and other information for the dimension.
Each dimensional variable should contain certain attributes. The attributes that should be in each dimensional
variable are long_name - a descriptive name for the dimension that is human readable, standard_name - a standardized
name for the dimension (i.e. if using EPSG4325 the standard_name should be longitude for the x dimension and latitude
for the y dimension), units - the units used for the dimension (if latitude and longitude are used the units should be
degrees_north and degrees_east respectively), and calendar - specifying on which calendar the time dimension is based
(only needed for the time dimension).

|

.. image:: netcdf_images/F2.png
   :width: 800
   :align: center

|

Coordinate Reference Systems
****************************

All georeferenced data must be defined by a standard coordinate reference system
(crs). If the data does not conform to a standard crs then it cannot be transformed to be used with shapefiles or other
data. As an example, if latitude and longitude are used for global data, the latitude values must span from -90° to 90°
(not 0° to 180°) and longitude values must span from -180° to 180° (not 0° to 360°). This matches the standard crs
EPSG 4326.

|

.. image:: netcdf_images/F3.png
   :width: 800
   :align: center

|

NCML Files
**********

NetCDF Markup Language (ncml) is an xml file type specifically designed for modifying, reformatting, and aggregating
netCDF files. The easiest way to reconfigure netCDF files is often to create a ncml file. Below are some useful
elements for creating a ncml file.

|

.. image:: netcdf_images/F4.png
   :width: 800
   :align: center

|

Additional Resources
********************

CF Conventions: https://cfconventions.org/cf-conventions/cf-conventions.html

NCML Cookbook: https://docs.unidata.ucar.edu/thredds/ncml/current/ncml_cookbook.html