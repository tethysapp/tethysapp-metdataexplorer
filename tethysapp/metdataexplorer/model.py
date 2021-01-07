from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, Integer

from geoalchemy2 import Geometry

Base = declarative_base()

class Thredds(Base):
    __tablename__ = 'thredds'

    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    url = Column(String(2083))
    description = Column(String(2000))
    spatial = Column(Geometry('MULTIPOLYGON'))
    tags = Column(String(100))
    group = Column(String(100))

    def __init__(self, name, url, description, wkt, tags, group):
        self.name = name
        self.url = url
        self.description = description
        self.spatial = 'SRID=4326;MULTIPOLYGON{0}'.format(wkt)
        self.tags = tags
        self.group = group


class Groups(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True)  # Record number.
    name = Column(String(100))
    description = Column(String(2000))

    def __init__(self, name, description):
        self.name = name
        self.description = description

