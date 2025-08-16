const asyncWrapper = require('../middleware/asyncWrapper');
const Member = require('../mongoose.models/member');
const Track = require('../mongoose.models/track');
const Course = require('../mongoose.models/course');
const createError = require('../utils/createError');
const httpStatusText = require('../utils/httpStatusText');
const jwt = require('../middleware/jwt');


// API to assign task to member
const assignTask = asyncWrapper(async (req, res) => {
    const { memberId, title, description, startDate, deadline, taskUrl } = req.body;
    const { email } = req.decoded;

    // Check if the assigner is authorized (head role)
    const assigner = await Member.findOne({ email });
    if (!assigner || assigner.role !== 'head') {
        throw createError(403, httpStatusText.FAIL, "Only heads can assign tasks");
    }

    const member = await Member.findById(memberId);
    if (!member) {
        throw createError(404, httpStatusText.FAIL, "Member not found");
    }

    const newTask = {
        title,
        description,
        startDate: startDate || new Date(),
        deadline: new Date(deadline),
        taskUrl,
        submissionLink: "*",
        headEvaluation: -1,
        deadlineEvaluation: 0
    };

    member.tasks.push(newTask);
    await member.save();

    // Send notification message to member
    const taskMessage = {
        title: `New Task Assigned: ${title}`,
        body: `You have been assigned a new task: ${title}. ${description ? description : ''} Deadline: ${new Date(deadline).toLocaleDateString()}`,
        date: new Date().toISOString()
    };

    await Member.findByIdAndUpdate(
        memberId,
        { $push: { messages: taskMessage } }
    );

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: {
            taskId: member.tasks[member.tasks.length - 1]._id,
            assignedTo: member.name,
            task: newTask
        },
        message: "Task assigned successfully and notification sent"
    });
});

// API to submit task
const submitTask = asyncWrapper(async (req, res) => {
    const { taskId, submissionLink } = req.body;
    const { email } = req.decoded;

    const member = await Member.findOne({ email });
    if (!member) {
        throw createError(404, httpStatusText.FAIL, "Member not found");
    }

    const task = member.tasks.id(taskId);
    if (!task) {
        throw createError(404, httpStatusText.FAIL, "Task not found");
    }

    if (task.submissionLink && task.submissionLink !== "*") {
        throw createError(400, httpStatusText.FAIL, "Task already submitted");
    }

    task.submissionLink = submissionLink;
    task.submissionDate = new Date();

    // Calculate deadline evaluation
    const deadline = new Date(task.deadline);
    const submissionDate = new Date();
    
    if (submissionDate <= deadline) {
        task.deadlineEvaluation = 20; // Full points for on-time submission
    } else {
        const daysLate = Math.ceil((submissionDate - deadline) / (1000 * 60 * 60 * 24));
        task.deadlineEvaluation = Math.max(0, 20 - (daysLate * 2)); // Deduct 2 points per day late
    }

    await member.save();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            taskId: task._id,
            submissionLink: task.submissionLink,
            submissionDate: task.submissionDate,
            deadlineEvaluation: task.deadlineEvaluation
        },
        message: "Task submitted successfully"
    });
});

// API to rate task
const rateTask = asyncWrapper(async (req, res) => {
    const { memberId, taskId, headEvaluation, notes } = req.body;
    const { email } = req.decoded;

    // Check if the rater is authorized (head role)
    const rater = await Member.findOne({ email });
    if (!rater || rater.role !== 'head') {
        throw createError(403, httpStatusText.FAIL, "Only heads can rate tasks");
    }

    const member = await Member.findById(memberId);
    if (!member) {
        throw createError(404, httpStatusText.FAIL, "Member not found");
    }

    const task = member.tasks.id(taskId);
    if (!task) {
        throw createError(404, httpStatusText.FAIL, "Task not found");
    }

    if (task.submissionLink === "*") {
        throw createError(400, httpStatusText.FAIL, "Cannot rate unsubmitted task");
    }

    task.headEvaluation = headEvaluation;
    task.notes = notes;

    // Calculate total rate
    const headScore = (headEvaluation * task.headPercent) / 100;
    const deadlineScore = (task.deadlineEvaluation * task.deadlinePercent) / 100;
    task.rate = headScore + deadlineScore;

    await member.save();

    // Send rating notification to member
    const ratingMessage = {
        title: `Task Rated: ${task.title}`,
        body: `Your task "${task.title}" has been rated. Score: ${task.rate}/100. ${notes ? 'Notes: ' + notes : ''}`,
        date: new Date().toISOString()
    };

    await Member.findByIdAndUpdate(
        memberId,
        { $push: { messages: ratingMessage } }
    );

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            taskId: task._id,
            headEvaluation: task.headEvaluation,
            deadlineEvaluation: task.deadlineEvaluation,
            totalRate: task.rate,
            notes: task.notes
        },
        message: "Task rated successfully and notification sent"
    });
});

// API to get completed tasks
const getCompletedTasks = asyncWrapper(async (req, res) => {
    const { email } = req.decoded;
    const { memberId } = req.query;

    let member;
    
    if (memberId) {
        // If memberId is provided, check if requester is head
        const requester = await Member.findOne({ email });
        if (!requester || requester.role !== 'head') {
            throw createError(403, httpStatusText.FAIL, "Only heads can view other members' tasks");
        }
        member = await Member.findById(memberId);
    } else {
        // Get own tasks
        member = await Member.findOne({ email });
    }

    if (!member) {
        throw createError(404, httpStatusText.FAIL, "Member not found");
    }

    const completedTasks = member.tasks.filter(task => 
        task.submissionLink && 
        task.submissionLink !== "*" && 
        task.headEvaluation !== -1
    );

    const taskStats = {
        totalTasks: member.tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: member.tasks.filter(task => task.submissionLink === "*").length,
        submittedButNotRated: member.tasks.filter(task => 
            task.submissionLink && 
            task.submissionLink !== "*" && 
            task.headEvaluation === -1
        ).length,
        averageRate: completedTasks.length > 0 ? 
            completedTasks.reduce((sum, task) => sum + task.rate, 0) / completedTasks.length : 0
    };

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            member: {
                id: member._id,
                name: member.name,
                email: member.email,
                committee: member.committee
            },
            completedTasks,
            stats: taskStats
        },
        message: "Completed tasks retrieved successfully"
    });
});

// API to get member's own tasks
const getMyTasks = asyncWrapper(async (req, res) => {
    const { email } = req.decoded;

    const member = await Member.findOne({ email });
    if (!member) {
        throw createError(404, httpStatusText.FAIL, "Member not found");
    }

    const tasks = member.tasks.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        startDate: task.startDate,
        deadline: task.deadline,
        submissionDate: task.submissionDate,
        taskUrl: task.taskUrl,
        submissionLink: task.submissionLink,
        status: task.submissionLink === "*" ? "pending" : 
                task.headEvaluation === -1 ? "submitted" : "completed",
        rate: task.rate,
        headEvaluation: task.headEvaluation,
        deadlineEvaluation: task.deadlineEvaluation,
        notes: task.notes
    }));

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            tasks,
            summary: {
                total: tasks.length,
                pending: tasks.filter(t => t.status === "pending").length,
                submitted: tasks.filter(t => t.status === "submitted").length,
                completed: tasks.filter(t => t.status === "completed").length
            }
        },
        message: "Tasks retrieved successfully"
    });
});


module.exports = {
    assignTask,
    submitTask,
    rateTask,
    getCompletedTasks,
    getMyTasks,
};
