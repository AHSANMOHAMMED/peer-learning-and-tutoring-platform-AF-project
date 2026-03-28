const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * FileSharingService - Manages file sharing during sessions
 * Handles uploads, downloads, and real-time file synchronization
 */
class FileSharingService {
  constructor() {
    this.uploadDir = process.env.FILE_UPLOAD_DIR || './uploads';
    this.sessionFiles = new Map(); // sessionId -> files[]
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'video/mp4',
      'audio/mpeg',
      'audio/wav'
    ];
  }

  /**
   * Initialize upload directory
   */
  async initialize() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  /**
   * Upload a file for a session
   * @param {string} sessionId - Session ID
   * @param {Object} fileData - File data
   * @param {string} userId - Uploader user ID
   * @returns {Object} Uploaded file info
   */
  async uploadFile(sessionId, fileData, userId) {
    const { name, type, size, data } = fileData;

    // Validate file
    if (size > this.maxFileSize) {
      throw new Error('File size exceeds maximum limit of 50MB');
    }

    if (!this.allowedTypes.includes(type)) {
      throw new Error(`File type ${type} is not allowed`);
    }

    // Generate unique filename
    const fileId = crypto.randomUUID();
    const ext = path.extname(name);
    const uniqueName = `${fileId}${ext}`;
    const filePath = path.join(this.uploadDir, uniqueName);

    // Save file
    const buffer = Buffer.from(data, 'base64');
    await fs.writeFile(filePath, buffer);

    const fileInfo = {
      id: fileId,
      name,
      type,
      size,
      path: filePath,
      sessionId,
      uploadedBy: userId,
      uploadedAt: new Date(),
      downloads: 0,
      isShared: true,
      sharedWith: [], // specific users if private
      url: `/api/files/download/${fileId}`
    };

    // Add to session files
    if (!this.sessionFiles.has(sessionId)) {
      this.sessionFiles.set(sessionId, []);
    }
    this.sessionFiles.get(sessionId).push(fileInfo);

    return fileInfo;
  }

  /**
   * Get all files for a session
   * @param {string} sessionId - Session ID
   * @returns {Array} Session files
   */
  async getSessionFiles(sessionId) {
    const files = this.sessionFiles.get(sessionId) || [];
    return files.map(f => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      uploadedBy: f.uploadedBy,
      uploadedAt: f.uploadedAt,
      downloads: f.downloads,
      url: f.url
    }));
  }

  /**
   * Download a file
   * @param {string} fileId - File ID
   * @returns {Object} File data
   */
  async downloadFile(fileId) {
    // Find file
    let fileInfo = null;
    for (const [sessionId, files] of this.sessionFiles) {
      fileInfo = files.find(f => f.id === fileId);
      if (fileInfo) break;
    }

    if (!fileInfo) {
      throw new Error('File not found');
    }

    // Read file
    const data = await fs.readFile(fileInfo.path);
    
    // Increment download count
    fileInfo.downloads++;

    return {
      name: fileInfo.name,
      type: fileInfo.type,
      data: data.toString('base64'),
      size: fileInfo.size
    };
  }

  /**
   * Delete a file
   * @param {string} fileId - File ID
   * @param {string} userId - User requesting deletion
   */
  async deleteFile(fileId, userId) {
    // Find and remove file
    for (const [sessionId, files] of this.sessionFiles) {
      const fileIndex = files.findIndex(f => f.id === fileId);
      if (fileIndex !== -1) {
        const file = files[fileIndex];
        
        // Check permissions (only uploader or session host can delete)
        if (file.uploadedBy !== userId) {
          throw new Error('Permission denied');
        }

        // Delete from filesystem
        try {
          await fs.unlink(file.path);
        } catch (error) {
          console.error('Error deleting file from disk:', error);
        }

        // Remove from session files
        files.splice(fileIndex, 1);
        return { success: true };
      }
    }

    throw new Error('File not found');
  }

  /**
   * Share a file with specific participants
   * @param {string} fileId - File ID
   * @param {Array} userIds - User IDs to share with
   */
  async shareFile(fileId, userIds) {
    for (const [sessionId, files] of this.sessionFiles) {
      const file = files.find(f => f.id === fileId);
      if (file) {
        file.sharedWith = [...new Set([...file.sharedWith, ...userIds])];
        return file;
      }
    }
    throw new Error('File not found');
  }

  /**
   * Preview a file (for images and PDFs)
   * @param {string} fileId - File ID
   * @returns {Object} Preview data
   */
  async previewFile(fileId) {
    let fileInfo = null;
    for (const [sessionId, files] of this.sessionFiles) {
      fileInfo = files.find(f => f.id === fileId);
      if (fileInfo) break;
    }

    if (!fileInfo) {
      throw new Error('File not found');
    }

    // Only certain types support preview
    const previewableTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!previewableTypes.includes(fileInfo.type)) {
      throw new Error('File type does not support preview');
    }

    const data = await fs.readFile(fileInfo.path);
    
    return {
      name: fileInfo.name,
      type: fileInfo.type,
      data: data.toString('base64'),
      previewUrl: `/api/files/preview/${fileId}`
    };
  }

  /**
   * Get file statistics for a session
   * @param {string} sessionId - Session ID
   */
  async getFileStats(sessionId) {
    const files = this.sessionFiles.get(sessionId) || [];
    
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const typeCounts = files.reduce((acc, f) => {
      const category = this.getFileCategory(f.type);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalFiles: files.length,
      totalSize,
      totalDownloads: files.reduce((sum, f) => sum + f.downloads, 0),
      typeCounts,
      recentUploads: files
        .sort((a, b) => b.uploadedAt - a.uploadedAt)
        .slice(0, 5)
    };
  }

  /**
   * Clean up old files (cron job)
   * @param {number} maxAgeDays - Maximum age in days
   */
  async cleanupOldFiles(maxAgeDays = 30) {
    const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    
    for (const [sessionId, files] of this.sessionFiles) {
      const toDelete = files.filter(f => f.uploadedAt < cutoffDate);
      
      for (const file of toDelete) {
        try {
          await fs.unlink(file.path);
        } catch (error) {
          console.error(`Error deleting old file ${file.id}:`, error);
        }
      }

      // Remove from session
      this.sessionFiles.set(
        sessionId, 
        files.filter(f => f.uploadedAt >= cutoffDate)
      );
    }

    return { cleaned: true };
  }

  /**
   * Get file category from MIME type
   */
  getFileCategory(mimeType) {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'documents';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheets';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentations';
    return 'other';
  }

  /**
   * Sync files between participants in real-time
   * @param {string} sessionId - Session ID
   * @param {string} action - Sync action (upload, delete, update)
   * @param {Object} fileData - File data
   */
  async syncFiles(sessionId, action, fileData) {
    // This would be called via WebSocket to notify all participants
    return {
      sessionId,
      action,
      file: fileData,
      timestamp: new Date()
    };
  }

  /**
   * Copy file to breakout room
   * @param {string} fileId - Original file ID
   * @param {string} breakoutRoomId - Target breakout room ID
   */
  async copyToBreakoutRoom(fileId, breakoutRoomId) {
    let fileInfo = null;
    for (const [sessionId, files] of this.sessionFiles) {
      fileInfo = files.find(f => f.id === fileId);
      if (fileInfo) break;
    }

    if (!fileInfo) {
      throw new Error('File not found');
    }

    // Create a copy
    const newFileId = crypto.randomUUID();
    const ext = path.extname(fileInfo.name);
    const newName = `copy_${fileInfo.name}`;
    const newPath = path.join(this.uploadDir, `${newFileId}${ext}`);

    // Copy file on disk
    await fs.copyFile(fileInfo.path, newPath);

    const copy = {
      ...fileInfo,
      id: newFileId,
      name: newName,
      path: newPath,
      uploadedAt: new Date(),
      downloads: 0,
      breakoutRoomId,
      parentFileId: fileId,
      url: `/api/files/download/${newFileId}`
    };

    // Add to breakout room session files
    const breakoutSessionId = `breakout_${breakoutRoomId}`;
    if (!this.sessionFiles.has(breakoutSessionId)) {
      this.sessionFiles.set(breakoutSessionId, []);
    }
    this.sessionFiles.get(breakoutSessionId).push(copy);

    return copy;
  }
}

module.exports = new FileSharingService();
