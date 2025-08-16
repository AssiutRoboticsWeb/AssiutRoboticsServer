
const Track = require('../mongoose.models/track');
const Course = require('../mongoose.models/course'); 
const asyncWrapper = require('../middleware/asyncWrapper');
const createError = require('../utils/createError');
const Member = require('../mongoose.models/member');
const Announcement = require('../mongoose.models/announcement');
// Create a new track
const createTrack = asyncWrapper(async (req, res, next) => {
    const {email} = req.decoded;
    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }
    const { name, description, courses, members, applicants, superVisors, HRs } = req.body;
    
    const track = new Track({
        name,
        description,
        courses: courses || [],
        committee:member.committee,
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
    const {email} = req.decoded;
    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });

    }
    let tracks=[];
    if(member.role === "member"){
        tracks = await Track.find();            
    }else{
        tracks = await Track.find({
            committee: member.committee
        });
    }
        // .populate('courses', 'name description')
        // .populate('members', 'name Avatar email')
        // .populate('applicants', 'name Avatar email')
        // .populate('superVisors', 'name Avatar email')
        // .populate('HRs', 'name Avatar email');
    
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
        // .populate('courses', 'name description')
        // .populate('committee', 'name email')
        // .populate('members', 'name email')
        // .populate('applicants', 'name email')
        // .populate('superVisors', 'name email')
        // .populate('HRs', 'name email');
    
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

// Announce track - إعلان عن تراك معين
const announceTrack = asyncWrapper(async (req, res, next) => {
    const { trackId } = req.params;
    const { title, content, dateOfDelete } = req.body;
    const { email } = req.decoded;

    // التحقق من وجود المستخدم
    const creator = await Member.findOne({ email });
    if (!creator) {
        return res.status(404).json({
            success: false,
            message: 'Creator not found'
        });
    }

    // التحقق من وجود الـ track
    const track = await Track.findById(trackId);
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }

    // إنشاء الإعلان
    const newAnnouncement = await Announcement.create({
        title,
        content,
        dateOfDelete,
        creator: creator._id,
        track: trackId
    });

    // إرسال الإعلان كرسالة لكل أعضاء الـ track
    const messageData = {
        title: `[${track.name}] ${title}`,
        body: content,
        date: new Date().toISOString()
    };

    await Member.updateMany(
        { _id: { $in: track.members } },
        { $push: { messages: messageData } }
    );

    res.status(201).json({
        success: true,
        message: 'Track announcement created and sent to members successfully',
        data: newAnnouncement
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
    removeApplicantFromTrack,
    announceTrack
};
