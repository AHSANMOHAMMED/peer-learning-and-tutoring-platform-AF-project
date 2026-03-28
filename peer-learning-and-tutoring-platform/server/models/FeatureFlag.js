const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  enabled: { 
    type: Boolean, 
    default: false 
  },
  
  // Targeting rules
  targeting: {
    // Enable for specific user roles
    roles: [{ 
      type: String, 
      enum: ['student', 'tutor', 'admin', 'moderator', 'parent'] 
    }],
    
    // Enable for specific users (by ID)
    users: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    
    // Enable for percentage of users (gradual rollout)
    percentage: { 
      type: Number, 
      min: 0, 
      max: 100,
      default: 0 
    },
    
    // Enable for specific grades
    grades: [String],
    
    // Enable for specific regions/countries
    regions: [String],
    
    // Schedule-based targeting
    schedule: {
      startDate: Date,
      endDate: Date,
      timezone: { type: String, default: 'UTC' }
    }
  },
  
  // Variants for A/B testing
  variants: [{
    name: String,
    weight: { type: Number, default: 50 }, // Percentage of traffic
    config: mongoose.Schema.Types.Mixed // Variant-specific config
  }],
  
  // Metadata
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Analytics
  analytics: {
    totalEvaluations: { type: Number, default: 0 },
    enabledCount: { type: Number, default: 0 },
    disabledCount: { type: Number, default: 0 },
    lastEvaluated: Date
  }
}, {
  timestamps: true
});

// Index for faster lookups
// featureFlagSchema.index({ key: 1 });
// featureFlagSchema.index({ enabled: 1 });

// Method to check if flag is enabled for a specific user
featureFlagSchema.methods.isEnabledForUser = function(user) {
  // If globally disabled, return false
  if (!this.enabled) {
    return false;
  }
  
  const targeting = this.targeting || {};
  
  // Check user-specific targeting
  if (targeting.users && targeting.users.length > 0) {
    const userId = user._id?.toString();
    const isTargeted = targeting.users.some(id => id.toString() === userId);
    if (isTargeted) return true;
    
    // If specific users are defined but this user isn't in the list, disable
    return false;
  }
  
  // Check role-based targeting
  if (targeting.roles && targeting.roles.length > 0) {
    if (!targeting.roles.includes(user.role)) {
      return false;
    }
  }
  
  // Check grade-based targeting
  if (targeting.grades && targeting.grades.length > 0) {
    if (!targeting.grades.includes(user.profile?.grade)) {
      return false;
    }
  }
  
  // Check schedule-based targeting
  if (targeting.schedule) {
    const now = new Date();
    if (targeting.schedule.startDate && now < targeting.schedule.startDate) {
      return false;
    }
    if (targeting.schedule.endDate && now > targeting.schedule.endDate) {
      return false;
    }
  }
  
  // Check percentage-based rollout (consistent hashing by user ID)
  if (targeting.percentage > 0 && targeting.percentage < 100) {
    const userHash = this.hashUserId(user._id.toString());
    if (userHash > targeting.percentage) {
      return false;
    }
  }
  
  return true;
};

// Consistent hash function for percentage-based rollout
featureFlagSchema.methods.hashUserId = function(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash % 100);
};

// Get variant assignment for A/B testing
featureFlagSchema.methods.getVariantForUser = function(user) {
  if (!this.variants || this.variants.length === 0) {
    return null;
  }
  
  // Simple weighted random assignment based on user ID
  const userHash = this.hashUserId(user._id.toString());
  let cumulativeWeight = 0;
  
  for (const variant of this.variants) {
    cumulativeWeight += variant.weight;
    if (userHash <= cumulativeWeight) {
      return variant;
    }
  }
  
  return this.variants[0]; // Default to first variant
};

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
