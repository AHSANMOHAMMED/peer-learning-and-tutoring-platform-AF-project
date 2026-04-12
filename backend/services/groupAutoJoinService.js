const GroupRoom = require('../models/GroupRoom');
const Tutor = require('../models/Tutor');

/**
 * Automatically joins a student to relevant groups based on their academic profile.
 * @param {Object} user - The student User object
 */
const autoJoinGroupsForStudent = async (user) => {
  if (user.role !== 'student') return;

  try {
    const { grade, stream } = user;
    if (!grade) return;

    console.log(`[AutoJoin] Processing groups for student: ${user.username} (${grade}, ${stream || 'No Stream'})`);

    // 1. Find general peer groups for this grade/stream
    const peerGroups = await GroupRoom.find({
      grade: grade,
      $or: [
        { subject: stream },
        { tags: { $in: [stream, grade] } }
      ],
      isActive: true,
      isPublic: true
    }).limit(5);

    for (const group of peerGroups) {
      if (!group.isParticipant(user._id) && !group.isFull) {
        group.participants.push({ user: user._id, role: 'participant' });
        await group.save();
        console.log(`[AutoJoin] Joined peer group: ${group.title}`);
      }
    }

    // 2. Find groups hosted by approved tutors matching the student's profile
    // This connects students directly to relevant tutors' communities
    const matchingTutors = await Tutor.find({
      verificationStatus: 'approved',
      $or: [
        { alStream: stream },
        { subjects: { $in: [stream] } }
      ]
    }).select('userId');

    const tutorUserIds = matchingTutors.map(t => t.userId);

    const tutorGroups = await GroupRoom.find({
      host: { $in: tutorUserIds },
      grade: grade,
      isActive: true
    }).limit(3);

    for (const group of tutorGroups) {
      if (!group.isParticipant(user._id) && !group.isFull) {
        group.participants.push({ user: user._id, role: 'participant' });
        await group.save();
        console.log(`[AutoJoin] Joined tutor-led group: ${group.title}`);
      }
    }

  } catch (error) {
    console.error('[AutoJoin] Error joining groups:', error);
  }
};

module.exports = { autoJoinGroupsForStudent };
