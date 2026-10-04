import os
import boto3
import json

# AWS SageMaker runtime client
sagemaker_runtime = boto3.client(
    'sagemaker-runtime',
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    region_name=os.environ.get("AWS_REGION", "eu-central-1")
)

ENDPOINT_NAME = os.environ["SAGEMAKER_ENDPOINT_NAME"]


def predict(img_bytes: bytes, content_type: str = "image/jpeg") -> dict:
    """
    Volá AWS SageMaker endpoint s obrázkom auta.
    Vráti výsledok klasifikácie.
    """
    response = sagemaker_runtime.invoke_endpoint(
        EndpointName=ENDPOINT_NAME,
        ContentType=content_type,
        Body=img_bytes
    )
    result = json.loads(response['Body'].read().decode())
    return result
