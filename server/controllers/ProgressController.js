const Progress = require('../models/Progress');
const Student = require('../models/Student');
const Course = require('../models/Course');

const buildProgressPayload = (course, visitedModules = [], lastAccessed = null) => {
	const totalModules = course?.markdownContent?.length || 0;
	const visitedCount = visitedModules.length;
	const progress = totalModules > 0 ? Math.round((visitedCount / totalModules) * 100) : 0;

	let status = 'Not Started';
	if (progress > 0 && progress < 100) status = 'In Progress';
	if (progress >= 100) status = 'Completed';

	return {
		course: course?._id,
		visitedModules,
		lastAccessed,
		totalModules,
		progress,
		status,
	};
};

const getStudentProgress = async (req, res) => {
	try {
		const { courseId } = req.params;
		const uid = req.user.id;

		const student = await Student.findOne({ user: uid });
		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		const course = await Course.findById(courseId).select('markdownContent');
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		const progressDoc = await Progress.findOne({ student: student._id, course: courseId }).populate('visitedModules');
		if (!progressDoc) {
			return res.status(200).json(buildProgressPayload(course, [], null));
		}

		return res.status(200).json(
			buildProgressPayload(course, progressDoc.visitedModules || [], progressDoc.lastAccessed)
		);
	} catch (error) {
		console.error('Error fetching progress:', error);
		return res.status(500).json({ message: 'Error fetching progress', error: error.message });
	}
};

const updateStudentProgress = async (req, res) => {
	try {
		const { courseId } = req.params;
		const { moduleId, visitedModules } = req.body;
		const uid = req.user.id;

		const student = await Student.findOne({ user: uid });
		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		const course = await Course.findById(courseId).select('markdownContent');
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		let progressDoc = await Progress.findOne({ student: student._id, course: courseId });

		if (!progressDoc) {
			progressDoc = new Progress({
				student: student._id,
				course: courseId,
				visitedModules: [],
			});
		}

		if (Array.isArray(visitedModules)) {
			progressDoc.visitedModules = visitedModules;
		} else if (moduleId) {
			const alreadyVisited = progressDoc.visitedModules.some((id) => id.toString() === moduleId);
			if (!alreadyVisited) {
				progressDoc.visitedModules.push(moduleId);
			}
		} else {
			return res.status(400).json({ message: 'moduleId or visitedModules is required' });
		}

		progressDoc.lastAccessed = new Date();
		await progressDoc.save();
		await progressDoc.populate('visitedModules');

		return res.status(200).json(
			buildProgressPayload(course, progressDoc.visitedModules || [], progressDoc.lastAccessed)
		);
	} catch (error) {
		console.error('Error updating progress:', error);
		return res.status(500).json({ message: 'Error updating progress', error: error.message });
	}
};

module.exports = {
	getStudentProgress,
	updateStudentProgress,
};
