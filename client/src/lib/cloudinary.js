
export const uploadToCloudinary = async (file, folderName, id) => {
  try{
      const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  data.append("folder", folderName);
  data.append("public_id", `${folderName}/${id}`);

  let resourceType = 'auto';
  const mimeType = file.type?.toLowerCase() || '';
  
  if (mimeType.includes('image')) {
    resourceType = 'image';
  } else if (
    mimeType.includes('pdf') ||
    mimeType.includes('document') ||
    mimeType.includes('word') ||
    mimeType.includes('presentation') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('text')
  ) {
    resourceType = 'raw';
  }
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      body: data,
    }
  );
  return res.json();
  }catch(err){
    console.error("Cloudinary upload error:", err);
    throw err;
  }
};