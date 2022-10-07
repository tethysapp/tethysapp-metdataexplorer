from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


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
    dimensional_variables = Column(JSON)
    file_type = Column(String(100))
    group = relationship("Groups", back_populates="files")
    title = Column(String(2000))
    urls = Column(JSON)
    variables = relationship("Variables", back_populates="file", cascade="all, delete, delete-orphan")

    def __init__(self, authentication, description, dimensional_variables, file_type, title, urls):
        self.authentication = authentication
        self.description = description
        self.dimensional_variables = dimensional_variables
        self.file_type = file_type
        self.title = title
        self.urls = urls


class Variables(Base):
    __tablename__ = 'variables'

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey('files.id'))
    file = relationship("Files", back_populates="variables")
    title = Column(String(2000))
    value_range = Column(JSON)

    def __init__(self, title, value_range):
        self.title = title
        self.value_range = value_range
