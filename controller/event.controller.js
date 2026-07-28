const eventService = require('../services/event.service');
const asyncWrapper = require('../middleware/asyncWrapper');
const createError = require('../utils/createError');

const createEvent = asyncWrapper(async (req, res, next) => {
  const event = await eventService.createEvent(req.body, req.user._id);
  res.status(201).json({ success: true, data: event });
});

const getEvents = asyncWrapper(async (req, res, next) => {
  const { page, limit } = req.query;
  const result = await eventService.getEvents({}, { page: parseInt(page), limit: parseInt(limit) });
  res.status(200).json({ success: true, data: result });
});

const getEventById = asyncWrapper(async (req, res, next) => {
  const event = await eventService.getEventById(req.params.id);
  if (!event) return next(createError(404, 'FAIL', 'Event not found'));
  res.status(200).json({ success: true, data: event });
});

const registerGuest = asyncWrapper(async (req, res, next) => {
  try {
    const event = await eventService.registerGuest(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Successfully registered', data: event });
  } catch (error) {
    return next(createError(400, 'FAIL', error.message));
  }
});

const markAttendance = asyncWrapper(async (req, res, next) => {
  const event = await eventService.markAttendance(req.params.id, req.user._id);
  if (!event) return next(createError(404, 'FAIL', 'Event not found'));
  res.status(200).json({ success: true, message: 'Attendance recorded' });
});

module.exports = { createEvent, getEvents, getEventById, registerGuest, markAttendance };
