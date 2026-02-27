export class User {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.username = data.username || '';
    this.email = data.email || '';
    this.role = data.role || 'student'; // student, tutor, parent, admin, moderator
    this.roles = data.roles || [this.role]; // Support multiple roles
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
    this.isBanned = data.isBanned || false;
    this.isSuspended = data.isSuspended || false;
    this.suspendedUntil = data.suspendedUntil || null;
    this.banReason = data.banReason || '';
    this.emailVerified = data.emailVerified || false;
    this.lastLogin = data.lastLogin || null;
    this.loginCount = data.loginCount || 0;
  }

  get fullName() {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim();
  }

  get displayName() {
    return this.fullName || this.username;
  }

  get initials() {
    return `${this.profile.firstName?.[0] || ''}${this.profile.lastName?.[0] || ''}`.toUpperCase();
  }

  get isStudent() {
    return this.role === 'student' || this.roles.includes('student');
  }

  get isTutor() {
    return this.role === 'tutor' || this.roles.includes('tutor');
  }

  get isParent() {
    return this.role === 'parent' || this.roles.includes('parent');
  }

  get isAdmin() {
    return this.role === 'admin' || this.roles.includes('admin');
  }

  get isModerator() {
    return this.role === 'moderator' || this.roles.includes('moderator') || this.isAdmin;
  }

  get canAccessAdmin() {
    return this.isAdmin || this.isModerator;
  }

  get status() {
    if (this.isBanned) return 'banned';
    if (this.isSuspended && new Date() < new Date(this.suspendedUntil)) return 'suspended';
    if (!this.isActive) return 'inactive';
    return 'active';
  }

  get statusColor() {
    const colorMap = {
      active: 'green',
      inactive: 'gray',
      suspended: 'yellow',
      banned: 'red'
    };
    return colorMap[this.status] || 'gray';
  }

  get roleDisplay() {
    const displayMap = {
      student: 'Student',
      tutor: 'Tutor',
      parent: 'Parent',
      admin: 'Administrator',
      moderator: 'Moderator'
    };
    return displayMap[this.role] || this.role;
  }

  get roleBadgeColor() {
    const colorMap = {
      student: 'bg-blue-100 text-blue-800',
      tutor: 'bg-emerald-100 text-emerald-800',
      parent: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      moderator: 'bg-orange-100 text-orange-800'
    };
    return colorMap[this.role] || 'bg-gray-100 text-gray-800';
  }

  hasRole(role) {
    return this.role === role || this.roles.includes(role);
  }

  hasAnyRole(roles) {
    return roles.some(r => this.hasRole(r));
  }

  ban(reason = '') {
    this.isBanned = true;
    this.banReason = reason;
    this.isActive = false;
    this.updatedAt = new Date();
  }

  unban() {
    this.isBanned = false;
    this.banReason = '';
    this.isActive = true;
    this.updatedAt = new Date();
  }

  suspend(until, reason = '') {
    this.isSuspended = true;
    this.suspendedUntil = until;
    this.banReason = reason;
    this.isActive = false;
    this.updatedAt = new Date();
  }

  unsuspend() {
    this.isSuspended = false;
    this.suspendedUntil = null;
    this.banReason = '';
    this.isActive = true;
    this.updatedAt = new Date();
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  recordLogin() {
    this.lastLogin = new Date();
    this.loginCount += 1;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      roles: this.roles,
      profile: this.profile,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
      isBanned: this.isBanned,
      isSuspended: this.isSuspended,
      suspendedUntil: this.suspendedUntil,
      banReason: this.banReason,
      emailVerified: this.emailVerified,
      lastLogin: this.lastLogin,
      loginCount: this.loginCount
    };
  }

  static fromAPI(data) {
    return new User(data);
  }
}
