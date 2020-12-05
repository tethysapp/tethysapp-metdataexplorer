from sqlalchemy.orm import sessionmaker
from .model import Base, Thredds


def init_thredds_db(engine, first_time):
    """
    An example persistent store initializer function
    """
    # Create tables
    Base.metadata.create_all(engine)

    # Initial data
    if first_time:
        # Make session
        SessionMaker = sessionmaker(bind=engine)
        session = SessionMaker()
        session.close()
