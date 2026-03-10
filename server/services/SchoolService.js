const School = require('../models/School');
const SchoolMembership = require('../models/SchoolMembership');
const User = require('../models/User');
const crypto = require('crypto');

class SchoolService {
  constructor() {
    this.plans = {
      free: { maxUsers: 50, maxStorage: 5, price: 0 },
      basic: { maxUsers: 200, maxStorage: 20, price: 5000 },
      premium: { maxUsers: 1000, maxStorage: 100, price: 15000 },
      enterprise: { maxUsers: 5000, maxStorage: 500, price: 50000 }
    };
  }

  /**
   * Create a new school
   */
  async createSchool(schoolData, adminId) {
    try {
      // Generate unique school code
      const code = this.generateSchoolCode(schoolData.name);
      
      const school = await School.create({
        ...schoolData,
        code,
        adminUsers: [{
          user: adminId,
          role: 'principal',
          permissions: ['all']
        }],
        status: 'pending'
      });

      // Create membership for admin
      await SchoolMembership.create({
        school: school._id,
        user: adminId,
        role: 'admin',
        status: 'active'
      });

      return school;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  }

  /**
   * Generate unique school code
   */
  generateSchoolCode(name) {
    const prefix = name.substring(0, 3).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${random}`;
  }

  /**
   * Add user to school
   */
  async addUserToSchool(schoolId, userData, addedBy) {
    try {
      // Check if adder has permission
      const adderMembership = await SchoolMembership.findOne({
        school: schoolId,
        user: addedBy,
        role: { $in: ['admin', 'teacher'] }
      });

      if (!adderMembership) {
        throw new Error('Unauthorized to add users');
      }

      // Check school capacity
      const school = await School.findById(schoolId);
      const currentUsers = await SchoolMembership.countDocuments({
        school: schoolId,
        status: 'active'
      });

      if (currentUsers >= school.subscription.maxUsers) {
        throw new Error('School has reached maximum user limit');
      }

      // Check if user exists
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        // Create new user
        user = await User.create({
          email: userData.email,
          name: userData.name,
          role: userData.role || 'student',
          password: crypto.randomBytes(8).toString('hex'), // Random temp password
          school: schoolId
        });
      }

      // Check if already member
      const existingMembership = await SchoolMembership.findOne({
        school: schoolId,
        user: user._id
      });

      if (existingMembership) {
        throw new Error('User is already a member of this school');
      }

      // Create membership
      const membership = await SchoolMembership.create({
        school: schoolId,
        user: user._id,
        role: userData.role,
        status: school.settings.requireApproval ? 'inactive' : 'active',
        studentInfo: userData.role === 'student' ? {
          grade: userData.grade,
          class: userData.class,
          rollNumber: userData.rollNumber
        } : undefined,
        teacherInfo: userData.role === 'teacher' ? {
          subjects: userData.subjects,
          classes: userData.classes,
          employeeId: userData.employeeId
        } : undefined
      });

      // Update school stats
      await this.updateSchoolStats(schoolId);

      return { user, membership };
    } catch (error) {
      console.error('Error adding user to school:', error);
      throw error;
    }
  }

  /**
   * Bulk import students from CSV
   */
  async bulkImportStudents(schoolId, students, addedBy) {
    const results = {
      success: [],
      failed: []
    };

    for (const student of students) {
      try {
        const result = await this.addUserToSchool(schoolId, {
          ...student,
          role: 'student'
        }, addedBy);
        results.success.push({ email: student.email, userId: result.user._id });
      } catch (error) {
        results.failed.push({ email: student.email, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get school members
   */
  async getSchoolMembers(schoolId, filters = {}) {
    try {
      const { role, status, grade, search } = filters;

      const query = { school: schoolId };
      if (role) query.role = role;
      if (status) query.status = status;

      let memberships = await SchoolMembership.find(query)
        .populate('user', 'name email profile.avatar profile.subjects')
        .sort({ joinedAt: -1 });

      // Apply additional filters
      if (grade) {
        memberships = memberships.filter(m => m.studentInfo?.grade === parseInt(grade));
      }

      if (search) {
        memberships = memberships.filter(m => 
          m.user.name.toLowerCase().includes(search.toLowerCase()) ||
          m.user.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      return memberships;
    } catch (error) {
      console.error('Error getting school members:', error);
      throw error;
    }
  }

  /**
   * Update school settings
   */
  async updateSchoolSettings(schoolId, settings, updatedBy) {
    try {
      // Check admin permission
      const membership = await SchoolMembership.findOne({
        school: schoolId,
        user: updatedBy,
        role: 'admin'
      });

      if (!membership) {
        throw new Error('Unauthorized');
      }

      const school = await School.findByIdAndUpdate(
        schoolId,
        { $set: settings },
        { new: true }
      );

      return school;
    } catch (error) {
      console.error('Error updating school settings:', error);
      throw error;
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscription(schoolId, plan, updatedBy) {
    try {
      const planConfig = this.plans[plan];
      if (!planConfig) {
        throw new Error('Invalid plan');
      }

      const school = await School.findByIdAndUpdate(
        schoolId,
        {
          $set: {
            'subscription.plan': plan,
            'subscription.maxUsers': planConfig.maxUsers,
            'subscription.maxStorage': planConfig.maxStorage,
            'subscription.startDate': new Date(),
            'subscription.endDate': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        },
        { new: true }
      );

      return school;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Get school analytics
   */
  async getSchoolAnalytics(schoolId, timeRange = '30d') {
    try {
      const days = parseInt(timeRange);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [members, sessions, courses] = await Promise.all([
        SchoolMembership.find({ school: schoolId }),
        require('../models/PeerSession').find({
          school: schoolId,
          createdAt: { $gte: startDate }
        }),
        require('../models/LectureCourse').find({
          school: schoolId,
          status: 'published'
        })
      ]);

      return {
        overview: {
          totalMembers: members.length,
          totalStudents: members.filter(m => m.role === 'student').length,
          totalTeachers: members.filter(m => m.role === 'teacher').length,
          activeMembers: members.filter(m => m.status === 'active').length
        },
        activity: {
          totalSessions: sessions.length,
          totalHours: sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60,
          averageRating: sessions.length > 0
            ? sessions.reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.length
            : 0
        },
        courses: {
          totalCourses: courses.length,
          totalEnrollments: courses.reduce((sum, c) => sum + c.enrolledStudents.length, 0)
        }
      };
    } catch (error) {
      console.error('Error getting school analytics:', error);
      throw error;
    }
  }

  /**
   * Remove user from school
   */
  async removeUserFromSchool(schoolId, userId, removedBy) {
    try {
      // Check permission
      const removerMembership = await SchoolMembership.findOne({
        school: schoolId,
        user: removedBy,
        role: 'admin'
      });

      if (!removerMembership && removedBy.toString() !== userId.toString()) {
        throw new Error('Unauthorized');
      }

      const membership = await SchoolMembership.findOneAndUpdate(
        { school: schoolId, user: userId },
        { 
          status: 'inactive',
          leftAt: new Date(),
          leftReason: 'Removed by admin'
        }
      );

      // Update user
      await User.findByIdAndUpdate(userId, { $unset: { school: 1 } });

      // Update stats
      await this.updateSchoolStats(schoolId);

      return membership;
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }

  /**
   * Update school statistics
   */
  async updateSchoolStats(schoolId) {
    try {
      const stats = await SchoolMembership.aggregate([
        { $match: { school: new require('mongoose').Types.ObjectId(schoolId), status: 'active' } },
        {
          $group: {
            _id: null,
            totalStudents: {
              $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
            },
            totalTeachers: {
              $sum: { $cond: [{ $eq: ['$role', 'teacher'] }, 1, 0] }
            }
          }
        }
      ]);

      if (stats.length > 0) {
        await School.findByIdAndUpdate(schoolId, {
          $set: {
            'stats.totalStudents': stats[0].totalStudents,
            'stats.totalTeachers': stats[0].totalTeachers
          }
        });
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  /**
   * Get schools for user
   */
  async getUserSchools(userId) {
    try {
      const memberships = await SchoolMembership.find({
        user: userId,
        status: 'active'
      }).populate('school');

      return memberships.map(m => ({
        membershipId: m._id,
        role: m.role,
        joinedAt: m.joinedAt,
        ...m.school.toObject()
      }));
    } catch (error) {
      console.error('Error getting user schools:', error);
      throw error;
    }
  }

  /**
   * Join school with code
   */
  async joinSchoolWithCode(code, userId, role = 'student') {
    try {
      const school = await School.findOne({ code: code.toUpperCase() });
      
      if (!school) {
        throw new Error('Invalid school code');
      }

      if (school.status !== 'active') {
        throw new Error('School is not active');
      }

      // Check if already member
      const existing = await SchoolMembership.findOne({
        school: school._id,
        user: userId
      });

      if (existing) {
        throw new Error('Already a member of this school');
      }

      // Check capacity
      const currentUsers = await SchoolMembership.countDocuments({
        school: school._id,
        status: 'active'
      });

      if (currentUsers >= school.subscription.maxUsers) {
        throw new Error('School is at capacity');
      }

      // Create membership
      const membership = await SchoolMembership.create({
        school: school._id,
        user: userId,
        role,
        status: school.settings.requireApproval ? 'inactive' : 'active'
      });

      // Update user
      await User.findByIdAndUpdate(userId, { school: school._id });

      return { school, membership };
    } catch (error) {
      console.error('Error joining school:', error);
      throw error;
    }
  }
}

module.exports = new SchoolService();
