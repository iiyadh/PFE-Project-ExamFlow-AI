import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import requests
import os
from pypdf import PdfReader
import docx2txt


def get_signed_url(public_id):

    url, _ = cloudinary_url(
        public_id,
        resource_type="raw",
        type="authenticated",
        sign_url=True
    )

    return url


def download_file(url, filename):
    response = requests.get(url)

    with open(filename, "wb") as f:
        f.write(response.content)


def extract_text(file_path):

    if file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    if file_path.endswith(".docx"):
        return docx2txt.process(file_path)