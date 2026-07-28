const Event = require('../models/event');
const historyService = require('./history.service');

class EventService {
  async createEvent(data, actorId) {
    const event = await Event.create({ ...data, createdBy: actorId });
    await historyService.logAction('EVENT_CREATED', actorId, event._id, 'Event', { title: event.title });
    return event;
  }

  async getEvents(filter, options) {
    const { page = 1, limit = 10, sort = { date: -1 } } = options;
    const skip = (page - 1) * limit;
    
    const events = await Event.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email');
      
    const total = await Event.countDocuments(filter);
    
    return { events, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getEventById(eventId) {
    return await Event.findById(eventId)
        .populate('attendedMembers', 'name email')
        .populate('createdBy', 'name email');
  }

  async registerGuest(eventId, guestData) {
    const event = await Event.findById(eventId);
    if (!event || !event.registrationOpen) throw new Error('Event not found or registration closed');
    event.registeredGuests.push(guestData);
    await event.save();
    return event;
  }

  async markAttendance(eventId, memberId) {
    return await Event.findByIdAndUpdate(
      eventId, 
      { $addToSet: { attendedMembers: memberId } }, 
      { new: true }
    );
  }
}

module.exports = new EventService();
