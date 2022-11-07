import json
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

def lambda_handler(event, context):
    # updated by CodePipeline
    logger.info(event)

    # validate event
    try:
        bucket = event["Records"][0]["s3"]["bucket"]["name"]
        photo = event["Records"][0]["s3"]["object"]["key"]
    except Exception as e:
        logger.error("Exception encountered when parsing event")
        return {
            'statusCode': 500,
            'body': e
        }

    client = boto3.client("rekognition")
    response = client.detect_labels(Image={'S3Object': {'Bucket': bucket, 'Name': photo}},
        MinConfidence=30,
        MaxLabels=5) 
    labels=response['CustomLabels']
    logger.info(response)

    return {
        'statusCode': 200,
        'body': json.dumps(labels)
    }