export class Booking {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.studentId = data.studentId || '';
    this.tutorId = data.tutorId || '';
    this.student = data.student || null;
    this.tutor = data.tutor || null;
    this.subject = data.subject || '';
    this.grade = data.grade || null;
    this.date = data.date ? new Date(data.date) : new Date();
    this.startTime = data.startTime || '';
    this.endTime = data.endTime || '';
    this.duration = data.duration || 60; // minutes
    this.status = data.status || 'pending'; // pending, confirmed, completed, cancelled
    this.sessionUrl = data.sessionUrl || '';
    this.paymentStatus = data.paymentStatus || 'pending'; // pending, paid, refunded
    this.amount = data.amount || 0;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get isPending() {
    return this.status === 'pending';
  }

  get isConfirmed() {
    return this.status === 'confirmed';
  }

  get isCompleted() {
    return this.status === 'completed';
  }

  get isCancelled() {
    return this.status === 'cancelled';
  }

  get isPaid() {
    return this.paymentStatus === 'paid';
  }

  get isUpcoming() {
    const bookingDateTime = new Date(`${this.date.toDateString()} ${this.startTime}`);
    return bookingDateTime > new Date() && !this.isCancelled;
  }

  get isPast() {
    const bookingDateTime = new Date(`${this.date.toDateString()} ${this.endTime}`);
    return bookingDateTime <= new Date();
  }

  get canBeCancelled() {
    return (this.isPending || this.isConfirmed) && this.isUpcoming;
  }

  get canBeConfirmed() {
    return this.isPending && this.isUpcoming;
  }

  get canBeCompleted() {
    return this.isConfirmed && this.isPast;
  }

  get formattedDate() {
    return this.date.toLocaleDateString();
  }

  get formattedStartTime() {
    return this.formatTime(this.startTime);
  }

  get formattedEndTime() {
    return this.formatTime(this.endTime);
  }

  get timeRange() {
    return `${this.formattedStartTime} - ${this.formattedEndTime}`;
  }

  get displayStatus() {
    const statusMap = {
      pending: 'Pending Confirmation',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusMap[this.status] || this.status;
  }

  formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  confirm() {
    this.status = 'confirmed';
    this.updatedAt = new Date();
  }

  cancel() {
    this.status = 'cancelled';
    this.updatedAt = new Date();
  }

  complete() {
    this.status = 'completed';
    this.updatedAt = new Date();
  }

  markAsPaid() {
    this.paymentStatus = 'paid';
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      studentId: this.studentId,
      tutorId: this.tutorId,
      student: this.student,
      tutor: this.tutor,
      subject: this.subject,
      grade: this.grade,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      status: this.status,
      sessionUrl: this.sessionUrl,
      paymentStatus: this.paymentStatus,
      amount: this.amount,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromAPI(data) {
    return new Booking(data);
  }
}
