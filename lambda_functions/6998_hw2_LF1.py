import json
import logging
import boto3
from opensearchpy import OpenSearch, RequestsHttpConnection, AWSV4SignerAuth

# AWS OpenSearch Endpoint
URL = "search-photos-mxqtft62qu6dwx3ybgmls2i2km.us-east-1.es.amazonaws.com"
INDEX = "photos"

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

def lambda_handler(event, context):
    # updated by CodePipeline
    logger.info(event)

    # validate event
    try:
        bucket = event["Records"][0]["s3"]["bucket"]["name"]
        photo = event["Records"][0]["s3"]["object"]["key"]
        t = event["Records"][0]["eventTime"]
    except Exception as e:
        logger.error("Exception encountered when parsing event")
        return {
            'statusCode': 500,
            'body': e
        }
    
    # retrieve metadata
    document = {
        "objectKey": photo,
        "bucket": bucket,
        "createdTimestamp": t,
        "labels": []
    }
    client = boto3.client('s3')
    try:
        response = client.head_object(Bucket=bucket, key=photo)
        logger.info("metadata retrieved from s3:\n{}".format(response))
        labels = response["x-amz-meta-customlabels"].split(',')
        document["labels"] = labels
    except Exception as e:
        logger.error("failed to retrieve metadata from s3:\n{}".format(e))

    # image recognition
    client = boto3.client("rekognition")
    request = {'S3Object': {'Bucket': bucket, 'Name': photo}}
    logger.info(request)
    response = client.detect_labels(Image=request,
        MinConfidence=30,
        MaxLabels=5) 
    logger.info("retrieving labels from Rekognition\n{}".format(response))
    labels=response['Labels']

    # cleanup and add to OpenSearch
    for label in labels:
        document["labels"].append(label["Name"])
    credentials = boto3.Session().get_credentials()
    auth = AWSV4SignerAuth(credentials, 'us-east-1')
    es = OpenSearch(
        hosts = [{"host": URL, "port": 443}],
        http_auth = auth,
        use_ssl = True,
        verify_cets = True,
        connection_class = RequestsHttpConnection
    )
    response = es.index(
        index=INDEX,
        body=document,
        id=photo,
        refresh=True
    )
    logger.info("uploading metadata to OpenSearch\n{}".format(response))


    return {
        'statusCode': 200,
        'body': json.dumps(document)
    }