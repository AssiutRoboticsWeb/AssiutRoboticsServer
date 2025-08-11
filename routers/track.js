const express = require("express");
const Router = express.Router();

const trackController = require('../controller/track_controller');

// ====== Track CRUD Operations ======

// Create a new track
Router.post("/", trackController.createTrack);

// Get all tracks
Router.get("/", trackController.getAllTracks);

// Get single track by ID
Router.get("/:id", trackController.getTrackById);

// Update track by ID
Router.put("/:id", trackController.updateTrack);

// Delete track by ID
Router.delete("/:id", trackController.deleteTrack);

// ====== Track Member Management ======

// Add member to track
Router.post("/:trackId/members/:memberId", trackController.addMemberToTrack);

// Remove member from track
Router.delete("/:trackId/members/:memberId", trackController.removeMemberFromTrack);

// ====== Track Applicant Management ======

// Add applicant to track
Router.post("/:trackId/applicants/:memberId", trackController.addApplicantToTrack);

// Remove applicant from track
Router.delete("/:trackId/applicants/:memberId", trackController.removeApplicantFromTrack);

module.exports = Router;