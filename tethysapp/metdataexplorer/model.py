from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Dimensions(Base):
    __tablename__ = 'dimensions'

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey('files.id'))
    file = relationship("Files", back_populates="dimensions")
    dimension_metadata = Column(JSON)
    dimension_type = Column(String(2000))
    has_variable = Column(String(2000))
    size = Column(JSON)
    title = Column(String(2000))
    values = Column(JSON)

    def __init__(self, dimension_metadata, dimension_type, has_variable, size, title, values):
        self.dimension_metadata = dimension_metadata
        self.has_variable = has_variable
        self.dimension_type = dimension_type
        self.size = size
        self.title = title
        self.values = values


class Groups(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True)
    description = Column(String(2000))
    files = relationship("Files", back_populates="group", cascade="all, delete, delete-orphan")
    title = Column(String(100))

    def __init__(self, title, description):
        self.title = title
        self.description = description


class Shapefiles(Base):
    __tablename__ = 'shapefiles'

    id = Column(Integer, primary_key=True)
    title = Column(String(100))
    geometry = Column(JSON)

    def __init__(self, title, geometry):
        self.title = title
        self.geometry = geometry


class Files(Base):
    __tablename__ = 'files'

    id = Column(Integer, primary_key=True)
    group_id = Column(Integer, ForeignKey('groups.id'))
    authentication = Column(JSON)
    description = Column(String(4000))
    dimensions = relationship("Dimensions", back_populates="file", cascade="all, delete, delete-orphan")
    file_metadata = Column(JSON)
    group = relationship("Groups", back_populates="files")
    title = Column(String(2000))
    urls = Column(JSON)
    variables = relationship("Variables", back_populates="file", cascade="all, delete, delete-orphan")

    def __init__(self, authentication, description, file_metadata, title, urls):
        self.authentication = authentication
        self.description = description
        self.file_metadata = file_metadata
        self.title = title
        self.urls = urls


class Variables(Base):
    __tablename__ = 'variables'

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey('files.id'))
    file = relationship("Files", back_populates="variables")
    dimensions = Column(JSON)
    title = Column(String(2000))
    shape = Column(JSON)
    value_range = Column(JSON)
    variable_metadata = Column(JSON)
    wms_display_color = Column(String(2000))

    def __init__(self, dimensions, title, shape, value_range, variable_metadata, wms_display_color):
        self.dimensions = dimensions
        self.title = title
        self.shape = shape
        self.value_range = value_range
        self.variable_metadata = variable_metadata
        self.wms_display_color = wms_display_color
