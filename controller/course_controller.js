const Course = require('../mongoose.models/course');
const Track = require('../mongoose.models/track');
const asyncWrapper = require('../middleware/asyncWrapper');

// Create a new course
const createCourse = asyncWrapper(async (req, res, next) => {
    const { name, description, tracks } = req.body;
    
    const course = new Course({
        name,
        description,
        tracks: tracks || []
    });
    
    const savedCourse = await course.save();
    
    res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: savedCourse
    });
});

// Get all courses
const getAllCourses = asyncWrapper(async (req, res, next) => {
    const courses = await Course.find()
        .populate('tracks', 'name description');
    
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});

// Get single course by ID
const getCourseById = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    
    const course = await Course.findById(id)
        .populate('tracks', 'name description');
    
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    
    res.status(200).json({
        success: true,
        data: course
    });
});

// Update course by ID
const updateCourse = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, tracks } = req.body;
    
    const course = await Course.findById(id);
    
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    
    course.name = name || course.name;
    course.description = description || course.description;
    course.tracks = tracks || course.tracks;
    
    await course.save();
       
    
    res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course
    });
});

// Delete course by ID
const deleteCourse = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    
    const course = await Course.findByIdAndDelete(id);
    
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
        data: course
    });
});

// Add track to course
const addTrackToCourse = asyncWrapper(async (req, res, next) => {
    const { courseId, trackId } = req.params;
    
    const course = await Course.findById(courseId);
    
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    const track = await Track.findById(trackId);
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }

    course.tracks.push(trackId);
    track.courses.push(courseId);
    await course.save();
    await track.save();
    

    res.status(200).json({
        success: true,
        message: 'Track added to course successfully',
        data: course
    });
});

// Remove track from course
    const removeTrackFromCourse = asyncWrapper(async (req, res, next) => {
    const { courseId, trackId } = req.params;
    
    const course = await Course.findById(courseId); 
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    const track = await Track.findById(trackId);
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    course.tracks.pull(trackId);
    track.courses.pull(courseId);
    await course.save();
    await track.save();
    
    res.status(200).json({
        success: true,
        message: 'Track removed from course successfully',
        data: course
    });
});

// Add task to course
const addTaskToCourse = asyncWrapper(async (req, res, next) => {
    const { courseId } = req.params;
    const { title, description, dueDate, file, startDate } = req.body;

    const course = await Course.findByIdAndUpdate(
        courseId,
        { $push: { tasks: { title, description, dueDate, file, startDate } } },
        { new: true, runValidators: true }
    );

    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Task added to course successfully',
        data: course
    });
});

// Remove task from course
const removeTaskFromCourse = asyncWrapper(async (req, res, next) => {
    const { courseId, taskId } = req.params;

    const course = await Course.findByIdAndUpdate(
        courseId,
        { $pull: { tasks: { _id: taskId } } },
        { new: true }
    );

    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Task removed from course successfully',
        data: course
    });
});
// Get all tasks for a course
const getTasksForCourse = asyncWrapper(async (req, res, next) => {
    const { courseId } = req.params;

    const course = await Course.findById(courseId, 'tasks');

    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }

    res.status(200).json({
        success: true,
        count: course.tasks.length,
        data: course.tasks
    });
});

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse,
    addTrackToCourse,
    removeTrackFromCourse,
    addTaskToCourse,
    removeTaskFromCourse,
    getTasksForCourse
};