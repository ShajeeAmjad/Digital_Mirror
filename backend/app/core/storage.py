import boto3

from app.core.config import settings


def _s3_client() -> boto3.client:  # type: ignore[valid-type]
    return boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY,
        aws_secret_access_key=settings.R2_SECRET_KEY,
        region_name="auto",
    )


def generate_presigned_put(
    key: str,
    content_type: str,
    ttl: int = 300,
) -> str:
    client = _s3_client()
    url: str = client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.R2_BUCKET,
            "Key": key,
            "ContentType": content_type,
        },
        ExpiresIn=ttl,
    )
    return url
