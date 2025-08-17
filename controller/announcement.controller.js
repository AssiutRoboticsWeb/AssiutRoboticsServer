const Announcement = require("../mongoose.models/announcement");
const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../utils/httpStatusText");
const createError = require("../utils/createError");
const Member = require("../mongoose.models/member");
const Track = require("../mongoose.models/track");

// إضافة إعلان
const addAnnouncement = asyncWrapper(async (req, res) => {
    const { title, content, dateOfDelete, trackId } = req.body;
    const email = req.decoded.email;

    const member = await Member.findOne({ email });
    if (!member) throw createError(404, httpStatusText.FAIL, "Member not found");

    if (trackId) {
        const track = await Track.findById(trackId);
        if (!track) throw createError(404, httpStatusText.FAIL, "Track not found");
    }
    if(track)
    // If the member is the head of the track's committee, allow adding related links
    if (!(member.role === 'head' && String(track.committee) === String(member.committee))) {
        throw createError(403, httpStatusText.FAIL, "You are not authorized to add this track");
    }
    const newAnnouncement = await Announcement.create({
        title,
        content,
        dateOfDelete,
        creator: member._id,
        track: trackId
    });

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: newAnnouncement,
        message: "Announcement added successfully"
    });
});

// جلب كل الإعلانات
const getAnnouncements = asyncWrapper(async (req, res) => {
    await Announcement.deleteMany({ dateOfDelete: { $lt: new Date() } });

    const announcements = await Announcement.find()
        .populate('creator', 'name email role committee phoneNumber avatar')
        .populate('track', 'name description committee');

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: announcements,
        message: "Announcements fetched successfully"
    });
});

// جلب إعلانات تراك محدد
const getTrackAnnouncements = asyncWrapper(async (req, res) => {
    const { trackId } = req.params;

    const track = await Track.findById(trackId);
    if (!track) throw createError(404, httpStatusText.FAIL, "Track not found");

    await Announcement.deleteMany({ track: trackId, dateOfDelete: { $lt: new Date() } });

    const announcements = await Announcement.find({ track: trackId })
        .populate('creator', 'name email role committee phoneNumber avatar')
        .populate('track', 'name description committee');

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: announcements,
        message: "Track announcements fetched successfully"
    });
});

// إرسال إعلان لأعضاء التراك
const sendTrackAnnouncementToMembers = asyncWrapper(async (req, res) => {
    const { trackId, title, content, dateOfDelete } = req.body;
    const email = req.decoded.email;

    const creator = await Member.findOne({ email });
    if (!creator) throw createError(404, httpStatusText.FAIL, "Creator not found");

    const track = await Track.findById(trackId).populate('members');
    if (!track) throw createError(404, httpStatusText.FAIL, "Track not found");

    const newAnnouncement = await Announcement.create({
        title,
        content,
        dateOfDelete,
        creator: creator._id,
        track: trackId
    });

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
        status: httpStatusText.SUCCESS,
        data: {
            announcement: newAnnouncement,
            sentToMembers: track.members.length
        },
        message: `Track announcement sent to ${track.members.length} members`
    });
});

// تعديل إعلان
const updateAnnouncement = asyncWrapper(async (req, res) => {
    const { title, content, dateOfDelete } = req.body;
    const announcementId = req.params.id;

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) throw createError(404, httpStatusText.FAIL, "Announcement not found");

    announcement.title = title;
    announcement.content = content;
    announcement.dateOfDelete = dateOfDelete;
    await announcement.save();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: announcement,
        message: "Announcement updated successfully"
    });
});

// حذف إعلان
const deleteAnnouncement = asyncWrapper(async (req, res) => {
    const announcementId = req.params.id;
    const announcement = await Announcement.findByIdAndDelete(announcementId);
    if (!announcement) throw createError(404, httpStatusText.FAIL, "Announcement not found");

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: announcement,
        message: "Announcement deleted successfully"
    });
});

module.exports = {
    addAnnouncement,
    getAnnouncements,
    getTrackAnnouncements,
    sendTrackAnnouncementToMembers,
    updateAnnouncement,
    deleteAnnouncement
};
