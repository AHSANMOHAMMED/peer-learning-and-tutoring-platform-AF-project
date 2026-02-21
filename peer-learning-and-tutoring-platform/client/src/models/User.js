export class User {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.username = data.username || '';
    this.email = data.email || '';
    this.role = data.role || 'student'; // student, tutor, parent, admin
    this.profile = {
      firstName: data.profile?.firstName || '',
      lastName: data.profile?.lastName || '',
      grade: data.profile?.grade || null,
      school: data.profile?.school || '',
      phone: data.profile?.phone || '',
      avatar: data.profile?.avatar || '',
      bio: data.profile?.bio || '',
      ...data.profile
    };
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.emailVerified = data.emailVerified || false;
  }

  get fullName() {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim();
  }

  get displayName() {
    return this.fullName || this.username;
  }

  get isStudent() {
    return this.role === 'student';
  }

  get isTutor() {
    return this.role === 'tutor';
  }

  get isParent() {
    return this.role === 'parent';
  }

  get isAdmin() {
    return this.role === 'admin';
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      profile: this.profile,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
      emailVerified: this.emailVerified
    };
  }

  static fromAPI(data) {
    return new User(data);
  }
}
