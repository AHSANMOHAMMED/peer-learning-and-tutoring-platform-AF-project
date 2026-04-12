const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const FileSharingService = require('../services/FileSharingService');
const GridFSService = require('../services/GridFSService');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @route   POST /api/files/upload/:sessionId
 * @desc    Upload a file to a session
 * @access  Private
 */
router.post('/upload/:sessionId', [
  authenticate,
  param('sessionId').isString(),
  body('name').trim().notEmpty(),
  body('type').isString(),
  body('size').isInt({ min: 1 }),
  body('data').isBase64(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;
    const fileData = req.body;
    const userId = req.user._id;

    const fileInfo = await FileSharingService.uploadFile(sessionId, fileData, userId);

    // Notify session participants
    req.app.get('io').to(`session_${sessionId}`).emit('file_uploaded', {
      file: {
        id: fileInfo.id,
        name: fileInfo.name,
        type: fileInfo.type,
        size: fileInfo.size,
        uploadedBy: fileInfo.uploadedBy,
        uploadedAt: fileInfo.uploadedAt
      },
      uploadedBy: req.user.name
    });

    res.status(201).json(fileInfo);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: error.message || 'Failed to upload file' });
  }
});

/**
 * @route   GET /api/files/session/:sessionId
 * @desc    Get all files for a session
 * @access  Private
 */
router.get('/session/:sessionId', [
  authenticate,
  param('sessionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const files = await FileSharingService.getSessionFiles(sessionId);

    res.json(files);
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({ message: 'Failed to get files' });
  }
});

/**
 * @route   GET /api/files/download/:fileId
 * @desc    Download a file
 * @access  Private
 */
router.get('/download/:fileId', [
  authenticate,
  param('fileId').isString(),
  validate
], async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await FileSharingService.downloadFile(fileId);
    
    res.setHeader('Content-Type', file.type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    
    const downloadStream = GridFSService.getDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: error.message || 'Failed to download file' });
  }
});

/**
 * @route   GET /api/files/preview/:fileId
 * @desc    Preview a file (for images and PDFs)
 * @access  Private
 */
router.get('/preview/:fileId', [
  authenticate,
  param('fileId').isString(),
  validate
], async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const fileMetadata = await GridFSService.getFileMetadata(fileId);
    if (!fileMetadata) return res.status(404).json({ message: 'File not found' });

    res.setHeader('Content-Type', fileMetadata.contentType);
    const downloadStream = GridFSService.getDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error previewing file:', error);
    res.status(500).json({ message: error.message || 'Failed to preview file' });
  }
});

/**
 * @route   DELETE /api/files/:fileId
 * @desc    Delete a file
 * @access  Private
 */
router.delete('/:fileId', [
  authenticate,
  param('fileId').isString(),
  validate
], async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user._id;

    const result = await FileSharingService.deleteFile(fileId, userId);

    res.json(result);
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(error.message === 'Permission denied' ? 403 : 500).json({ 
      message: error.message || 'Failed to delete file' 
    });
  }
});

/**
 * @route   POST /api/files/:fileId/share
 * @desc    Share file with specific users
 * @access  Private
 */
router.post('/:fileId/share', [
  authenticate,
  param('fileId').isString(),
  body('userIds').isArray(),
  validate
], async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userIds } = req.body;

    const file = await FileSharingService.shareFile(fileId, userIds);

    // Notify users
    userIds.forEach(userId => {
      req.app.get('io').to(`user_${userId}`).emit('file_shared', {
        fileId: file.id,
        fileName: file.name,
        sharedBy: req.user.name
      });
    });

    res.json(file);
  } catch (error) {
    console.error('Error sharing file:', error);
    res.status(500).json({ message: error.message || 'Failed to share file' });
  }
});

/**
 * @route   GET /api/files/stats/:sessionId
 * @desc    Get file statistics for a session
 * @access  Private
 */
router.get('/stats/:sessionId', [
  authenticate,
  param('sessionId').isString(),
  validate
], async (req, res) => {
  try {
    const { sessionId } = req.params;

    const stats = await FileSharingService.getFileStats(sessionId);

    res.json(stats);
  } catch (error) {
    console.error('Error getting file stats:', error);
    res.status(500).json({ message: 'Failed to get file statistics' });
  }
});

/**
 * @route   POST /api/files/copy-to-breakout
 * @desc    Copy file to breakout room
 * @access  Private (Host only)
 */
router.post('/copy-to-breakout', [
  authenticate,
  body('fileId').isString(),
  body('breakoutRoomId').isString(),
  validate
], async (req, res) => {
  try {
    const { fileId, breakoutRoomId } = req.body;

    const copy = await FileSharingService.copyToBreakoutRoom(fileId, breakoutRoomId);

    // Notify breakout room participants
    req.app.get('io').to(`breakout_${breakoutRoomId}`).emit('file_copied', {
      file: {
        id: copy.id,
        name: copy.name,
        type: copy.type,
        size: copy.size,
        parentFileId: copy.parentFileId
      }
    });

    res.json(copy);
  } catch (error) {
    console.error('Error copying file:', error);
    res.status(500).json({ message: error.message || 'Failed to copy file' });
  }
});

/**
 * @route   GET /api/files/cleanup
 * @desc    Clean up old files (admin only)
 * @access  Private (Admin)
 */
router.post('/cleanup', [
  authenticate,
  authorize(['admin']),
  body('maxAgeDays').optional().isInt({ min: 1 }),
  validate
], async (req, res) => {
  try {
    const { maxAgeDays = 30 } = req.body;

    const result = await FileSharingService.cleanupOldFiles(maxAgeDays);

    res.json(result);
  } catch (error) {
    console.error('Error cleaning up files:', error);
    res.status(500).json({ message: 'Failed to clean up files' });
  }
});

module.exports = router;
