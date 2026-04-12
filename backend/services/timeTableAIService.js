const Timetable = require('../models/Timetable');
const Tutor = require('../models/Tutor');

/**
 * AI Scheduling Service to optimize timetable overlaps
 */
class TimeTableAIService {
  /**
   * Finds overlapping availability between a student and a tutor
   * @param {string} studentId 
   * @param {string} tutorId 
   * @returns {Object} suggestions
   */
  async findOptimalSlots(studentId, tutorId) {
    try {
      // 1. Get Student's available slots from Timetable model
      const studentSlots = await Timetable.find({ 
        userId: studentId, 
        isAvailable: true 
      });

      // 2. Get Tutor's availability from Profile
      const tutor = await Tutor.findOne({ userId: tutorId });
      if (!tutor || !tutor.availability) {
        throw new Error('Tutor availability not configured');
      }

      const suggestions = [];
      const dayMap = {
        0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
        4: 'thursday', 5: 'friday', 6: 'saturday'
      };

      // 3. Simple greedy overlap matching
      for (const sSlot of studentSlots) {
        const dayName = dayMap[sSlot.dayOfWeek];
        const tutorDaySlots = tutor.availability[dayName] || [];

        for (const tSlot of tutorDaySlots) {
          const overlap = this.calculateOverlap(
            sSlot.startTime, sSlot.endTime,
            tSlot.start, tSlot.end
          );

          if (overlap) {
            suggestions.push({
              day: dayName,
              dayOfWeek: sSlot.dayOfWeek,
              start: overlap.start,
              end: overlap.end,
              duration: overlap.duration,
              source: 'AI_OPTIMIZED_OVERLAP'
            });
          }
        }
      }

      // Sort by duration (longest first)
      return suggestions.sort((a,b) => b.duration - a.duration);
    } catch (error) {
      console.error('AI Scheduling Error:', error);
      throw error;
    }
  }

  /**
   * Helper to find overlap between two time ranges (HH:mm format)
   */
  calculateOverlap(start1, end1, start2, end2) {
    const s1 = this.toMinutes(start1);
    const e1 = this.toMinutes(end1);
    const s2 = this.toMinutes(start2);
    const e2 = this.toMinutes(end2);

    const overlapStart = Math.max(s1, s2);
    const overlapEnd = Math.min(e1, e2);

    if (overlapStart < overlapEnd) {
      const duration = overlapEnd - overlapStart;
      if (duration >= 30) { // At least 30 mins
        return {
          start: this.toHHMM(overlapStart),
          end: this.toHHMM(overlapEnd),
          duration
        };
      }
    }
    return null;
  }

  toMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  toHHMM(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}

module.exports = new TimeTableAIService();
