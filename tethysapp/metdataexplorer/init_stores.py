from sqlalchemy.orm import sessionmaker

from .model import Base
from .authenticationCredentials import make_files_for_authentication_credentials


# Initialize an empty database, if the database has not been created already.
def init_thredds_db(engine, first_time):
    Base.metadata.create_all(engine)
    # make_files_for_authentication_credentials()
    if first_time:
        SessionMaker = sessionmaker(bind=engine)
        session = SessionMaker()
        session.close()
