const express = require("express");
const Router = express.Router();

const { Admin, Assistant, User } = require('../mongoose.models/electric');
const electricController = require('../controller/electric.controller');

// ====== Middlewares ======
const adminValidate = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 400, message: "Admin email is required" });
    }
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ status: 404, message: "Admin not found" });
        }
        next();
    } catch (err) {
        res.status(500).json({ status: 500, message: "Error checking admin" });
    }
};

const assistantValidate = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 400, message: "Assistant email is required" });
    }
    try {
        const assistant = await Assistant.findOne({ email });
        if (!assistant) {
            return res.status(404).json({ status: 404, message: "Assistant not found" });
        }
        next();
    } catch (err) {
        res.status(500).json({ status: 500, message: "Error checking assistant" });
    }
};

// ====== Student operations ======
Router.post("/addStudent", adminValidate, assistantValidate, electricController.addStudent);
Router.delete("/deleteStudent", adminValidate, assistantValidate, electricController.deleteStudent);
Router.put("/updateStudent", adminValidate, assistantValidate, electricController.updateStudent);
Router.get("/getAllStudents", electricController.getStudents);
Router.get("/getStudentById", adminValidate, assistantValidate, electricController.getStudent);

// ====== Track operations ======
Router.post("/addTrack", electricController.addTrack);
Router.put("/updateTrack", electricController.updateTrack);
Router.delete("/deleteTrack", electricController.deleteTrack);
Router.get("/getAllTracks", electricController.getTracks);
Router.get("/getTrackById", electricController.getTrack);

// ====== Course operations ======
Router.post("/addCourse", adminValidate, assistantValidate, electricController.addCourse);
Router.put("/updateCourse", adminValidate, assistantValidate, electricController.updateCourse);
Router.delete("/deleteCourse", adminValidate, assistantValidate, electricController.deleteCourse);
Router.get("/getAllCourses", electricController.getCourses);
Router.get("/getCourseById", electricController.getCourse);

// ====== Task operations ======
Router.post("/addTaskTocourse", adminValidate, assistantValidate, electricController.addTask);
Router.put("/updateTaskOfCourse", adminValidate, assistantValidate, electricController.updateTask);
Router.delete("/deleteTaskOfCourse", adminValidate, assistantValidate, electricController.deleteTask);
Router.get("/getTaskById", electricController.getTask);
Router.get("/getAllTasksOfCourse/:courseId", electricController.getAllTasksOfCourse);

// ====== Announcement ======
Router.post("/announceTrack", adminValidate, electricController.announceTrackToUsers);

// ====== Applicants ======
Router.post("/applyToTrack/:trackId", electricController.applyToTrack); // ✅ modified: use params
Router.get("/getApplicants/:trackId", adminValidate, electricController.getApplicantsByTrack);
Router.post("/respondToApplicant", adminValidate, electricController.respondToApplicant); // ✅ unified with controller



module.exports = Router;
