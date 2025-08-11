const asyncWrapper = require('../middleware/asyncWrapper');
const Track = require('../mongoose.models/track');
const createError = require('../utils/createError');
const Member = require('../mongoose.models/member');




const createApplicant = asyncWrapper(async (req, res, next) => {
    const { trackId } = req.params;
    
    const track = await Track.findById(trackId);

    const {email} = req.decoded;
    
    const member = await Member.findOne({email});
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }
    track.applicants.push(member._id);
    await track.save();
    
    res.status(200).json({
        success: true,
        message: 'Applicant created successfully',
        data: track
    });
});



const acceptApplicant = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;
    
    const track = await Track.findById(trackId);
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    const member = await Member.findById(memberId);
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }
    
    track.applicants.find((applicant) => applicant.member.equals(member._id)).status = 'accepted';

    
    await track.save();
    
    res.status(200).json({
        success: true,
        message: 'Applicant accepted successfully',
        data: track
    });
});


const rejectApplicant = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;
    
    const track = await Track.findById(trackId);
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    const member = await Member.findById(memberId);
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }
    
    track.applicants.find((applicant) => applicant.member.equals(member._id)).status = 'rejected';
    await track.save();
    
    res.status(200).json({
        success: true,
        message: 'Applicant rejected successfully',
        data: track
    });
});



const getApplicants = asyncWrapper(async (req, res, next) => {
    
    
    const {email} = req.decoded;
    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }
    
    if(member.role !== "head"){
        return res.status(404).json({
            success: false,
            message: 'You are not allowed to get applicants'
        });
    }

    const tracks = await Track.find({ committee: member.committee },{name:1,applicants:1,committee:1})
    .populate('applicants.member', 'name email')

    res.status(200).json({
        success: true,
        data: tracks
    });
});








module.exports = {
    createApplicant,
    acceptApplicant,
    rejectApplicant,
    getApplicants
};