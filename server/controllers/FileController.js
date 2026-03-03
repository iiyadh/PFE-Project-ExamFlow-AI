const Class = require('../models/Class');
const File = require('../models/File');

const uploadFile = async (req,res) =>{
    try{
        const { classId } = req.params;
        const { name , mimeType , modifiedTime, size, status ,webViewLink , public_id} = req.body;
        const newFile = new File({
            name,
            mimeType,
            modifiedTime,
            size,
            status,
            webViewLink,
            public_id
        });
        const savedFile = await newFile.save();
        await Class.findByIdAndUpdate(classId, { $push: { files: savedFile._id } });
        res.status(201).json(savedFile);
    }catch(err){
        res.status(500).json({ message: 'Error uploading file', error: err });
    }
}

const getFilesByClass = async (req,res) =>{
    try{
        const { classId } = req.params;
        const classData = await Class.findById(classId).populate('files');
        res.status(200).json(classData.files);
    }catch(err){
        res.status(500).json({ message: 'Error fetching files', error: err });
    }
};


const deleteFile = async (req,res) =>{
    try{
        const { fileId } = req.params;
        const deletedFile = await File.findByIdAndDelete(fileId);
        if(deletedFile){
            await Class.updateMany({ files: fileId }, { $pull: { files: fileId } });
            res.status(200).json({ message: 'File deleted successfully' });
        }else{
            res.status(404).json({ message: 'File not found' });
        }
    }catch(err){
        res.status(500).json({ message: 'Error deleting file', error: err });
    }
};

module.exports = {
    uploadFile,
    getFilesByClass,
    deleteFile
};