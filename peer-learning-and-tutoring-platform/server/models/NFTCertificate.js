const mongoose = require('mongoose');

const nftCertificateSchema = new mongoose.Schema({
  // Certificate identification
  tokenId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // User information
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  
  // Course information
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LectureCourse', 
    required: true 
  },
  courseTitle: { type: String, required: true },
  courseInstructor: { type: String, required: true },
  
  // Certificate details
  certificateType: { 
    type: String, 
    enum: ['completion', 'achievement', 'excellence', 'participation'],
    default: 'completion'
  },
  
  // Completion details
  completionDate: { type: Date, default: Date.now },
  score: { type: Number, min: 0, max: 100 },
  grade: { 
    type: String, 
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'Pass', 'Distinction'],
    default: 'Pass'
  },
  
  // Sessions attended
  sessionsAttended: { type: Number, default: 0 },
  totalSessions: { type: Number, required: true },
  attendanceRate: { type: Number, min: 0, max: 100 },
  
  // Skills acquired
  skills: [String],
  
  // Blockchain information
  blockchain: {
    network: { type: String, default: 'polygon' }, // polygon, ethereum, etc.
    contractAddress: { type: String, required: true },
    transactionHash: { type: String },
    mintedAt: { type: Date },
    metadataUri: { type: String }
  },
  
  // Certificate metadata
  metadata: {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String }, // URL to certificate image
    externalUrl: { type: String }, // Link to verification page
    attributes: [{
      trait_type: String,
      value: mongoose.Schema.Types.Mixed,
      display_type: { type: String, enum: ['number', 'date', 'boost_percentage', 'boost_number'] }
    }]
  },
  
  // Verification
  verificationCode: { type: String, unique: true },
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'minting', 'minted', 'failed', 'revoked'],
    default: 'pending'
  },
  
  // Revocation (if needed)
  revokedAt: { type: Date },
  revokedReason: { type: String },
  revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Sharing
  shareSettings: {
    isPublic: { type: Boolean, default: true },
    allowDownload: { type: Boolean, default: true },
    showScore: { type: Boolean, default: true },
    linkedInShared: { type: Boolean, default: false },
    twitterShared: { type: Boolean, default: false }
  },
  
  // Analytics
  views: { type: Number, default: 0 },
  lastViewedAt: { type: Date },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes are created by db-indexes script
// // nftCertificateSchema.index({ tokenId: 1 });
// // nftCertificateSchema.index({ user: 1 });
// // nftCertificateSchema.index({ course: 1 });
// // nftCertificateSchema.index({ verificationCode: 1 });
// // nftCertificateSchema.index({ 'blockchain.transactionHash': 1 });

// Virtual for certificate URL
nftCertificateSchema.virtual('certificateUrl').get(function() {
  return `${process.env.CLIENT_URL}/certificates/verify/${this.verificationCode}`;
});

// Virtual for opensea URL
nftCertificateSchema.virtual('openseaUrl').get(function() {
  if (this.blockchain?.network === 'polygon') {
    return `https://opensea.io/assets/matic/${this.blockchain.contractAddress}/${this.tokenId}`;
  }
  return `https://opensea.io/assets/${this.blockchain.contractAddress}/${this.tokenId}`;
});

// Method to generate verification code
nftCertificateSchema.methods.generateVerificationCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.verificationCode = code;
  return code;
};

// Method to generate metadata
nftCertificateSchema.methods.generateMetadata = function() {
  this.metadata = {
    name: `${this.courseTitle} - Certificate of Completion`,
    description: `This certifies that ${this.userName} has successfully completed ${this.courseTitle} with ${this.grade} grade.`,
    image: this.metadata?.image || '',
    externalUrl: this.certificateUrl,
    attributes: [
      {
        trait_type: 'Course',
        value: this.courseTitle
      },
      {
        trait_type: 'Instructor',
        value: this.courseInstructor
      },
      {
        trait_type: 'Grade',
        value: this.grade
      },
      {
        trait_type: 'Score',
        value: this.score,
        display_type: 'number'
      },
      {
        trait_type: 'Attendance',
        value: `${this.attendanceRate}%`,
        display_type: 'boost_percentage'
      },
      {
        trait_type: 'Completion Date',
        value: this.completionDate.getTime(),
        display_type: 'date'
      },
      {
        trait_type: 'Certificate Type',
        value: this.certificateType
      },
      ...this.skills.map(skill => ({
        trait_type: 'Skill',
        value: skill
      }))
    ]
  };
};

// Pre-save middleware
nftCertificateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate attendance rate
  if (this.totalSessions > 0) {
    this.attendanceRate = (this.sessionsAttended / this.totalSessions) * 100;
  }
  
  // Generate verification code if not set
  if (!this.verificationCode) {
    this.generateVerificationCode();
  }
  
  // Generate metadata
  this.generateMetadata();
  
  next();
});

module.exports = mongoose.model('NFTCertificate', nftCertificateSchema);
