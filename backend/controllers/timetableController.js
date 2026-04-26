const Timetable = require('../models/Timetable');

const getSchedule = async (req, res) => {
  try {
    const slots = await Timetable.find({ userId: req.user._id }).sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ success: true, data: slots });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable' });
  }
};

const addTimeSlot = async (req, res) => {
  try {
    const { title, dayOfWeek, startTime, endTime, type, description, isAvailable, color } = req.body;
    
    // Simplistic overlap check can be added here
    const newSlot = new Timetable({
      userId: req.user._id,
      title,
      dayOfWeek,
      startTime,
      endTime,
      type,
      description,
      isAvailable,
      color
    });
    
    await newSlot.save();
    res.status(201).json({ success: true, message: 'Timeslot added', data: newSlot });
  } catch (error) {
    console.error('Add timeslot error:', error);
    res.status(500).json({ success: false, message: 'Failed to add timeslot' });
  }
};

const updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const slot = await Timetable.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Timeslot not found' });
    }
    
    res.json({ success: true, message: 'Timeslot updated', data: slot });
  } catch (error) {
    console.error('Update timeslot error:', error);
    res.status(500).json({ success: false, message: 'Failed to update timeslot' });
  }
};

const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    
    const slot = await Timetable.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Timeslot not found' });
    }
    
    res.json({ success: true, message: 'Timeslot deleted', data: slot });
  } catch (error) {
    console.error('Delete timeslot error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete timeslot' });
  }
};

module.exports = {
  getSchedule,
  addTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
};
