const Track = require('../mongoose.models/track');
const asyncWrapper = require('../middleware/asyncWrapper');

// Create a new track
const createTrack = asyncWrapper(async (req, res, next) => {
    const { name, description, courses, committee, members, applicants, superVisors, HRs } = req.body;
    
    const track = new Track({
        name,
        description,
        courses: courses || [],
        committee,
        members: members || [],
        applicants: applicants || [],
        superVisors: superVisors || [],
        HRs: HRs || []
    });
    
    const savedTrack = await track.save();
    
    res.status(201).json({
        success: true,
        message: 'Track created successfully',
        data: savedTrack
    });
});

// Get all tracks
const getAllTracks = asyncWrapper(async (req, res, next) => {
    const tracks = await Track.find()
        .populate('courses', 'name description')
        .populate('members', 'name Avatar email')
        .populate('applicants', 'name Avatar email')
        .populate('superVisors', 'name Avatar email')
        .populate('HRs', 'name Avatar email');
    
    res.status(200).json({
        success: true,
        count: tracks.length,
        data: tracks
    });
});

// Get single track by ID
const getTrackById = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    
    const track = await Track.findById(id)
        .populate('courses', 'name description')
        .populate('committee', 'name email')
        .populate('members', 'name email')
        .populate('applicants', 'name email')
        .populate('superVisors', 'name email')
        .populate('HRs', 'name email');
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    res.status(200).json({
        success: true,
        data: track
    });
});

// Update track by ID
const updateTrack = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
    
    const track = await Track.findByIdAndUpdate(
        id,
        updateData,
        { 
            new: true, 
            runValidators: true 
        }
    )
    .populate('courses', 'name description')
    .populate('committee', 'name email')
    .populate('members', 'name email')
    .populate('applicants', 'name email')
    .populate('superVisors', 'name email')
    .populate('HRs', 'name email');
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Track updated successfully',
        data: track
    });
});

// Delete track by ID
const deleteTrack = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    
    const track = await Track.findByIdAndDelete(id);
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Track deleted successfully',
        data: track
    });
});

// Add member to track
const addMemberToTrack = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;
    
    const track = await Track.findByIdAndUpdate(
        trackId,
        { $addToSet: { members: memberId } },
        { new: true }
    ).populate('members', 'name email');
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Member added to track successfully',
        data: track
    });
});

// Remove member from track
const removeMemberFromTrack = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;
    
    const track = await Track.findByIdAndUpdate(
        trackId,
        { $pull: { members: memberId } },
        { new: true }
    ).populate('members', 'name email');
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Member removed from track successfully',
        data: track
    });
});

// Add applicant to track
const addApplicantToTrack = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;
    
    const track = await Track.findByIdAndUpdate(
        trackId,
        { $addToSet: { applicants: memberId } },
        { new: true }
    ).populate('applicants', 'name email');
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Applicant added to track successfully',
        data: track
    });
});

// Remove applicant from track
const removeApplicantFromTrack = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;
    
    const track = await Track.findByIdAndUpdate(
        trackId,
        { $pull: { applicants: memberId } },
        { new: true }
    ).populate('applicants', 'name email');
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Applicant removed from track successfully',
        data: track
    });
});

module.exports = {
    createTrack,
    getAllTracks,
    getTrackById,
    updateTrack,
    deleteTrack,
    addMemberToTrack,
    removeMemberFromTrack,
    addApplicantToTrack,
    removeApplicantFromTrack
};







