const Member = require('../models/member');
const Component = require('../models/component');
const Event = require('../models/event');
const Task = require('../models/task');

const globalSearch = async (query) => {
    if (!query || query.trim() === '') {
        return { members: [], components: [], events: [], tasks: [] };
    }

    const regex = new RegExp(query, 'i'); // Case-insensitive search

    // Execute queries in parallel
    const [members, components, events, tasks] = await Promise.all([
        Member.find({ 
            $or: [{ name: regex }, { email: regex }, { committee: regex }] 
        }).select('name email committee role avatar').limit(10),

        Component.find({ 
            deleted: false,
            $or: [{ title: regex }, { category: regex }]
        }).select('title category image total').limit(10),

        Event.find({ 
            $or: [{ title: regex }, { location: regex }, { description: regex }]
        }).select('title location date').limit(10),

        Task.find({ 
            $or: [{ title: regex }, { description: regex }]
        }).select('title description status points deadline').limit(10)
    ]);

    return {
        members,
        components,
        events,
        tasks
    };
};

module.exports = {
    globalSearch
};
