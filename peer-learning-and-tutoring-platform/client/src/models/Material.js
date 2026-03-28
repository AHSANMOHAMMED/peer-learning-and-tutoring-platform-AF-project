export class Material {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.subject = data.subject || '';
    this.grade = data.grade || '';
    this.type = data.type || 'document'; // document, video, image, link, quiz
    this.fileUrl = data.fileUrl || '';
    this.fileSize = data.fileSize || 0;
    this.fileFormat = data.fileFormat || '';
    this.thumbnailUrl = data.thumbnailUrl || '';
    this.tags = data.tags || [];
    this.uploaderId = data.uploaderId || '';
    this.uploader = data.uploader || null;
    this.status = data.status || 'pending'; // pending, approved, rejected
    this.rejectionReason = data.rejectionReason || '';
    this.downloads = data.downloads || 0;
    this.views = data.views || 0;
    this.likes = data.likes || 0;
    this.isPublic = data.isPublic !== undefined ? data.isPublic : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  get isPending() {
    return this.status === 'pending';
  }

  get isApproved() {
    return this.status === 'approved';
  }

  get isRejected() {
    return this.status === 'rejected';
  }

  get fileSizeDisplay() {
    if (this.fileSize === 0) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  get typeDisplay() {
    const typeMap = {
      document: '📄 Document',
      video: '🎥 Video',
      image: '🖼️ Image',
      link: '🔗 Link',
      quiz: '❓ Quiz'
    };
    return typeMap[this.type] || this.type;
  }

  get typeIcon() {
    const iconMap = {
      document: 'FiFileText',
      video: 'FiVideo',
      image: 'FiImage',
      link: 'FiExternalLink',
      quiz: 'FiHelpCircle'
    };
    return iconMap[this.type] || 'FiFile';
  }

  get formattedDate() {
    return new Date(this.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  approve() {
    this.status = 'approved';
    this.rejectionReason = '';
    this.updatedAt = new Date();
  }

  reject(reason = '') {
    this.status = 'rejected';
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  incrementViews() {
    this.views += 1;
  }

  incrementDownloads() {
    this.downloads += 1;
  }

  like() {
    this.likes += 1;
  }

  unlike() {
    this.likes = Math.max(0, this.likes - 1);
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      subject: this.subject,
      grade: this.grade,
      type: this.type,
      fileUrl: this.fileUrl,
      fileSize: this.fileSize,
      fileFormat: this.fileFormat,
      thumbnailUrl: this.thumbnailUrl,
      tags: this.tags,
      uploaderId: this.uploaderId,
      uploader: this.uploader,
      status: this.status,
      rejectionReason: this.rejectionReason,
      downloads: this.downloads,
      views: this.views,
      likes: this.likes,
      isPublic: this.isPublic,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromAPI(data) {
    return new Material(data);
  }
}
