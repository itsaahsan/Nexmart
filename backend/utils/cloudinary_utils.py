import cloudinary
import cloudinary.uploader
from fastapi.concurrency import run_in_threadpool

from settings import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


async def upload_image(file) -> str:
    result = await run_in_threadpool(cloudinary.uploader.upload, file, folder="nexmart")
    return result["secure_url"]


async def delete_image(url: str) -> bool:
    try:
        parts = url.split("/")
        public_id = "/".join(parts[parts.index("upload") + 1:]).rsplit(".", 1)[0]
        await run_in_threadpool(cloudinary.uploader.destroy, public_id)
        return True
    except Exception:
        return False
