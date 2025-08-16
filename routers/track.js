// routers/track.router.js
const express = require('express');
const router = express.Router();
const trackController = require('../controller/track_controller');
const jwt = require('../middleware/jwt');
router.use(jwt.verify);

// ====== Track CRUD Operations ======

// Create a new track
router.post('/',trackController.createTrack);

// Get all tracks
router.get('/',trackController.getAllTracks);

// Get single track by ID
router.route("/:id").get(trackController.getTrackById)
.get(trackController.getTrackById)
.put(trackController.updateTrack)
.delete(trackController.deleteTrack)


// Update track by ID
router.put('/:id',trackController.updateTrack);

// Delete track by ID
router.delete('/:id',trackController.deleteTrack);

// ====== Track Member Management ======

// Add member to track
router.put('/:trackId/members/:memberId',trackController.addMemberToTrack);

// Remove member from track
router.delete('/:trackId/members/:memberId',trackController.removeMemberFromTrack);

// ====== Track Applicant Management ======

// Add applicant to track
router.put('/:trackId/applicants/:memberId',trackController.addApplicantToTrack);

// Remove applicant from track
router.delete('/:trackId/applicants/:memberId',trackController.removeApplicantFromTrack);
// Remove applicant from track 
//Router.delete("/:trackId/applicants/:memberId", trackController.removeApplicantFromTrack,(req,res,next)=>{
//    next()
//});

// ====== Track Announcements ======

// Announce track
router.post('/:trackId/announce',trackController.announceTrack);

module.exports = router;
