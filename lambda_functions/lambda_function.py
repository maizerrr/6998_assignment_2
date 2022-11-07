import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

def lambda_handler(event, context):
    # updated by CodePipeline
    logger.info(event)
    return {
        'statusCode': 200,
        'body': event
    }