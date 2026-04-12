const { getBucket } = require('../config/gridfs');
const mongoose = require('mongoose');
const stream = require('stream');

/**
 * GridFSService - Manages actual file streaming to/from MongoDB
 */
class GridFSService {
  /**
   * Upload a buffer or stream to GridFS
   * @param {Buffer|ReadableStream} src - Source data
   * @param {Object} metadata - File metadata (filename, contentType, etc)
   */
  async upload(src, { filename, contentType, metadata = {} }) {
    return new Promise((resolve, reject) => {
      const bucket = getBucket();
      const uploadStream = bucket.openUploadStream(filename, {
        contentType,
        metadata
      });

      const readableStream = src instanceof stream.Readable 
        ? src 
        : new stream.PassThrough().end(src);

      readableStream
        .pipe(uploadStream)
        .on('finish', () => resolve(uploadStream.gridFSFile))
        .on('error', reject);
    });
  }

  /**
   * Download a file from GridFS to a stream
   * @param {string} fileId - Storage object ID
   */
  getDownloadStream(fileId) {
    const bucket = getBucket();
    return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
  }

  /**
   * Find file metadata by ID
   */
  async getFileMetadata(fileId) {
    const bucket = getBucket();
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    return files[0];
  }

  /**
   * Delete a file from GridFS
   */
  async delete(fileId) {
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
    return { success: true };
  }
}

module.exports = new GridFSService();
