import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import requests
import os
from pypdf import PdfReader
import docx2txt
from tenacity import retry, stop_after_attempt, wait_exponential


def get_signed_url(public_id):

    url, _ = cloudinary_url(
        public_id,
        resource_type="raw",
        type="authenticated",
        sign_url=True
    )

    return url


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def download_file(url, filename):
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        with open(filename, "wb") as f:
            f.write(response.content)
    except requests.Timeout as e:
        raise Exception(f"Timeout downloading file from URL. Details: {str(e)}")
    except requests.RequestException as e:
        raise Exception(f"Error downloading file: {str(e)}")


def extract_text(file_path):

    if file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    if file_path.endswith(".docx"):
        return docx2txt.process(file_path)