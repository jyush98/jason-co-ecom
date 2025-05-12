import os
import boto3
from uuid import uuid4

AWS_REGION = os.getenv("AWS_REGION")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

def upload_inspiration_image(file) -> str:
    MAX_SIZE_MB = 10
    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}

    # check type
    if file.content_type not in ALLOWED_TYPES:
        raise ValueError("Only JPEG, PNG, or WEBP images are allowed.")

    # check size
    file.file.seek(0, 2)  # move to end
    size_mb = file.file.tell() / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise ValueError("Image file too large. Max 10MB.")

    file.file.seek(0)  # rewind for upload

    ext = file.filename.split(".")[-1]
    key = f"inspiration/{uuid4()}.{ext}"

    s3_client.upload_fileobj(
        file.file,
        AWS_S3_BUCKET,
        key,
        ExtraArgs={"ContentType": file.content_type}
    )

    return f"https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{key}"

