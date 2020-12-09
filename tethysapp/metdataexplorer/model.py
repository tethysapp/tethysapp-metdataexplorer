from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, Integer

Base = declarative_base()

class Thredds(Base):
    __tablename__ = 'thredds'

    id = Column(Integer, primary_key=True)  # Record number.
    name = Column(String(100))
    url = Column(String(2083))
    description = Column(String(2000))
    spatial = Column(String(100))
    tags = Column(String(100))
    group = Column(String(100))

    def __init__(self, name, url, description, spatial, tags, group):
        self.name = name
        self.url = url
        self.description = description
        self.spatial = spatial
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

