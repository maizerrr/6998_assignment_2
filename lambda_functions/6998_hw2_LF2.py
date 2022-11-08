import json
import uuid
import logging
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth

# AWS OpenSearch Endpoint
URL = "search-photos-mxqtft62qu6dwx3ybgmls2i2km.us-east-1.es.amazonaws.com"
INDEX = "photos"

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

client = boto3.client('lexv2-runtime')

def lambda_handler(event, context):
    logger.info(event)

    # validate event
    try:
        query = event["queryParams"]["q"]
        sessionId = str(uuid.uuid1())
        logger.info("Query '{}' passed to Lex".format(query))
    except Exception as e:
        logger.error("Exception encountered when parsing event")
        return {
            'statusCode': 500,
            'body': e
        }

    # input disambiguation with Lex
    response = client.recognize_text(botId='6LO7VOU6I8',
                                     botAliasId='TSTALIASID',
                                     localeId='en_US',
                                     sessionId=sessionId,
                                     text=query)
    
    _response = response.get("messages", [])
    if _response:
        response = _response[0]["content"]
        logger.info("response from Lex:\n{}".format(response))
    else:
        logger.error("Lex failed to parse user input.")
        return {
            'statusCode': 500,
            'body': "Lex failed to parse user input."
        }

    # search for corresponding photos
    credentials = boto3.Session().get_credentials()
    auth = AWSV4SignerAuth(credentials, 'us-east-1')
    es = OpenSearch(
        hosts = [{"host": URL, "port": 443}],
        http_auth = auth,
        use_ssl = True,
        verify_cets = True,
        connection_class = RequestsHttpConnection
    )
    query = {
        'size': 5,
        'query': {
            'multi_match': {
            'query': query,
            'fields': ['labels']
            }
        }
    }
    response = es.search(
        body = query,
        index = INDEX
    )
    logger.info("Photos found by OpenSearch:\n{}".format(response))

    return {
        'statusCode': 200,
        'body': None
    }