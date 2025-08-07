const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  dateOfDelete: {
    type: Date,
    default: Date.now
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // لأن Admin و Student و Assistant كلهم من User
  }
});

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
