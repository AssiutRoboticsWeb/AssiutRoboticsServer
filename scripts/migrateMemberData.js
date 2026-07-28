require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Member = require('../models/member');
const Task = require('../models/task');
const HRRate = require('../models/hrRate');
const Message = require('../models/message');
const Notification = require('../models/notification');
const TrackEnrollment = require('../models/trackEnrollment');

async function migrateData() {
  try {
    await mongoose.connect(process.env.MONGOURL);
    console.log('Connected to MongoDB');

    // Mongoose might not load the old fields if they are removed from schema,
    // so we use lean() or native mongodb driver to get the raw documents.
    const rawMembers = await mongoose.connection.db.collection('members').find({}).toArray();
    
    console.log(`Found ${rawMembers.length} members to migrate.`);

    for (const member of rawMembers) {
      const memberId = member._id;

      // Migrate Tasks
      if (member.tasks && member.tasks.length > 0) {
        for (const task of member.tasks) {
          await Task.create({
            title: task.title || 'Migrated Task',
            description: task.description,
            startDate: task.startDate,
            deadline: task.deadline,
            submissionDate: task.submissionDate,
            taskUrl: task.taskUrl,
            submissionLink: task.submissionLink,
            assignedMembers: [memberId],
            headEvaluation: task.headEvaluation,
            rate: task.rate,
            points: task.points
          });
        }
      }

      // Migrate HR Rates
      if (member.hr_rate && member.hr_rate.length > 0) {
        for (const hr of member.hr_rate) {
          await HRRate.updateOne(
            { memberId, month: hr.month },
            { $set: { 
                meetingScore: hr.meetingScore, 
                behaviorScore: hr.behaviorScore, 
                interactionScore: hr.interactionScore 
              } 
            },
            { upsert: true }
          );
        }
      }

      // Migrate Messages
      if (member.messages && member.messages.length > 0) {
        for (const msg of member.messages) {
          await Message.create({
            memberId,
            title: msg.title || 'Message',
            body: msg.body || '...',
            status: msg.status,
            links: msg.links
          });
        }
      }

      // Migrate Alerts & Warnings to Notifications
      if (Array.isArray(member.alerts)) {
        for (const alert of member.alerts) {
          await Notification.create({
            memberId,
            type: 'ALERT',
            message: typeof alert === 'string' ? alert : JSON.stringify(alert)
          });
        }
      }
      if (Array.isArray(member.warnings)) {
        for (const warning of member.warnings) {
          await Notification.create({
            memberId,
            type: 'WARNING',
            message: typeof warning === 'string' ? warning : JSON.stringify(warning)
          });
        }
      }

      // Migrate Track Enrollments
      if (member.startedTracks && member.startedTracks.length > 0) {
        for (const st of member.startedTracks) {
          await TrackEnrollment.create({
            memberId,
            track: st.track,
            courses: st.courses
          });
        }
      }

      // Clean up old fields from the member document
      await mongoose.connection.db.collection('members').updateOne(
        { _id: memberId },
        { $unset: { tasks: "", hr_rate: "", messages: "", alerts: "", warnings: "", startedTracks: "" } }
      );
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
