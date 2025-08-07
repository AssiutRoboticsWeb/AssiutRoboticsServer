const { Track, Course, Student, Assistant, Admin,  Task } = require('../mongoose.models/electric');
const asyncWrapper = require('../middleware/asyncWrapper');



// ========== Track APIs ==========
const addTrack = asyncWrapper(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ 
            status: 400, 
            message: "Name and description are required" 
        });
    }
    const track = new Track({ name, description });
    await track.save();
    res.status(201).json({ 
        status: 201, 
        message: "Track added successfully" 
    });
});

const updateTrack = asyncWrapper(async (req, res) => {
    const { name, description, trackId } = req.body;
    if (!name || !description || !trackId) {
        return res.status(400).json({ 
            status: 400, 
            message: "Name, description and trackId are required" 
        });
    }
    
    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ 
        status: 404, 
        message: "Track not found" 
    });
    
    track.name = name;
    track.description = description;
    await track.save();
    res.status(200).json({ 
        status: 200, 
        message: "Track updated successfully" 
    });
});

const deleteTrack = asyncWrapper(async (req, res) => {
    const { trackId } = req.body;
    if (!trackId) {
        return res.status(400).json({ 
            status: 400, 
            message: "trackId is required" 
        });
    }
    
    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ 
        status: 404, 
        message: "Track not found" 
    });
    
    await track.deleteOne();
    res.status(200).json({ 
        status: 200, 
        message: "Track deleted successfully" 
    });
});

const getTracks = asyncWrapper(async (req, res) => {
    const tracks = await Track.find();
    res.status(200).json({ 
        status: 200, 
        data: tracks 
    });
});

const getTrack = asyncWrapper(async (req, res) => {
    const { trackId } = req.body;
    if (!trackId) {
        return res.status(400).json({ 
            status: 400, 
            message: "trackId is required" 
        });
    }
    
    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ 
        status: 404, 
        message: "Track not found" 
    });
    
    res.status(200).json({ 
        status: 200, 
        data: track 
    });
});

// ========== Course APIs ==========
const addCourse = asyncWrapper(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ 
            status: 400, 
            message: "Name and description are required" 
        });
    }
    
    const course = new Course({ name, description });
    await course.save();
    res.status(201).json({ 
        status: 201, 
        message: "Course added successfully" 
    });
});

const updateCourse = asyncWrapper(async (req, res) => {
    const { name, description, courseId } = req.body;
    if (!name || !description || !courseId) {
        return res.status(400).json({ 
            status: 400, 
            message: "Name, description and courseId are required" 
        });
    }
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ 
        status: 404, 
        message: "Course not found" 
    });
    
    course.name = name;
    course.description = description;
    await course.save();
    res.status(200).json({ 
        status: 200, 
        message: "Course updated successfully" 
    });
});

const deleteCourse = asyncWrapper(async (req, res) => {
    const { courseId } = req.body;
    if (!courseId) {
        return res.status(400).json({ 
            status: 400, 
            message: "courseId is required" 
        });
    }
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ 
        status: 404, 
        message: "Course not found" 
    });
    
    await course.deleteOne();
    res.status(200).json({ 
        status: 200, 
        message: "Course deleted successfully" 
    });
});

const getCourses = asyncWrapper(async (req, res) => {
    const courses = await Course.find();
    res.status(200).json({ 
        status: 200, 
        data: courses 
    });
});

const getCourse = asyncWrapper(async (req, res) => {
    const { courseId } = req.body;
    if (!courseId) {
        return res.status(400).json({ 
            status: 400, 
            message: "courseId is required" 
        });
    }
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ 
        status: 404, 
        message: "Course not found" 
    });
    
    res.status(200).json({ 
        status: 200, 
        data: course 
    });
});

// ========== Task APIs ==========
const addTask = asyncWrapper(async (req, res) => {
    const { name, description, courseId } = req.body;
    if (!name || !description || !courseId) {
        return res.status(400).json({ 
            status: 400, 
            message: "Name, description and courseId are required" 
        });
    }
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ 
        status: 404, 
        message: "Course not found" 
    });
    
    const task = new Task({ name, description });
    course.tasks.push(task);
    await Promise.all([task.save(), course.save()]);
    
    res.status(201).json({ 
        status: 201, 
        message: "Task added successfully" 
    });
});

const updateTask = asyncWrapper(async (req, res) => {
    const { name, description, courseId, taskId } = req.body;
    if (!name || !description || !courseId || !taskId) {
        return res.status(400).json({ 
            status: 400, 
            message: "Name, description, courseId and taskId are required" 
        });
    }
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ 
        status: 404, 
        message: "Course not found" 
    });
    
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ 
        status: 404, 
        message: "Task not found" 
    });
    
    task.name = name;
    task.description = description;
    await Promise.all([task.save(), course.save()]);
    
    res.status(200).json({ 
        status: 200, 
        message: "Task updated successfully" 
    });
});

const deleteTask = asyncWrapper(async (req, res) => {
    const { courseId, taskId } = req.body;
    if (!courseId || !taskId) {
        return res.status(400).json({ 
            status: 400, 
            message: "courseId and taskId are required" 
        });
    }
    
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ 
        status: 404, 
        message: "Course not found" 
    });
    
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ 
        status: 404, 
        message: "Task not found" 
    });
    
    course.tasks.pull(taskId);
    await Promise.all([task.deleteOne(), course.save()]);
    
    res.status(200).json({ 
        status: 200, 
        message: "Task deleted successfully" 
    });
});

const getTask = asyncWrapper(async (req, res) => {
    const { taskId } = req.body;
    if (!taskId) {
        return res.status(400).json({ 
            status: 400, 
            message: "taskId is required" 
        });
    }
    
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ 
        status: 404, 
        message: "Task not found" 
    });
    
    res.status(200).json({ 
        status: 200, 
        data: task 
    });
});

const getAllTasksOfCourse = asyncWrapper(async (req, res) => {
    const { courseId } = req.params;
    if (!courseId) {
        return res.status(400).json({ 
            status: 400, 
            message: "courseId is required" 
        });
    }
    
    const course = await Course.findById(courseId).populate('tasks');
    if (!course) return res.status(404).json({ 
        status: 404, 
        message: "Course not found" 
    });
    
    res.status(200).json({ 
        status: 200, 
        data: course.tasks 
    });
});

// ========== Student APIs ==========
const addStudent = asyncWrapper(async (req, res) => {
    const { name, email, info, trackId } = req.body;
    if (!name || !email || !info || !trackId) {
        return res.status(400).json({ 
            status: 400, 
            message: "Name, email, info and trackId are required" 
        });
    }
    
    const student = new Student({ name, email, info });
    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ 
        status: 404, 
        message: "Track not found" 
    });
    
    track.students.push(student._id);
    await Promise.all([
        student.save(),
        track.save(),
        ...track.courses.map(course => 
            Course.findByIdAndUpdate(course, { $push: { students: student._id } })
        )
    ]);
    
    res.status(201).json({ 
        status: 201, 
        message: "Student added successfully" 
    });
});

const updateStudent = asyncWrapper(async (req, res) => {
    const { name, email, info, studentId } = req.body;
    if (!name || !email || !info || !studentId) {
        return res.status(400).json({ 
            status: 400, 
            message: "Name, email, info and studentId are required" 
        });
    }
    
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ 
        status: 404, 
        message: "Student not found" 
    });
    
    student.name = name;
    student.email = email;
    student.info = info;
    await student.save();
    
    res.status(200).json({ 
        status: 200, 
        message: "Student updated successfully" 
    });
});

const deleteStudentFromTrack = asyncWrapper(async (req, res) => {
    const { trackId, studentId } = req.body;
    if (!trackId || !studentId) {
        return res.status(400).json({ 
            status: 400, 
            message: "trackId and studentId are required" 
        });
    }
    
    const track = await Track.findById(trackId);
    if (!track) return res.status(404).json({ 
        status: 404, 
        message: "Track not found" 
    });
    
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ 
        status: 404, 
        message: "Student not found" 
    });
    
    track.students.pull(studentId);
    await Promise.all([
        track.save(),
        ...track.courses.map(course => 
            Course.findByIdAndUpdate(course, { $pull: { students: studentId } })
        )
    ]);
    
    res.status(200).json({ 
        status: 200, 
        message: "Student deleted from track successfully" 
    });
});

const deleteStudent = asyncWrapper(async (req, res) => {
    const { studentId } = req.body;
    if (!studentId) {
        return res.status(400).json({ 
            status: 400, 
            message: "studentId is required" 
        });
    }
    
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ 
        status: 404, 
        message: "Student not found" 
    });
    
    await student.deleteOne();
    res.status(200).json({ 
        status: 200, 
        message: "Student deleted successfully" 
    });
});

const getStudents = asyncWrapper(async (req, res) => {
    const students = await Student.find();
    res.status(200).json({ 
        status: 200, 
        data: students 
    });
});

const getStudent = asyncWrapper(async (req, res) => {
    const { studentId } = req.body;
    if (!studentId) {
        return res.status(400).json({ 
            status: 400, 
            message: "studentId is required" 
        });
    }
    
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ 
        status: 404, 
        message: "Student not found" 
    });
    
    res.status(200).json({ 
        status: 200, 
        data: student 
    });
});

// ========== Announcement and Application APIs ==========
const announceTrackToUsers = asyncWrapper(async (req, res) => {
    const { email, trackId, announcement } = req.body;
    if (!email || !trackId || !announcement) {
        return res.status(400).json({ 
            status: 400, 
            message: "Email, trackId and announcement are required" 
        });
    }
    
    const admin = await Admin.findOne({ email });
    const track = await Track.findById(trackId);
    if (!admin || !track) return res.status(404).json({ 
        status: 404, 
        message: "Admin or Track not found" 
    });
    
    const users = await User.find();
    const messages = users.map(user => {
        user.messages.push({
            title: `New Announcement for ${track.name}`,
            body: announcement,
            date: new Date()
        });
        return user.save();
    });
    
    await Promise.all(messages);
    
    res.status(200).json({ 
        status: 200, 
        message: "Announcement added to all users successfully" 
    });
});

const applyToTrack = asyncWrapper(async (req, res) => {
    const { trackId } = req.params;
    const { userId } = req.body;
    if (!trackId || !userId) {
        return res.status(400).json({ 
            status: 400, 
            message: "trackId and userId are required" 
        });
    }
    
    const track = await Track.findById(trackId);
    const user = await User.findById(userId);
    if (!track || !user) return res.status(404).json({ 
        status: 404, 
        message: "Track or User not found" 
    });
    
    const alreadyApplied = track.applicants.some(app => app.user.toString() === userId);
    if (alreadyApplied) return res.status(400).json({ 
        status: 400, 
        message: "User already applied" 
    });
    
    track.applicants.push({ user: userId, status: "pending" });
    await track.save();
    
    res.status(200).json({ 
        status: 200, 
        message: "Application submitted" 
    });
});

const getApplicantsByTrack = asyncWrapper(async (req, res) => {
    const { trackId } = req.params;
    if (!trackId) {
        return res.status(400).json({ 
            status: 400, 
            message: "trackId is required" 
        });
    }
    
    const track = await Track.findById(trackId)
        .populate("applicants.user", "name email");
    if (!track) return res.status(404).json({ 
        status: 404, 
        message: "Track not found" 
    });
    
    res.status(200).json({ 
        status: 200, 
        applicants: track.applicants 
    });
});

const respondToApplicant = asyncWrapper(async (req, res) => {
    const { trackId, userId } = req.params;
    const { status } = req.body;
    
    if (!trackId || !userId) {
        return res.status(400).json({ 
            status: 400, 
            message: "trackId and userId are required" 
        });
    }
    
    if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ 
            status: 400, 
            message: "Invalid status" 
        });
    }
    
    const track = await Track.findById(trackId);
    if (!track || !Array.isArray(track.applicants)) {
    return res.status(404).json({ status: 404, message: "Track or applicants list not found" });
}

const applicant = track.applicants.find(a => a.user.toString() === userId);

if (!applicant) {
    return res.status(404).json({ status: 404, message: "Applicant not found in this track" });
}

    
    applicant.status = status;
    await track.save();
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ 
        status: 404, 
        message: "User not found" 
    });
    
    user.messages.push({
        title: `Track Application ${status === "accepted" ? "Accepted" : "Rejected"}`,
        body: `Your application for ${track.name} has been ${status}.`,
        date: new Date()
    });
    
    await user.save();
    res.status(200).json({ 
        status: 200, 
        message: `Applicant ${status} and user notified.` 
    });
});

module.exports = {
    addTrack,
    updateTrack,
    deleteTrack,
    getTracks,
    getTrack,
    addCourse,
    updateCourse,
    deleteCourse,
    getCourses,
    getCourse,
    addTask,
    updateTask,
    deleteTask,
    getTask,
    getAllTasksOfCourse,
    addStudent,
    updateStudent,
    deleteStudentFromTrack,
    deleteStudent,
    getStudents,
    getStudent,
    announceTrackToUsers,
    applyToTrack,
    getApplicantsByTrack,
    respondToApplicant
};
