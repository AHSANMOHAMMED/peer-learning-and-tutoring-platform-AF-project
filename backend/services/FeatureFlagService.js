const FeatureFlag = require('../models/FeatureFlag');
const CacheService = require('./CacheService');

class FeatureFlagService {
  constructor() {
    this.cacheKey = 'feature_flags';
    this.cacheTTL = 60; // 1 minute cache for feature flags
  }

  /**
   * Create a new feature flag
   * @param {Object} flagData - Feature flag data
   * @param {String} userId - Creator user ID
   * @returns {Object} Created feature flag
   */
  async createFlag(flagData, userId) {
    try {
      const flag = new FeatureFlag({
        ...flagData,
        createdBy: userId
      });

      await flag.save();
      
      // Invalidate cache
      await CacheService.delete(this.cacheKey);
      
      return flag;
    } catch (error) {
      console.error('Error creating feature flag:', error);
      throw error;
    }
  }

  /**
   * Get all feature flags
   * @returns {Array} All feature flags
   */
  async getAllFlags() {
    try {
      return CacheService.getOrSet(
        this.cacheKey,
        async () => {
          return FeatureFlag.find().sort({ createdAt: -1 });
        },
        this.cacheTTL
      );
    } catch (error) {
      console.error('Error getting feature flags:', error);
      throw error;
    }
  }

  /**
   * Get feature flag by key
   * @param {String} key - Feature flag key
   * @returns {Object} Feature flag
   */
  async getFlagByKey(key) {
    try {
      const flags = await this.getAllFlags();
      return flags.find(f => f.key === key);
    } catch (error) {
      console.error('Error getting feature flag by key:', error);
      throw error;
    }
  }

  /**
   * Check if feature is enabled for user
   * @param {String} flagKey - Feature flag key
   * @param {Object} user - User object
   * @returns {Boolean} Is enabled
   */
  async isEnabled(flagKey, user) {
    try {
      const flag = await this.getFlagByKey(flagKey);
      
      if (!flag) {
        return false;
      }

      // Update analytics
      this.updateFlagAnalytics(flag._id, flag.isEnabledForUser(user));

      return flag.isEnabledForUser(user);
    } catch (error) {
      console.error('Error checking feature flag:', error);
      return false;
    }
  }

  /**
   * Get variant for A/B testing
   * @param {String} flagKey - Feature flag key
   * @param {Object} user - User object
   * @returns {Object} Variant or null
   */
  async getVariant(flagKey, user) {
    try {
      const flag = await this.getFlagByKey(flagKey);
      
      if (!flag || !flag.isEnabledForUser(user)) {
        return null;
      }

      return flag.getVariantForUser(user);
    } catch (error) {
      console.error('Error getting variant:', error);
      return null;
    }
  }

  /**
   * Update feature flag
   * @param {String} flagId - Feature flag ID
   * @param {Object} updates - Updates to apply
   * @param {String} userId - User making the update
   * @returns {Object} Updated feature flag
   */
  async updateFlag(flagId, updates, userId) {
    try {
      const flag = await FeatureFlag.findByIdAndUpdate(
        flagId,
        {
          ...updates,
          updatedBy: userId,
          updatedAt: new Date()
        },
        { new: true }
      );

      // Invalidate cache
      await CacheService.delete(this.cacheKey);

      return flag;
    } catch (error) {
      console.error('Error updating feature flag:', error);
      throw error;
    }
  }

  /**
   * Toggle feature flag
   * @param {String} flagId - Feature flag ID
   * @param {String} userId - User making the toggle
   * @returns {Object} Updated feature flag
   */
  async toggleFlag(flagId, userId) {
    try {
      const flag = await FeatureFlag.findById(flagId);
      if (!flag) {
        throw new Error('Feature flag not found');
      }

      flag.enabled = !flag.enabled;
      flag.updatedBy = userId;
      flag.updatedAt = new Date();

      await flag.save();

      // Invalidate cache
      await CacheService.delete(this.cacheKey);

      return flag;
    } catch (error) {
      console.error('Error toggling feature flag:', error);
      throw error;
    }
  }

  /**
   * Delete feature flag
   * @param {String} flagId - Feature flag ID
   * @returns {Boolean} Success status
   */
  async deleteFlag(flagId) {
    try {
      await FeatureFlag.findByIdAndDelete(flagId);

      // Invalidate cache
      await CacheService.delete(this.cacheKey);

      return true;
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      throw error;
    }
  }

  /**
   * Get flags for frontend initialization
   * @param {Object} user - User object
   * @returns {Object} Flags enabled for user
   */
  async getFlagsForUser(user) {
    try {
      const allFlags = await this.getAllFlags();
      const userFlags = {};

      for (const flag of allFlags) {
        userFlags[flag.key] = {
          enabled: flag.isEnabledForUser(user),
          variant: flag.getVariantForUser(user)
        };
      }

      return userFlags;
    } catch (error) {
      console.error('Error getting flags for user:', error);
      return {};
    }
  }

  /**
   * Update flag analytics
   * @param {String} flagId - Flag ID
   * @param {Boolean} wasEnabled - Was the flag enabled for this check
   */
  async updateFlagAnalytics(flagId, wasEnabled) {
    try {
      await FeatureFlag.findByIdAndUpdate(flagId, {
        $inc: {
          'analytics.totalEvaluations': 1,
          'analytics.enabledCount': wasEnabled ? 1 : 0,
          'analytics.disabledCount': wasEnabled ? 0 : 1
        },
        $set: {
          'analytics.lastEvaluated': new Date()
        }
      });
    } catch (error) {
      console.error('Error updating flag analytics:', error);
    }
  }

  /**
   * Get flag analytics
   * @param {String} flagId - Flag ID
   * @returns {Object} Analytics data
   */
  async getFlagAnalytics(flagId) {
    try {
      const flag = await FeatureFlag.findById(flagId).select('analytics key name');
      return flag ? flag.analytics : null;
    } catch (error) {
      console.error('Error getting flag analytics:', error);
      throw error;
    }
  }

  /**
   * Bulk update flags
   * @param {Array} updates - Array of flag updates
   * @param {String} userId - User making updates
   * @returns {Boolean} Success status
   */
  async bulkUpdateFlags(updates, userId) {
    try {
      const bulkOps = updates.map(update => ({
        updateOne: {
          filter: { _id: update.flagId },
          update: {
            ...update.changes,
            updatedBy: userId,
            updatedAt: new Date()
          }
        }
      }));

      await FeatureFlag.bulkWrite(bulkOps);

      // Invalidate cache
      await CacheService.delete(this.cacheKey);

      return true;
    } catch (error) {
      console.error('Error bulk updating flags:', error);
      throw error;
    }
  }

  /**
   * Initialize default feature flags
   * @param {String} adminUserId - Admin user ID
   */
  async initializeDefaultFlags(adminUserId) {
    const defaultFlags = [
      {
        key: 'peer_tutoring',
        name: 'Peer Tutoring',
        description: 'Enable peer-to-peer tutoring feature',
        enabled: true,
        targeting: { percentage: 100 }
      },
      {
        key: 'group_rooms',
        name: 'Group Study Rooms',
        description: 'Enable group study rooms feature',
        enabled: true,
        targeting: { percentage: 100 }
      },
      {
        key: 'lecture_courses',
        name: 'Lecture Courses',
        description: 'Enable lecture courses feature',
        enabled: true,
        targeting: { percentage: 100 }
      },
      {
        key: 'advanced_whiteboard',
        name: 'Advanced Whiteboard',
        description: 'Enable advanced whiteboard with AI features',
        enabled: true,
        targeting: { percentage: 100 }
      },
      {
        key: 'ai_transcription',
        name: 'AI Transcription',
        description: 'Enable AI-powered session transcription',
        enabled: false,
        targeting: { 
          percentage: 10,
          roles: ['admin', 'moderator']
        }
      },
      {
        key: 'screen_sharing',
        name: 'Screen Sharing',
        description: 'Enable WebRTC screen sharing',
        enabled: true,
        targeting: { percentage: 100 }
      },
      {
        key: 'offline_mode',
        name: 'Offline Mode',
        description: 'Enable offline messaging support',
        enabled: true,
        targeting: { percentage: 100 }
      },
      {
        key: 'push_notifications',
        name: 'Push Notifications',
        description: 'Enable push notification support',
        enabled: true,
        targeting: { percentage: 100 }
      },
      {
        key: 'recording',
        name: 'Session Recording',
        description: 'Enable session recording',
        enabled: true,
        targeting: { percentage: 100 }
      },
      {
        key: 'analytics_dashboard',
        name: 'Analytics Dashboard',
        description: 'Enable advanced analytics dashboard',
        enabled: true,
        targeting: {
          roles: ['admin', 'moderator', 'tutor']
        }
      }
    ];

    for (const flagData of defaultFlags) {
      const existing = await FeatureFlag.findOne({ key: flagData.key });
      if (!existing) {
        await this.createFlag(flagData, adminUserId);
      }
    }
  }
}

module.exports = new FeatureFlagService();
