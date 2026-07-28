const mongoose = require('mongoose');
const validator = require('validator');
const { REGISTRATION_DEADLINE, MEMBER_ROLES, MESSAGE_STATUS, DEFAULT_AVATAR } = require('../utils/constants');






// const taskSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   time:String,
//   score:String,
//   materialLink: String,
//   // evaluation: String, // تقييم المسؤول
// });

// const courseSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   tasks: [taskSchema], // كل كورس يحتوي على مجموعة من التاسكات
// });

// const trackSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   courses: [courseSchema], // كل تراك يحتوي على مجموعة من الكورسات
//   committee:String,
//   members:[
//     {}
//   ]
// });




// Embedded schemas for tasks, hr_rates, tracks have been extracted to separate models
// (Task, HRRate, Message, Notification, TrackEnrollment) to prevent document bloat.


const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: [validator.isEmail, "enter a valid Email"]
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },


  committee: {
    type: String,
    required: [true, "committee is required"]
  },
  gender: {
    type: String,
    required: [true, "gender is required"]
  },
  phoneNumber: {
    type: String,
    required: [true, "phone number is required"],
    validate: [validator.isMobilePhone, "enter a valid phone number"]
  },
 role: {
  type: String,
  enum: Object.values(MEMBER_ROLES),
  default: MEMBER_ROLES.NOT_ACCEPTED
},

  avatar: {
    type: String,
    default: DEFAULT_AVATAR
  },
  avg_rate: [
    {
      value: { type: Number, required: true },
      month: { type: String, required: true }
    }
  ],  

  verified: {
    type: Boolean,
    default: false
  },
  secretKey: {
    type: String,
  },
  refreshToken: {
    type: String,
  },




  visits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visits' }],
  feedBacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FeedBack' }],
})

const createError = require("../utils/createError");
const { required } = require('nodemon/lib/config');

memberSchema.pre('save', async function (next) {
  // Only check registration deadline for new documents (not updates)
  if (this.isNew && Date.now() > new Date(REGISTRATION_DEADLINE)) {
    const error = createError(400, 'FAIL', "Registration is closed");
    return next(error); 
  }
  

  next();
});

// Export the model
module.exports = mongoose.model('Member', memberSchema);
