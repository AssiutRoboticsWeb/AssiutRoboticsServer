const asyncWrapper = require('../middleware/asyncWrapper');
const Member = require('../mongoose.models/member');
const Track = require('../mongoose.models/track');
const createError = require('../utils/createError');
const httpStatusText = require('../utils/httpStatusText');

// API to get specific data for rate dashboard
const getRateDashboardData = asyncWrapper(async (req, res) => {
    const { email } = req.decoded;
    const { committee, month } = req.query;

    // Check if user is authorized (head role)
    const user = await Member.findOne({ email });
    if (!user || user.role !== 'head') {
        throw createError(403, httpStatusText.FAIL, "Only heads can access rate dashboard");
    }

    // Build query filter
    let memberFilter = { role: { $ne: 'not accepted' } };
    if (committee) {
        memberFilter.committee = committee;
    }

    const members = await Member.find(memberFilter)
        .populate('startedTracks.track', 'name description committee')
        .select('name email committee role rate tasks hr_rate startedTracks');

    // Process members data for dashboard
    const dashboardData = members.map(member => {
        // Calculate task statistics
        const taskStats = {
            total: member.tasks.length,
            completed: member.tasks.filter(task => 
                task.submissionLink && 
                task.submissionLink !== "*" && 
                task.headEvaluation !== -1
            ).length,
            pending: member.tasks.filter(task => task.submissionLink === "*").length,
            submitted: member.tasks.filter(task => 
                task.submissionLink && 
                task.submissionLink !== "*" && 
                task.headEvaluation === -1
            ).length
        };

        // Calculate average task rate
        const completedTasks = member.tasks.filter(task => 
            task.submissionLink && 
            task.submissionLink !== "*" && 
            task.headEvaluation !== -1
        );
        const avgTaskRate = completedTasks.length > 0 ? 
            completedTasks.reduce((sum, task) => sum + task.rate, 0) / completedTasks.length : 0;

        // Get HR ratings for specific month or latest
        let hrRating = null;
        if (month) {
            hrRating = member.hr_rate.find(rating => rating.month === month);
        } else if (member.hr_rate.length > 0) {
            hrRating = member.hr_rate[member.hr_rate.length - 1]; // Latest rating
        }

        return {
            memberId: member._id,
            name: member.name,
            email: member.email,
            committee: member.committee,
            role: member.role,
            overallRate: member.rate || 0,
            taskStats,
            avgTaskRate: Math.round(avgTaskRate * 100) / 100,
            hrRating: hrRating ? {
                month: hrRating.month,
                socialScore: hrRating.socialScore,
                behaviorScore: hrRating.behaviorScore,
                interactionScore: hrRating.interactionScore,
                totalHRScore: hrRating.socialScore + hrRating.behaviorScore + hrRating.interactionScore
            } : null,
            tracksCount: member.startedTracks.length,
            tracks: member.startedTracks.map(st => ({
                trackId: st.track._id,
                trackName: st.track.name,
                committee: st.track.committee,
                coursesCount: st.courses.length
            }))
        };
    });

    // Calculate summary statistics
    const summary = {
        totalMembers: dashboardData.length,
        avgOverallRate: dashboardData.length > 0 ? 
            dashboardData.reduce((sum, member) => sum + member.overallRate, 0) / dashboardData.length : 0,
        avgTaskRate: dashboardData.length > 0 ? 
            dashboardData.reduce((sum, member) => sum + member.avgTaskRate, 0) / dashboardData.length : 0,
        totalTasks: dashboardData.reduce((sum, member) => sum + member.taskStats.total, 0),
        totalCompletedTasks: dashboardData.reduce((sum, member) => sum + member.taskStats.completed, 0),
        totalPendingTasks: dashboardData.reduce((sum, member) => sum + member.taskStats.pending, 0),
        membersWithHRRating: dashboardData.filter(member => member.hrRating !== null).length
    };

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            members: dashboardData,
            summary,
            filters: {
                committee: committee || 'all',
                month: month || 'latest'
            }
        },
        message: "Rate dashboard data retrieved successfully"
    });
});

// API to submit HR rating
const submitHRRating = asyncWrapper(async (req, res) => {
    const { memberId, month, socialScore, behaviorScore, interactionScore } = req.body;
    const { email } = req.decoded;

    // Check if user is authorized (head role)
    const user = await Member.findOne({ email });
    if (!user || user.role !== 'head') {
        throw createError(403, httpStatusText.FAIL, "Only heads can submit HR ratings");
    }

    // Validate scores
    if (socialScore < 0 || socialScore > 100 || 
        behaviorScore < 0 || behaviorScore > 100 || 
        interactionScore < 0 || interactionScore > 100) {
        throw createError(400, httpStatusText.FAIL, "Scores must be between 0 and 100");
    }

    const member = await Member.findById(memberId);
    if (!member) {
        throw createError(404, httpStatusText.FAIL, "Member not found");
    }

    // Check if rating for this month already exists
    const existingRatingIndex = member.hr_rate.findIndex(rating => rating.month === month);
    
    const newRating = {
        month,
        memberId,
        socialScore,
        behaviorScore,
        interactionScore
    };

    if (existingRatingIndex !== -1) {
        // Update existing rating
        member.hr_rate[existingRatingIndex] = newRating;
    } else {
        // Add new rating
        member.hr_rate.push(newRating);
    }

    await member.save();

    // Send notification to member
    const totalScore = socialScore + behaviorScore + interactionScore;
    const ratingMessage = {
        title: `HR Rating for ${month}`,
        body: `Your HR rating for ${month} has been submitted. Total Score: ${totalScore}/300. Social: ${socialScore}, Behavior: ${behaviorScore}, Interaction: ${interactionScore}`,
        date: new Date().toISOString()
    };

    await Member.findByIdAndUpdate(
        memberId,
        { $push: { messages: ratingMessage } }
    );

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            memberId: member._id,
            memberName: member.name,
            month,
            rating: newRating,
            totalScore
        },
        message: "HR rating submitted successfully and notification sent"
    });
});

// API to get member's rating history
const getMemberRatingHistory = asyncWrapper(async (req, res) => {
    const { memberId } = req.params;
    const { email } = req.decoded;

    // Check if user is requesting their own data or is a head
    const requester = await Member.findOne({ email });
    if (!requester) {
        throw createError(404, httpStatusText.FAIL, "Requester not found");
    }

    if (requester._id.toString() !== memberId && requester.role !== 'head') {
        throw createError(403, httpStatusText.FAIL, "You can only view your own rating history or be a head");
    }

    const member = await Member.findById(memberId)
        .select('name email committee role rate tasks hr_rate startedTracks')
        .populate('startedTracks.track', 'name description committee');

    if (!member) {
        throw createError(404, httpStatusText.FAIL, "Member not found");
    }

    // Process task history
    const taskHistory = member.tasks.map(task => ({
        id: task._id,
        title: task.title,
        submissionDate: task.submissionDate,
        rate: task.rate,
        headEvaluation: task.headEvaluation,
        deadlineEvaluation: task.deadlineEvaluation,
        status: task.submissionLink === "*" ? "pending" : 
                task.headEvaluation === -1 ? "submitted" : "completed"
    }));

    // Process HR rating history
    const hrRatingHistory = member.hr_rate.map(rating => ({
        month: rating.month,
        socialScore: rating.socialScore,
        behaviorScore: rating.behaviorScore,
        interactionScore: rating.interactionScore,
        totalScore: rating.socialScore + rating.behaviorScore + rating.interactionScore
    }));

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            member: {
                id: member._id,
                name: member.name,
                email: member.email,
                committee: member.committee,
                role: member.role,
                overallRate: member.rate
            },
            taskHistory,
            hrRatingHistory,
            summary: {
                totalTasks: taskHistory.length,
                completedTasks: taskHistory.filter(t => t.status === "completed").length,
                avgTaskRate: taskHistory.filter(t => t.rate).length > 0 ? 
                    taskHistory.filter(t => t.rate).reduce((sum, t) => sum + t.rate, 0) / taskHistory.filter(t => t.rate).length : 0,
                totalHRRatings: hrRatingHistory.length,
                avgHRScore: hrRatingHistory.length > 0 ? 
                    hrRatingHistory.reduce((sum, r) => sum + r.totalScore, 0) / hrRatingHistory.length : 0
            }
        },
        message: "Member rating history retrieved successfully"
    });
});

// API to get committee performance summary
const getCommitteePerformance = asyncWrapper(async (req, res) => {
    const { committee } = req.params;
    const { email } = req.decoded;

    // Check if user is authorized (head role)
    const user = await Member.findOne({ email });
    if (!user || user.role !== 'head') {
        throw createError(403, httpStatusText.FAIL, "Only heads can view committee performance");
    }

    const members = await Member.find({ 
        committee, 
        role: { $ne: 'not accepted' } 
    }).select('name email role rate tasks hr_rate');

    if (members.length === 0) {
        throw createError(404, httpStatusText.FAIL, "No members found in this committee");
    }

    // Calculate committee statistics
    const committeeStats = {
        totalMembers: members.length,
        heads: members.filter(m => m.role === 'head').length,
        regularMembers: members.filter(m => m.role === 'member').length,
        avgOverallRate: members.filter(m => m.rate).length > 0 ? 
            members.filter(m => m.rate).reduce((sum, m) => sum + m.rate, 0) / members.filter(m => m.rate).length : 0,
        totalTasks: members.reduce((sum, m) => sum + m.tasks.length, 0),
        completedTasks: members.reduce((sum, m) => 
            sum + m.tasks.filter(t => t.submissionLink && t.submissionLink !== "*" && t.headEvaluation !== -1).length, 0),
        avgTaskCompletionRate: 0
    };

    if (committeeStats.totalTasks > 0) {
        committeeStats.avgTaskCompletionRate = (committeeStats.completedTasks / committeeStats.totalTasks) * 100;
    }

    // Top performers in committee
    const topPerformers = members
        .filter(m => m.rate)
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5)
        .map((member, index) => ({
            rank: index + 1,
            name: member.name,
            email: member.email,
            rate: member.rate,
            completedTasks: member.tasks.filter(t => 
                t.submissionLink && t.submissionLink !== "*" && t.headEvaluation !== -1
            ).length
        }));

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            committee,
            stats: committeeStats,
            topPerformers
        },
        message: "Committee performance retrieved successfully"
    });
});

module.exports = {
    getRateDashboardData,
    submitHRRating,
    getMemberRatingHistory,
    getCommitteePerformance
};
