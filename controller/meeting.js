const Meeting = require("../mongoose.models/meeting");
const Member = require("../mongoose.models/member");
const asyncWrapper = require("../middleware/asyncWrapper");


const createMeeting = asyncWrapper(async (req, res) => {
    const { title, members } = req.body;
    const email = req.decoded.email;
    console.log(`[CreateMeeting] User: ${email}, Title: ${title}, Members: ${members}`);

    const member = await Member.findOne({ email });
    if (!member) {
        console.error(`[CreateMeeting Error] Member not found. Email: ${email}`);
        return res.status(404).json({ status: 404, message: "Member not found" });
    }
    let tableOfDates = [];
    for (let i = 0; i < 7; i++) {
        let day = [];
        for (let j = 8; j < 24; j++) {
            day.push({
                time: `${j}:00`,
                isBooked: false,
                bookedBy: []
            });
        }
        tableOfDates.push(day);
    }
    const meeting = new Meeting({
        title,
        tableOfDates,
        members,
        createdBy: member._id
    });
    await meeting.save();
    console.log(`[CreateMeeting Success] Meeting created. ID: ${meeting._id}`);
    res.status(201).json({ status: 201, data: meeting });
})

const getMeetings = asyncWrapper(async (req, res) => {
    const email = req.decoded.email;
    console.log(`[GetMeetings] User: ${email}`);

    const member = await Member.findOne({ email });
    if (!member) {
        console.error(`[GetMeetings Error] Member not found. Email: ${email}`);
        return res.status(404).json({ status: 404, message: "Member not found" });
    }
    const meetings = await Meeting.find({})
        .populate('createdBy', 'name _id avatar')
        .populate('members', 'name _id avatar');
    console.log(`[GetMeetings Success] Retrieved ${meetings.length} meetings.`);
    res.status(200).json({ status: 200, data: meetings });
});


const getMeetingById = asyncWrapper(async (req, res) => {
    const { id } = req.params;
    console.log(`[GetMeetingById] Meeting ID: ${id}`);

    const meeting = await Meeting.findById(id);
    if (!meeting) {
        console.error(`[GetMeetingById Error] Meeting not found. ID: ${id}`);
        return res.status(404).json({ status: 404, message: "Meeting not found" });
    }

    console.log(`[GetMeetingById Success] Meeting retrieved. ID: ${id}`);
    res.status(200).json({ status: 200, data: meeting });
});



const bookMeeting = asyncWrapper(async (req, res) => {
    const { meetingId } = req.params;
    const email = req.decoded.email;
    console.log(`[BookMeeting] User: ${email}, Meeting ID: ${meetingId}`);

    const member = await Member.findOne({ email });
    if (!member) {
        console.error(`[BookMeeting Error] Member not found. Email: ${email}`);
        return res.status(404).json({ status: 404, message: "Member not found" });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
        console.error(`[BookMeeting Error] Meeting not found. ID: ${meetingId}`);
        return res.status(404).json({ status: 404, message: "Meeting not found" });
    }

    let validateMember = meeting.members.some(ele => ele.equals(member._id));
    if (!validateMember) {
        console.error(`[BookMeeting Error] Member not allowed to book this meeting. User: ${email}, Meeting ID: ${meetingId}`);
        return res.status(400).json({ status: 400, message: "Member is not allowed to book this meeting" });
    }

    const { timeId } = req.body;
    console.log(`[BookMeeting] Time ID: ${timeId}`);

    let Date = null;
    meeting.tableOfDates.forEach(day => {
        day.forEach(date => {
            if (date._id == timeId) {
                Date = date;
            }
        });
    });

    if (!Date) {
        console.error(`[BookMeeting Error] Time slot not found. Time ID: ${timeId}`);
        return res.status(404).json({ status: 404, message: "Time slot not found" });
    }

    console.log(`[BookMeeting Success] Time slot booked. Time ID: ${timeId}, User: ${email}`);
    res.status(200).json({ status: 200, message: "Time slot booked successfully" });
});




module.exports={
    createMeeting,
    getMeetings,
    getMeetingById,
    bookMeeting
}



