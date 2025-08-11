const express = require("express");
const Router = express.Router();

const courseController = require('../controller/course_controller');

// ====== Course CRUD Operations ======

// Create a new course
Router.post("/", courseController.createCourse);

// Get all courses
Router.get("/", courseController.getAllCourses);

// Get single course by ID, Update course by ID, Delete course by ID
Router.route("/:id")
    .get(courseController.getCourseById)
    .put(courseController.updateCourse)
    .delete(courseController.deleteCourse);

// ====== Course Track Management ======

// Add track to course
Router.post("/:courseId/tracks/:trackId", courseController.addTrackToCourse);

// Remove track from course
Router.delete("/:courseId/tracks/:trackId", courseController.removeTrackFromCourse);

// ====== Course Task Management ======

// Add task to course
Router.post("/:courseId/tasks", courseController.addTaskToCourse);

// Remove task from course
Router.delete("/:courseId/tasks/:taskId", courseController.removeTaskFromCourse);

// Get all tasks for a course
Router.get("/:courseId/tasks", courseController.getTasksForCourse);

module.exports = Router;
