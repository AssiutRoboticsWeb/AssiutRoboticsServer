const express = require("express");
const Router = express.Router();

const { Admin, Assistant, User  } = require('../mongoose.models/electric');
const electricController = require('../controller/electric.controller');
const Member = require('../mongoose.models/member');




const adminValidate = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 400, message: "Admin email is required" });
    }
    try {
        // الأول نشوف هل موجود في الـ Admin collection
        let admin = await Member.findOne({ email });

        // لو مش موجود، ندور في members على role = "head"
        if (!admin) {
            admin = await Member.findOne({ email, role: "head" });
        }

        if (!admin) {
            return res.status(404).json({ status: 404, message: "Admin not found" });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Error checking admin" });
    }
};


const assistantValidate = async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ status: 400, message: "Assistant email is required" });
    }
    try {
        let assistant = await Assistant.findOne({ email });
        if (!assistant) {
            assistant = await Member.findOne({ email, role: "head" });
        }
        if (!assistant) {
            return res.status(404).json({ status: 404, message: "Assistant not found" });
        }
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Error checking assistant" });
    }
};

// ====== Student operations ======
Router.post("/addStudent", adminValidate, assistantValidate, electricController.addStudent);
Router.delete("/deleteStudent/:id", adminValidate, assistantValidate, electricController.deleteStudent);
Router.put("/updateStudent/:id", adminValidate, assistantValidate, electricController.updateStudent);
Router.get("/getAllStudents", electricController.getStudents);
Router.get("/getStudentById/:id", adminValidate, assistantValidate, electricController.getStudent);

// ====== Track operations ======
Router.post("/addTrack", electricController.addTrack);
Router.put("/updateTrack/:id", electricController.updateTrack);
Router.delete("/deleteTrack/:id", electricController.deleteTrack);
Router.get("/getAllTracks", electricController.getTracks);
Router.get("/getTrackById/:id", electricController.getTrack);

// ====== Course operations ======
Router.post("/addCourse", adminValidate, assistantValidate, electricController.addCourse);
Router.put("/updateCourse/:id", adminValidate, assistantValidate, electricController.updateCourse);
Router.delete("/deleteCourse/:id", adminValidate, assistantValidate, electricController.deleteCourse);
Router.get("/getAllCourses", electricController.getCourses);
Router.get("/getCourseById/:id", electricController.getCourse);

// ====== Task operations ======
Router.post("/addTaskTocourse", adminValidate, assistantValidate, electricController.addTask);
Router.put("/updateTaskOfCourse/:id", adminValidate, assistantValidate, electricController.updateTask);
Router.delete("/deleteTaskOfCourse/:id", adminValidate, assistantValidate, electricController.deleteTask);
Router.get("/getTaskById/:id", electricController.getTask);
Router.get("/getAllTasksOfCourse/:courseId", electricController.getAllTasksOfCourse);

// ====== Announcement ======
Router.post("/announceTrack", adminValidate, electricController.announceTrackToUsers);

// ====== Applicants ======
Router.post("/applyToTrack/:trackId", electricController.applyToTrack);
Router.get("/getApplicants/:trackId", adminValidate, electricController.getApplicantsByTrack);
Router.post("/respondToApplicant", adminValidate, electricController.respondToApplicant);


module.exports = Router;
