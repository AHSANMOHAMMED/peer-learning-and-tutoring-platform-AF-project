export class Tutor {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.userId = data.userId || '';
    this.user = data.user || null;
    this.subjects = data.subjects || [];
    this.availability = data.availability || [];
    this.rating = data.rating || 0;
    this.totalSessions = data.totalSessions || 0;
    this.hourlyRate = data.hourlyRate || 0;
    this.isVerified = data.isVerified || false;
    this.documents = data.documents || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get fullName() {
    if (this.user) {
      return `${this.user.profile.firstName} ${this.user.profile.lastName}`.trim();
    }
    return '';
  }

  get displayName() {
    return this.fullName || 'Unknown Tutor';
  }

  get averageRating() {
    return this.rating > 0 ? this.rating.toFixed(1) : 'New';
  }

  get subjectList() {
    return this.subjects.map(subject => subject.name).join(', ');
  }

  get gradeLevels() {
    const grades = new Set();
    this.subjects.forEach(subject => {
      subject.gradeLevels?.forEach(grade => grades.add(grade));
    });
    return Array.from(grades).sort((a, b) => a - b);
  }

  get hasAvailability() {
    return this.availability && this.availability.length > 0;
  }

  get isAvailable() {
    return this.isVerified && this.hasAvailability;
  }

  addSubject(subject) {
    this.subjects.push(subject);
    this.updatedAt = new Date();
  }

  removeSubject(subjectId) {
    this.subjects = this.subjects.filter(s => s.id !== subjectId);
    this.updatedAt = new Date();
  }

  addAvailability(slot) {
    this.availability.push(slot);
    this.updatedAt = new Date();
  }

  removeAvailability(slotId) {
    this.availability = this.availability.filter(slot => slot.id !== slotId);
    this.updatedAt = new Date();
  }

  updateRating(newRating) {
    this.rating = newRating;
    this.updatedAt = new Date();
  }

  incrementSessions() {
    this.totalSessions += 1;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      user: this.user,
      subjects: this.subjects,
      availability: this.availability,
      rating: this.rating,
      totalSessions: this.totalSessions,
      hourlyRate: this.hourlyRate,
      isVerified: this.isVerified,
      documents: this.documents,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromAPI(data) {
    return new Tutor(data);
  }
}
