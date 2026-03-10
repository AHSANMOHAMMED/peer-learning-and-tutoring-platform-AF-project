/**
 * Unit Tests for FileSharingService
 * Tests file upload, download, sharing, and management functionality
 */

const FileSharingService = require('../../services/FileSharingService');
const fs = require('fs').promises;
const path = require('path');

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
    copyFile: jest.fn()
  }
}));

describe('FileSharingService', () => {
  beforeEach(() => {
    // Reset service state
    FileSharingService.sessionFiles.clear();
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    test('should create upload directory', async () => {
      await FileSharingService.initialize();
      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.any(String),
        { recursive: true }
      );
    });
  });

  describe('uploadFile', () => {
    test('should upload file successfully', async () => {
      const fileData = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        data: Buffer.from('test content').toString('base64')
      };
      const userId = 'user123';
      const sessionId = 'session1';

      const result = await FileSharingService.uploadFile(sessionId, fileData, userId);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(fileData.name);
      expect(result.type).toBe(fileData.type);
      expect(result.size).toBe(fileData.size);
      expect(result.uploadedBy).toBe(userId);
      expect(result.sessionId).toBe(sessionId);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('should reject files exceeding max size', async () => {
      const fileData = {
        name: 'large.pdf',
        type: 'application/pdf',
        size: 51 * 1024 * 1024, // 51MB
        data: 'data'
      };

      await expect(FileSharingService.uploadFile('session1', fileData, 'user1'))
        .rejects.toThrow('File size exceeds maximum limit');
    });

    test('should reject unsupported file types', async () => {
      const fileData = {
        name: 'test.exe',
        type: 'application/x-msdownload',
        size: 1024,
        data: 'data'
      };

      await expect(FileSharingService.uploadFile('session1', fileData, 'user1'))
        .rejects.toThrow('File type');
    });

    test('should allow supported image types', async () => {
      const fileData = {
        name: 'image.png',
        type: 'image/png',
        size: 1024,
        data: Buffer.from('image data').toString('base64')
      };

      const result = await FileSharingService.uploadFile('session1', fileData, 'user1');
      expect(result.type).toBe('image/png');
    });

    test('should track download count', async () => {
      const fileData = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        data: Buffer.from('test').toString('base64')
      };

      const result = await FileSharingService.uploadFile('session1', fileData, 'user1');
      expect(result.downloads).toBe(0);
    });
  });

  describe('getSessionFiles', () => {
    test('should return files for session', async () => {
      // Setup - add a file
      const fileData = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        data: Buffer.from('test').toString('base64')
      };
      await FileSharingService.uploadFile('session1', fileData, 'user1');

      const files = await FileSharingService.getSessionFiles('session1');

      expect(files).toHaveLength(1);
      expect(files[0].name).toBe('test.pdf');
      expect(files[0]).not.toHaveProperty('path'); // Sensitive data removed
    });

    test('should return empty array for session with no files', async () => {
      const files = await FileSharingService.getSessionFiles('empty_session');
      expect(files).toEqual([]);
    });
  });

  describe('downloadFile', () => {
    test('should return file data and increment download count', async () => {
      const fileData = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        data: Buffer.from('file content').toString('base64')
      };
      const uploaded = await FileSharingService.uploadFile('session1', fileData, 'user1');

      fs.readFile.mockResolvedValue(Buffer.from('file content'));

      const result = await FileSharingService.downloadFile(uploaded.id);

      expect(result.name).toBe(fileData.name);
      expect(result.data).toBeDefined();
      expect(fs.readFile).toHaveBeenCalled();
    });

    test('should throw error for non-existent file', async () => {
      await expect(FileSharingService.downloadFile('nonexistent'))
        .rejects.toThrow('File not found');
    });
  });

  describe('deleteFile', () => {
    test('should delete file for owner', async () => {
      const fileData = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        data: Buffer.from('test').toString('base64')
      };
      const uploaded = await FileSharingService.uploadFile('session1', fileData, 'user1');

      fs.unlink.mockResolvedValue();

      const result = await FileSharingService.deleteFile(uploaded.id, 'user1');

      expect(result.success).toBe(true);
      expect(fs.unlink).toHaveBeenCalled();
    });

    test('should throw permission error for non-owner', async () => {
      const fileData = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        data: Buffer.from('test').toString('base64')
      };
      const uploaded = await FileSharingService.uploadFile('session1', fileData, 'user1');

      await expect(FileSharingService.deleteFile(uploaded.id, 'user2'))
        .rejects.toThrow('Permission denied');
    });

    test('should throw error for non-existent file', async () => {
      await expect(FileSharingService.deleteFile('nonexistent', 'user1'))
        .rejects.toThrow('File not found');
    });
  });

  describe('shareFile', () => {
    test('should add users to sharedWith list', async () => {
      const fileData = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        data: Buffer.from('test').toString('base64')
      };
      const uploaded = await FileSharingService.uploadFile('session1', fileData, 'user1');

      const result = await FileSharingService.shareFile(uploaded.id, ['user2', 'user3']);

      expect(result.sharedWith).toContain('user2');
      expect(result.sharedWith).toContain('user3');
    });

    test('should prevent duplicate shares', async () => {
      const fileData = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        data: Buffer.from('test').toString('base64')
      };
      const uploaded = await FileSharingService.uploadFile('session1', fileData, 'user1');

      await FileSharingService.shareFile(uploaded.id, ['user2']);
      const result = await FileSharingService.shareFile(uploaded.id, ['user2', 'user3']);

      expect(result.sharedWith).toHaveLength(2);
    });
  });

  describe('previewFile', () => {
    test('should return preview for image files', async () => {
      const fileData = {
        name: 'image.png',
        type: 'image/png',
        size: 1024,
        data: Buffer.from('image data').toString('base64')
      };
      const uploaded = await FileSharingService.uploadFile('session1', fileData, 'user1');

      fs.readFile.mockResolvedValue(Buffer.from('image data'));

      const result = await FileSharingService.previewFile(uploaded.id);

      expect(result.type).toBe('image/png');
      expect(result.previewUrl).toBeDefined();
    });

    test('should return preview for PDF files', async () => {
      const fileData = {
        name: 'doc.pdf',
        type: 'application/pdf',
        size: 1024,
        data: Buffer.from('pdf data').toString('base64')
      };
      const uploaded = await FileSharingService.uploadFile('session1', fileData, 'user1');

      fs.readFile.mockResolvedValue(Buffer.from('pdf data'));

      const result = await FileSharingService.previewFile(uploaded.id);
      expect(result.type).toBe('application/pdf');
    });

    test('should throw error for non-previewable files', async () => {
      const fileData = {
        name: 'doc.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 1024,
        data: Buffer.from('word data').toString('base64')
      };
      const uploaded = await FileSharingService.uploadFile('session1', fileData, 'user1');

      await expect(FileSharingService.previewFile(uploaded.id))
        .rejects.toThrow('File type does not support preview');
    });
  });

  describe('getFileStats', () => {
    test('should return comprehensive statistics', async () => {
      // Add multiple files
      const files = [
        { name: 'doc1.pdf', type: 'application/pdf', size: 1000, data: 'd' },
        { name: 'doc2.pdf', type: 'application/pdf', size: 2000, data: 'd' },
        { name: 'image.png', type: 'image/png', size: 3000, data: 'd' }
      ];

      for (const file of files) {
        file.data = Buffer.from(file.data).toString('base64');
        const uploaded = await FileSharingService.uploadFile('session1', file, 'user1');
        // Simulate downloads
        FileSharingService.sessionFiles.get('session1').find(f => f.id === uploaded.id).downloads = 5;
      }

      const stats = await FileSharingService.getFileStats('session1');

      expect(stats.totalFiles).toBe(3);
      expect(stats.totalSize).toBe(6000);
      expect(stats.totalDownloads).toBe(15);
      expect(stats.typeCounts.pdf).toBe(2);
      expect(stats.typeCounts.images).toBe(1);
    });

    test('should return empty stats for session with no files', async () => {
      const stats = await FileSharingService.getFileStats('empty_session');

      expect(stats.totalFiles).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.totalDownloads).toBe(0);
    });
  });

  describe('cleanupOldFiles', () => {
    test('should remove files older than specified days', async () => {
      // Add old and new files
      const oldFile = {
        name: 'old.pdf',
        type: 'application/pdf',
        size: 1000,
        data: Buffer.from('old').toString('base64')
      };
      const newFile = {
        name: 'new.pdf',
        type: 'application/pdf',
        size: 1000,
        data: Buffer.from('new').toString('base64')
      };

      const oldUploaded = await FileSharingService.uploadFile('session1', oldFile, 'user1');
      const newUploaded = await FileSharingService.uploadFile('session1', newFile, 'user1');

      // Modify dates
      const files = FileSharingService.sessionFiles.get('session1');
      files[0].uploadedAt = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000); // 40 days ago
      files[1].uploadedAt = new Date(); // Now

      fs.unlink.mockResolvedValue();

      await FileSharingService.cleanupOldFiles(30);

      // Old file should be deleted
      const remainingFiles = FileSharingService.sessionFiles.get('session1');
      expect(remainingFiles).toHaveLength(1);
      expect(remainingFiles[0].id).toBe(newUploaded.id);
      expect(fs.unlink).toHaveBeenCalled();
    });
  });

  describe('copyToBreakoutRoom', () => {
    test('should create copy of file for breakout room', async () => {
      const fileData = {
        name: 'original.pdf',
        type: 'application/pdf',
        size: 1024,
        data: Buffer.from('original').toString('base64')
      };
      const uploaded = await FileSharingService.uploadFile('session1', fileData, 'user1');

      fs.copyFile.mockResolvedValue();

      const copy = await FileSharingService.copyToBreakoutRoom(uploaded.id, 'breakout1');

      expect(copy.name).toContain('copy_');
      expect(copy.parentFileId).toBe(uploaded.id);
      expect(copy.breakoutRoomId).toBe('breakout1');
      expect(fs.copyFile).toHaveBeenCalled();
    });
  });

  describe('getFileCategory', () => {
    test('should categorize images correctly', () => {
      expect(FileSharingService.getFileCategory('image/jpeg')).toBe('images');
      expect(FileSharingService.getFileCategory('image/png')).toBe('images');
    });

    test('should categorize documents correctly', () => {
      expect(FileSharingService.getFileCategory('application/pdf')).toBe('pdf');
      expect(FileSharingService.getFileCategory('application/msword')).toBe('documents');
    });

    test('should categorize videos correctly', () => {
      expect(FileSharingService.getFileCategory('video/mp4')).toBe('videos');
    });

    test('should return other for unknown types', () => {
      expect(FileSharingService.getFileCategory('application/unknown')).toBe('other');
    });
  });
});
