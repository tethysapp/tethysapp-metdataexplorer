from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, Integer

Base = declarative_base()


class Thredds(Base):
    __tablename__ = 'thredds'

    id = Column(Integer, primary_key=True)
    server_type = Column(String(100))
    name = Column(String(2000))
    group = Column(String(100))
    title = Column(String(2000))
    tags = Column(String(2000))
    url = Column(String(2000))
    spatial = Column(String(2000))
    color = Column(String(100))
    description = Column(String(4000))
    attributes = Column(String(20000))
    time = Column(String(100))
    units = Column(String(100))

    def __init__(self, server_type, name, group, title, tags, url, spatial, description, color, attributes, time, units):
        self.server_type = server_type
        self.name = name
        self.group = group
        self.title = title
        self.tags = tags
        self.url = url
        self.spatial = spatial
        self.description = description
        self.color = color
        self.attributes = attributes
        self.time = time
        self.units = units


class Groups(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True)  # Record number.
    name = Column(String(100))
    description = Column(String(2000))

    def __init__(self, name, description):
        self.name = name
        self.description = description
