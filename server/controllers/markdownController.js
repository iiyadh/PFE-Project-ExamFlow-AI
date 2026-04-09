const MarkdownContent = require('../models/MarkdownContent');
const Course = require('../models/Course');


const getMarkdownContent = async (req,res) =>{
    try{
        
        const { coursId } = req.params;
        const course = await Course.findById(coursId).populate('markdownContent');
        if(!course){
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ markdownContent: course.markdownContent || [] });
    }catch(err){
        console.error('Error fetching markdown content:', err);
        res.status(500).json({ message: 'Error fetching markdown content', error: err.message });
    }
};

const addMarkdownContent = async (req,res) =>{
    try{
        const { coursId } = req.params;
        const { title, content } = req.body;
        const course = await Course.findById(coursId);
        if(!course){
            return res.status(404).json({ message: 'Course not found' });
        }
        const newMarkdown = new MarkdownContent({ title, content });
        await newMarkdown.save();
        course.markdownContent.push(newMarkdown._id);
        await course.save();
        res.status(201).json(newMarkdown);
    }catch(err){
        console.error('Error adding markdown content:', err);
        res.status(500).json({ message: 'Error adding markdown content', error: err.message });
    }
};

const editMarkdownContent = async (req,res) =>{
    try{
        const { markdownId } = req.params;
        const { title, content } = req.body;
        const updates = {};
        if(typeof title === 'string'){
            updates.title = title;
        }
        if(typeof content === 'string'){
            updates.content = content;
        }
        if(Object.keys(updates).length === 0){
            return res.status(400).json({ message: 'No valid fields to update' });
        }
        const updatedMarkdown = await MarkdownContent.findByIdAndUpdate(markdownId, updates, { new: true, runValidators: true });
        if(!updatedMarkdown){
            return res.status(404).json({ message: 'Markdown content not found' });
        }
        res.json(updatedMarkdown);
    }catch(err){
        console.error('Error editing markdown content:', err);
        res.status(500).json({ message: 'Error editing markdown content', error: err.message });
    }
};

const deleteMarkdownContent = async (req,res) =>{
    try{
        const { markdownId } = req.params;
        const deletedMarkdown = await MarkdownContent.findByIdAndDelete(markdownId);
        if(!deletedMarkdown){
            return res.status(404).json({ message: 'Markdown content not found' });
        }
        await Course.updateMany({ markdownContent: markdownId }, { $pull: { markdownContent: markdownId } });
        res.json({ message: 'Markdown content deleted successfully' });
    }
    catch(err){
        console.error('Error deleting markdown content:', err);
        res.status(500).json({ message: 'Error deleting markdown content', error: err.message });
    }
};

module.exports = {
    getMarkdownContent,
    editMarkdownContent,
    addMarkdownContent,
    deleteMarkdownContent
};
