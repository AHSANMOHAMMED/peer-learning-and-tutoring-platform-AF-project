const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

/**
 * Initialize GridFS Bucket when database is connected
 */
const initGridFS = (conn) => {
  bucket = new GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
  console.log('✅ GridFS Bucket Initialized');
};

/**
 * Get GridFS Bucket instance
 */
const getBucket = () => {
  if (!bucket) {
    // If bucket isn't ready, try to get it from default connection
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      initGridFS(mongoose.connection);
    } else {
      throw new Error('GridFS Bucket not initialized. Database must be connected first.');
    }
  }
  return bucket;
};

module.exports = {
  initGridFS,
  getBucket
};
