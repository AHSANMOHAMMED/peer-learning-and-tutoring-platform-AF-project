const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['pdf', 'document', 'video', 'image', 'link', 'presentation', 'spreadsheet', 'archive'],
    required: true
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.type !== 'link';
    }
  },
  fileName: {
    type: String,
    required: function() {
      return this.type !== 'link';
    }
  },
  originalFileName: {
    type: String,
    required: function() {
      return this.type !== 'link';
    }
  },
  fileSize: {
    type: Number,
    required: function() {
      return this.type !== 'link';
    },
    min: 0
  },
  mimeType: {
    type: String,
    required: function() {
      return this.type !== 'link';
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  grade: {
    type: Number,
    min: 6,
    max: 13,
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  categories: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending',
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000,
      trim: true
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  estimatedTime: {
    type: Number, // in minutes
    min: 1
  },
  language: {
    type: String,
    default: 'en'
  },
  license: {
    type: String,
    enum: ['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nc-sa', 'copyright'],
    default: 'copyright'
  },
  metadata: {
    extractedText: String, // For search indexing
    thumbnailUrl: String,
    duration: Number, // For videos in seconds
    dimensions: {
      width: Number,
      height: Number
    },
    pages: Number, // For PDFs
    wordCount: Number
  },
  flags: {
    isFlagged: {
      type: Boolean,
      default: false
    },
    flagReason: String,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: Date,
    resolved: {
      type: Boolean,
      default: false
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  analytics: {
    lastAccessed: Date,
    accessFrequency: {
      daily: { type: Number, default: 0 },
      weekly: { type: Number, default: 0 },
      monthly: { type: Number, default: 0 }
    },
    popularScore: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
materialSchema.index({ subject: 1, grade: 1, status: 1 });
materialSchema.index({ tags: 1 });
materialSchema.index({ categories: 1 });
materialSchema.index({ uploadedBy: 1, status: 1 });
materialSchema.index({ 'rating.average': -1 });
materialSchema.index({ downloadCount: -1 });
materialSchema.index({ viewCount: -1 });
materialSchema.index({ createdAt: -1 });
materialSchema.index({ 'flags.isFlagged': 1 });

// Virtual for file size in human readable format
materialSchema.virtual('fileSizeFormatted').get(function() {
  if (!this.fileSize) return 'N/A';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = this.fileSize;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
});

// Virtual for approval status
materialSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

// Virtual for can be downloaded
materialSchema.virtual('canDownload').get(function() {
  return this.status === 'approved' && this.isPublic;
});

// Method to increment download count
materialSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  this.analytics.lastAccessed = new Date();
  this.analytics.accessFrequency.daily += 1;
  this.analytics.accessFrequency.weekly += 1;
  this.analytics.accessFrequency.monthly += 1;
  this.analytics.popularScore = this.calculatePopularScore();
  return this.save();
};

// Method to increment view count
materialSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  this.analytics.lastAccessed = new Date();
  this.analytics.popularScore = this.calculatePopularScore();
  return this.save();
};

// Method to add review
materialSchema.methods.addReview = function(userId, rating, comment) {
  // Remove existing review by same user
  this.reviews = this.reviews.filter(review => review.user.toString() !== userId.toString());
  
  // Add new review
  this.reviews.push({
    user: userId,
    rating,
    comment,
    createdAt: new Date()
  });
  
  // Update rating statistics
  this.updateRatingStats();
  
  return this.save();
};

// Method to update rating statistics
materialSchema.methods.updateRatingStats = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    this.rating.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    return;
  }
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
  
  // Reset distribution
  this.rating.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  // Calculate distribution
  this.reviews.forEach(review => {
    this.rating.distribution[review.rating]++;
  });
};

// Method to calculate popular score
materialSchema.methods.calculatePopularScore = function() {
  const now = new Date();
  const daysSinceCreation = Math.floor((now - this.createdAt) / (1000 * 60 * 60 * 24));
  
  // Weighted score based on downloads, views, ratings, and recency
  const downloadScore = this.downloadCount * 2;
  const viewScore = this.viewCount * 0.5;
  const ratingScore = this.rating.average * this.rating.count * 3;
  const recencyScore = Math.max(0, 100 - daysSinceCreation); // Decay over time
  
  return downloadScore + viewScore + ratingScore + recencyScore;
};

// Method to approve material
materialSchema.methods.approve = function(approvedBy) {
  this.status = 'approved';
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.rejectionReason = undefined;
  return this.save();
};

// Method to reject material
materialSchema.methods.reject = function(rejectionReason, rejectedBy) {
  this.status = 'rejected';
  this.rejectionReason = rejectionReason;
  this.approvedBy = rejectedBy;
  this.approvedAt = new Date();
  return this.save();
};

// Method to flag material
materialSchema.methods.flag = function(reason, flaggedBy) {
  this.flags.isFlagged = true;
  this.flags.flagReason = reason;
  this.flags.flaggedBy = flaggedBy;
  this.flags.flaggedAt = new Date();
  this.status = 'flagged';
  return this.save();
};

// Method to resolve flag
materialSchema.methods.resolveFlag = function(resolvedBy) {
  this.flags.resolved = true;
  this.flags.resolvedBy = resolvedBy;
  this.flags.resolvedAt = new Date();
  this.status = 'approved'; // Revert to approved
  return this.save();
};

// Static method to get materials by filters
materialSchema.statics.getFilteredMaterials = async function(filters = {}, options = {}) {
  const {
    subject,
    grade,
    type,
    tags,
    categories,
    status = 'approved',
    sortBy = 'createdAt',
    sortOrder = -1,
    page = 1,
    limit = 20
  } = filters;

  const query = { status };

  if (subject) query.subject = new RegExp(subject, 'i');
  if (grade) query.grade = grade;
  if (type) query.type = type;
  if (tags && tags.length > 0) query.tags = { $in: tags };
  if (categories && categories.length > 0) query.categories = { $in: categories };

  const skip = (page - 1) * limit;

  const [materials, total] = await Promise.all([
    this.find(query)
      .populate('uploadedBy', 'profile.firstName profile.lastName username profile.avatar')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments(query)
  ]);

  return {
    materials,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Static method to get popular materials
materialSchema.statics.getPopularMaterials = async function(limit = 10) {
  return this.find({ status: 'approved', isPublic: true })
    .populate('uploadedBy', 'profile.firstName profile.lastName username profile.avatar')
    .sort({ 'analytics.popularScore': -1 })
    .limit(parseInt(limit))
    .exec();
};

// Static method to get materials by user
materialSchema.statics.getUserMaterials = async function(userId, options = {}) {
  const { page = 1, limit = 20, status } = options;
  
  const query = { uploadedBy: userId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [materials, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments(query)
  ]);

  return {
    materials,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Static method to search materials
materialSchema.statics.searchMaterials = async function(searchTerm, filters = {}) {
  const { subject, grade, type, page = 1, limit = 20 } = filters;
  
  const query = {
    status: 'approved',
    isPublic: true,
    $or: [
      { title: new RegExp(searchTerm, 'i') },
      { description: new RegExp(searchTerm, 'i') },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      { categories: { $in: [new RegExp(searchTerm, 'i')] } },
      { 'metadata.extractedText': new RegExp(searchTerm, 'i') }
    ]
  };

  if (subject) query.subject = new RegExp(subject, 'i');
  if (grade) query.grade = grade;
  if (type) query.type = type;

  const skip = (page - 1) * limit;

  const [materials, total] = await Promise.all([
    this.find(query)
      .populate('uploadedBy', 'profile.firstName profile.lastName username profile.avatar')
      .sort({ 'rating.average': -1, downloadCount: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    this.countDocuments(query)
  ]);

  return {
    materials,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = mongoose.model('Material', materialSchema);
