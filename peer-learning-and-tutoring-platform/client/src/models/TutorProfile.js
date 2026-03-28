export class TutorProfile {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.userId = data.userId || '';
    this.user = data.user || null;
    this.bio = data.bio || '';
    this.subjects = data.subjects || [];
    this.qualifications = data.qualifications || [];
    this.experience = data.experience || 0; // years
    this.hourlyRate = data.hourlyRate || 0;
    this.availability = data.availability || []; // array of {day, startTime, endTime}
    this.rating = data.rating || 0;
    this.totalReviews = data.totalReviews || 0;
    this.totalSessions = data.totalSessions || 0;
    this.totalStudents = data.totalStudents || 0;
    this.earnings = data.earnings || 0;
    this.verificationStatus = data.verificationStatus || 'pending'; // pending, approved, rejected
    this.verificationDocuments = data.verificationDocuments || []; // URLs to uploaded docs
    this.rejectionReason = data.rejectionReason || '';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get isVerified() {
    return this.verificationStatus === 'approved';
  }

  get isPending() {
    return this.verificationStatus === 'pending';
  }

  get isRejected() {
    return this.verificationStatus === 'rejected';
  }

  get subjectsText() {
    return this.subjects.join(', ');
  }

  get formattedRate() {
    return `$${this.hourlyRate}/hr`;
  }

  get ratingDisplay() {
    return this.rating.toFixed(1);
  }

  approve() {
    this.verificationStatus = 'approved';
    this.rejectionReason = '';
    this.updatedAt = new Date();
  }

  reject(reason = '') {
    this.verificationStatus = 'rejected';
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  addEarnings(amount) {
    this.earnings += amount;
    this.updatedAt = new Date();
  }

  incrementSessions() {
    this.totalSessions += 1;
    this.updatedAt = new Date();
  }

  updateRating(newRating) {
    // Weighted average with new rating
    const totalWeight = this.totalReviews + 1;
    this.rating = ((this.rating * this.totalReviews) + newRating) / totalWeight;
    this.totalReviews += 1;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      user: this.user,
      bio: this.bio,
      subjects: this.subjects,
      qualifications: this.qualifications,
      experience: this.experience,
      hourlyRate: this.hourlyRate,
      availability: this.availability,
      rating: this.rating,
      totalReviews: this.totalReviews,
      totalSessions: this.totalSessions,
      totalStudents: this.totalStudents,
      earnings: this.earnings,
      verificationStatus: this.verificationStatus,
      verificationDocuments: this.verificationDocuments,
      rejectionReason: this.rejectionReason,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromAPI(data) {
    return new TutorProfile(data);
  }
}
