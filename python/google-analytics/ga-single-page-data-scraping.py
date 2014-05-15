"""
accept a list if page urls, along with publication dates

return vists to those pages over a variety of date ranges after publication
"""

from oauth2client.client import AccessTokenRefreshError
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.file import Storage
from oauth2client.tools import run
from apiclient.discovery import build
from apiclient.errors import HttpError
import httplib2
import arrow
import time
import json

import ga_settings as SETTINGS

# set GA credentials
# TODO: move this out of the notebook
def build_service():
    """
    get tokens from a locally stored file, and create a service that pings google analytics.

    """

    GA_CLIENT_ID=SETTINGS.GA_CLIENT_ID 
    GA_CLIENT_SECRET=SETTINGS.GA_CLIENT_SECRET

    # <codecell>

    # set up an Oauth User Agent
    FLOW = OAuth2WebServerFlow( client_id=GA_CLIENT_ID,
        client_secret=GA_CLIENT_SECRET,
        scope='https://www.googleapis.com/auth/analytics.readonly',
        user_agent='analytics-api-v3-awesomeness')
    # Store tokens locally
    TOKEN_FILE_NAME = 'analytics.dat'
    # If we have a local copy of the crendial use that, otherwise ask google
    storage = Storage(TOKEN_FILE_NAME)
    credentials = storage.get()
    if not credentials or credentials.invalid:
      # Get a new token.
      credentials = run(FLOW, storage)
    credentials
    ## setup call to analytics API
    http = httplib2.Http()
    http = credentials.authorize(http)
    service = build('analytics', 'v3', http=http)
    return service


# id is the id for a google analytics tracking code
# filter_query is set to be the specific ga filter, in this case set to be visitors by source.
# profiles

def arrow_to_google_format_date(arrow_date):
    google_date = str(arrow_date.year) + "-" + str(arrow_date.month).zfill(2) + "-" + str(arrow_date.day).zfill(2)
    return google_date

def get_dates(pub_date, days_since_pub):
    start_date = arrow_to_google_format_date(arrow.get(pub_date))
    end_date = arrow_to_google_format_date(arrow.get(pub_date).replace(days=+days_since_pub))
    return start_date, end_date

def article_data_in_date_range(service, profile_id, article_id, metric, start_date, end_date):
    filters = 'ga:pagePath=~/e'+article_id+'*'
    query = service.data().ga().get(
        ids="ga:"+ profile_id,
        start_date=start_date,
        end_date=end_date,
        metrics='ga:'+ metric,
        filters=filters)
    json_results = query.execute()
    data = int(json_results["totalsForAllResults"]["ga:pageviews"])
    return data

def article_visits_in_date_range(service, profile_id, article_id, start_date, end_date):
    metric = "pageviews"
    data = article_data_in_date_range(service, profile_id, article_id, metric, start_date, end_date)
    return data

def article_visits_days_since_pub(service, profile_id, article_id, pub_date, days_since_pub):
    start_date, end_date = get_dates(pub_date, days_since_pub)
    data = article_visits_in_date_range(service, profile_id, article_id, start_date, end_date)
    return data

def article_visits_3_days_since_pub(service, profile_id, article_id, pub_date):
    days_since_pub = 2  # we look two days ahead, and so get three full days of data
    data = article_visits_days_since_pub(service, profile_id, article_id, pub_date, days_since_pub)
    return data

def article_visits_week_since_pub(service, profile_id, article_id, pub_date):
    days_since_pub = 6  # we look 6 days ahead, and so get data over 7 full days
    data = article_visits_days_since_pub(service, profile_id, article_id, pub_date, days_since_pub)
    return data

def article_visits_30_days_since_pub(service, profile_id, article_id, pub_date):
    days_since_pub = 29  # we look 29 days ahead, and so get data over 30 full days
    query = article_visits_days_since_pub(service, profile_id, article_id, pub_date, days_since_pub)
    return query

ARTICLE_LIST = "article-date-subject.txt"

def get_date_id(article_info):
    date = article_info[1]
    article_id = article_info[0].split("/")[1]
    return (article_id, date)

def get_article_id_from_article_string(article_string):
    return article_string.split(".")[1]

article_date_type = open(ARTICLE_LIST, "r").readlines()
article_date_type_tuple = [x.split() for x in article_date_type]
article_id_dates = [get_date_id(x) for x in article_date_type_tuple]

profile_id = "67087466" # HW
service = build_service()

for article_date in article_id_dates:
    article_id = get_article_id_from_article_string(article_date[0])
    pub_date = article_date[1]
    time.sleep(1)
    data = article_visits_week_since_pub(service, profile_id, article_id, pub_date)
    print article_id, pub_date, data

# days_since_publication = 7
# results = article_visits_days_since_pub(service, profile_id, article_id, pub_date, days_since_publication)
