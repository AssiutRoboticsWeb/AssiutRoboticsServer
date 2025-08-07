const mongoose = require('mongoose');
const validator = require('validator');

// ====== Base User Schema ======
const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "name is required"] },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: [validator.isEmail, "Enter a valid email"],
  },
  password: { type: String, required: [true, "password is required"] },
  role: { type: String, required: true, enum: ['admin', 'assistant', 'student'] },
  messages: [{ type: String }],
}, { discriminatorKey: 'role', collection: 'users' });

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ====== Discriminators ======
const Admin = mongoose.models.Admin || User.discriminator('admin', new mongoose.Schema({}));
const Assistant = mongoose.models.Assistant || User.discriminator('assistant', new mongoose.Schema({}));
const Student = mongoose.models.Student || User.discriminator('student', new mongoose.Schema({}));


// ===== Task Schema =====
const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  time: String,
  score: String,
  materialLink: String,
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

// ===== Course Schema =====
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  tasks: [taskSchema],
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

// ===== Track Schema =====
const trackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  courses: [courseSchema],
  committee: String,
  members: [{}],
});

const Track = mongoose.models.Track || mongoose.model('Track', trackSchema);

// ===== Member Task Schema =====
const memberTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: Date,
  deadline: Date,
  submissionDate: Date,
  taskUrl: String,
  submissionLink: { type: String, default: "*" },
  downloadSubmissionUrl: String,
  submissionFileId: String,
  headEvaluation: { type: Number, default: -1 },
  headPercent: { type: Number, default: 50 },
  deadlineEvaluation: { type: Number, default: 0 },
  deadlinePercent: { type: Number, default: 20 },
  rate: Number,
  points: Number,
});

// ===== HR Rate Schema =====
const hrRateSchema = new mongoose.Schema({
  month: { type: String, required: true },
  memberId: { type: String, required: true },
  socialScore: { type: Number, default: 0 },
  behaviorScore: { type: Number, default: 0 },
  interactionScore: { type: Number, default: 0 },
});

// ===== Member Schema =====
const memberSchema = new mongoose.Schema({
  name: { type: String, required: [true, "name is required"] },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: [validator.isEmail, "enter a valid Email"]
  },
  password: { type: String, required: [true, "password is required"] },
  committee: { type: String, required: [true, "committee is required"] },
  gender: { type: String, required: [true, "gender is required"] },
  phoneNumber: {
    type: String,
    required: [true, "phone number is required"],
    validate: [validator.isMobilePhone, "enter a valid phone number"]
  },
  role: { type: String, default: "not accepted" },
  avatar: { type: String, default: "../all-images/default.png" },
  rate: Number,
  alerts: Number,
  warnings: Number,
  verified: { type: Boolean, default: false },
  secretKey: String,
  startedTracks: [
    {
      track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
      courses: [
        {
          course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
          submittedTasks: [
            {
              task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
              submissionLink: String,
              submittedAt: { type: Date, default: Date.now() },
              rate: String,
              notes: String,
            },
          ],
        },
      ],
    },
  ],
  tasks: [memberTaskSchema],
  hr_rate: [hrRateSchema],
  visits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visits' }],
  feedBacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FeedBack' }],
});

// ===== Pre Save Hook (Optional Validation) =====
const createError = require("../utils/createError");
memberSchema.pre('create', async function (next) {
  if (Date.now() > new Date("2025-03-27")) {
    const error = createError(400, 'FAIL', "Registration is closed");
    throw error;
  }
  next();
});


const Member = mongoose.models.Member || mongoose.model('Member', memberSchema);

module.exports = {
  Member,
  Track,
  Course,
  Task,
  User,
  Admin,
  Assistant,
  Student
};
