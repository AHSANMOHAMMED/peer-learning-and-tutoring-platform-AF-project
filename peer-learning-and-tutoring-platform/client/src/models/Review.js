export class Review {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.bookingId = data.bookingId || '';
    this.reviewerId = data.reviewerId || '';
    this.tutorId = data.tutorId || '';
    this.studentName = data.studentName || '';
    this.tutorName = data.tutorName || '';
    this.rating = {
      overall: data.rating?.overall || 0,
      teaching: data.rating?.teaching || 0,
      knowledge: data.rating?.knowledge || 0,
      communication: data.rating?.communication || 0,
      punctuality: data.rating?.punctuality || 0,
      ...data.rating
    };
    this.comment = data.comment || '';
    this.isVisible = data.isVisible !== undefined ? data.isVisible : true;
    this.tutorResponse = data.tutorResponse || null;
    this.sessionDate = data.sessionDate ? new Date(data.sessionDate) : null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  get averageRating() {
    const ratings = [
      this.rating.teaching,
      this.rating.knowledge,
      this.rating.communication,
      this.rating.punctuality
    ].filter(r => r > 0);
    
    return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  }

  get hasResponse() {
    return this.tutorResponse && this.tutorResponse.comment;
  }

  get starRating() {
    return Math.round(this.rating.overall);
  }

  get formattedDate() {
    return this.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  get isPositive() {
    return this.rating.overall >= 4;
  }

  get isNegative() {
    return this.rating.overall <= 2;
  }

  toJSON() {
    return {
      id: this.id,
      bookingId: this.bookingId,
      reviewerId: this.reviewerId,
      tutorId: this.tutorId,
      studentName: this.studentName,
      tutorName: this.tutorName,
      rating: this.rating,
      comment: this.comment,
      isVisible: this.isVisible,
      tutorResponse: this.tutorResponse,
      sessionDate: this.sessionDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromAPI(data) {
    return new Review(data);
  }

  static calculateAverage(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating.overall, 0);
    return (sum / reviews.length).toFixed(1);
  }
}
