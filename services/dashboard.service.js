const Member = require('../models/member');
const Event = require('../models/event');
const Component = require('../models/component');
const Task = require('../models/task'); // Note: Tasks were moved to their own collection in Phase 1
const { MEMBER_ROLES } = require('../utils/constants');

/**
 * High-level metrics for the President/Leader
 */
const getLeaderMetrics = async () => {
    const totalMembers = await Member.countDocuments();
    const totalActiveMembers = await Member.countDocuments({ role: { $ne: MEMBER_ROLES.NOT_ACCEPTED } });
    
    // Member committee breakdown
    const membersByCommittee = await Member.aggregate([
        { $match: { role: { $ne: MEMBER_ROLES.NOT_ACCEPTED } } },
        { $group: { _id: "$committee", count: { $sum: 1 } } }
    ]);

    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ date: { $gte: new Date() } });

    // Components metrics
    const totalComponents = await Component.countDocuments({ deleted: false });
    const pendingBorrowRequests = await Component.countDocuments({ requestToBorrow: { $ne: null }, deleted: false });
    const activeBorrows = await Component.countDocuments({ 'borrowedBy.member': { $exists: true, $ne: null }, deleted: false });

    // Tasks metrics
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ "status": "completed" }); // Assuming we have status, if not we fall back to rate/points

    return {
        members: {
            total: totalMembers,
            active: totalActiveMembers,
            byCommittee: membersByCommittee
        },
        events: {
            total: totalEvents,
            upcoming: upcomingEvents
        },
        components: {
            total: totalComponents,
            pendingRequests: pendingBorrowRequests,
            activeBorrows: activeBorrows
        },
        tasks: {
            total: totalTasks,
            completed: completedTasks
        }
    };
};

/**
 * Committee-specific metrics (e.g. for Heads)
 */
const getCommitteeMetrics = async (committee) => {
    const totalMembers = await Member.countDocuments({ committee, role: { $ne: MEMBER_ROLES.NOT_ACCEPTED } });

    // Pending borrow requests specific to OC
    let pendingBorrowRequests = 0;
    if (committee === 'OC') {
        pendingBorrowRequests = await Component.countDocuments({ requestToBorrow: { $ne: null }, deleted: false });
    }

    // Tasks assigned to members of this committee
    const committeeMembers = await Member.find({ committee }, { _id: 1 });
    const memberIds = committeeMembers.map(m => m._id);

    const totalTasks = await Task.countDocuments({ assignedTo: { $in: memberIds } });
    const completedTasks = await Task.countDocuments({ assignedTo: { $in: memberIds }, status: "completed" });

    return {
        committee,
        members: {
            total: totalMembers,
        },
        tasks: {
            total: totalTasks,
            completed: completedTasks
        },
        ...(committee === 'OC' && {
            components: {
                pendingRequests: pendingBorrowRequests
            }
        })
    };
};

module.exports = {
    getLeaderMetrics,
    getCommitteeMetrics
};
