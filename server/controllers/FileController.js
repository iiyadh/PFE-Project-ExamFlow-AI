const Class = require('../models/Class');
const File = require('../models/File');
const Course = require('../models/Course');
const MarkdownContent = require('../models/MarkdownContent');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const uploadFile = async (req,res) =>{
    try{
        const { classId } = req.params;
        const file = req.file;

        // Forward the actual file to the AI service as multipart
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path), file.originalname);

        const response = await axios.post(`${AI_SERVICE_URL}/upload/`, formData, {
            headers: formData.getHeaders(),
        });

        // Clean up temp file
        fs.unlinkSync(file.path);

        const data = response.data;
        const newFile = new File({
            name: req.body.name || file.originalname,
            mimeType: req.body.mimeType || file.mimetype,
            modifiedTime: req.body.modifiedTime || new Date(),
            size: req.body.size || `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            status: 'pending',
            webViewLink: '',
            public_id: data.source,
        });
        const savedFile = await newFile.save();
        await Class.findByIdAndUpdate(classId, { $push: { files: savedFile._id } });
        res.status(201).json(savedFile);
    }catch(err){
        console.error('Error uploading file:', err);
        res.status(500).json({ message: 'Error uploading file', error: err.message });
    }
};

const getFilesByClass = async (req,res) =>{
    try{
        const { classId } = req.params;
        const classData = await Class.findById(classId).populate('files');
        res.status(200).json(classData.files);
    }catch(err){
        res.status(500).json({ message: 'Error fetching files', error: err });
    }
};

const convertFileToCourse = async (req,res) =>{
    try{
        const { classId } = req.body;
        const { fileId } = req.params;
        const fileData = await File.findById(fileId);
        if(!fileData){
            return res.status(404).json({ message: 'File not found' });
        }
        const response = await axios.post(`${AI_SERVICE_URL}/convert/`, { source: fileData.public_id });
        const courseData = response.data;
        console.log(courseData);
        return res.status(200).json(courseData);
        // Save each MarkdownContent document and collect their IDs
        const markdownIds = [];
        for (const item of courseData.markdownContent){
            const md = await new MarkdownContent({
                title: item.title,
                content: item.content,
            }).save();
            markdownIds.push(md._id);
        }

        const newCourse = new Course({
            title: courseData.title,
            description: courseData.description,
            level: courseData.level,
            image: courseData.image,
            markdownContent: markdownIds,
        });
        const savedCourse = await newCourse.save();

        // Update file status and link to course
        await File.findByIdAndUpdate(fileId, { status: 'converted', course: savedCourse._id });
        await Class.findByIdAndUpdate(classId, { $push: { courses: savedCourse._id } });
        res.status(201).json(savedCourse);
    }catch(err){
        console.error('Error converting file to course:', err);
        res.status(500).json({ message: 'Error converting file to course', error: err.message });
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
    deleteFile,
    convertFileToCourse,
};