const NFTCertificate = require('../models/NFTCertificate');
const LectureCourse = require('../models/LectureCourse');
const User = require('../models/User');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class NFTCertificateService {
  constructor() {
    // Pinata API keys for IPFS storage
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    
    // Blockchain configuration
    this.alchemyApiKey = process.env.ALCHEMY_API_KEY;
    this.contractAddress = process.env.NFT_CONTRACT_ADDRESS;
    this.privateKey = process.env.WALLET_PRIVATE_KEY;
    
    // Network (polygon is recommended for low fees)
    this.network = process.env.BLOCKCHAIN_NETWORK || 'polygon';
  }

  /**
   * Generate certificate image
   * @param {Object} certificateData - Certificate data
   * @returns {Buffer} Image buffer
   */
  async generateCertificateImage(certificateData) {
    // This is a placeholder - in production, you'd use a library like
    // node-canvas or sharp to generate a professional certificate image
    // For now, we'll return a mock implementation
    
    const { userName, courseTitle, completionDate, grade, verificationCode } = certificateData;
    
    // In a real implementation:
    // 1. Create a canvas
    // 2. Draw certificate template (background, borders)
    // 3. Add text (name, course, date, grade)
    // 4. Add QR code for verification
    // 5. Return as buffer
    
    return {
      mockImage: true,
      message: 'Certificate image generation would be implemented with node-canvas'
    };
  }

  /**
   * Upload metadata and image to IPFS via Pinata
   * @param {Object} metadata - Certificate metadata
   * @param {Buffer} imageBuffer - Certificate image
   * @returns {String} IPFS URI
   */
  async uploadToIPFS(metadata, imageBuffer) {
    try {
      if (!this.pinataApiKey || !this.pinataSecretKey) {
        throw new Error('Pinata API credentials not configured');
      }

      // Upload image
      const imageForm = new FormData();
      imageForm.append('file', imageBuffer, {
        filename: `certificate-${Date.now()}.png`,
        contentType: 'image/png'
      });

      const imageResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        imageForm,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${imageForm._boundary}`,
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      const imageHash = imageResponse.data.IpfsHash;
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;

      // Update metadata with image URL
      metadata.image = imageUrl;

      // Upload metadata JSON
      const metadataResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );

      const metadataHash = metadataResponse.data.IpfsHash;
      return `https://gateway.pinata.cloud/ipfs/${metadataHash}`;

    } catch (error) {
      console.error('IPFS upload error:', error);
      throw error;
    }
  }

  /**
   * Mint NFT certificate on blockchain
   * @param {Object} certificate - Certificate document
   * @returns {Object} Transaction details
   */
  async mintNFT(certificate) {
    try {
      // In a real implementation, you would:
      // 1. Connect to blockchain (using ethers.js or web3.js)
      // 2. Load smart contract
      // 3. Call mint function
      // 4. Return transaction hash

      // Mock implementation for development
      const mockTransaction = {
        hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        tokenId: `CERT-${Date.now()}`,
        status: 'pending'
      };

      return mockTransaction;

    } catch (error) {
      console.error('NFT minting error:', error);
      throw error;
    }
  }

  /**
   * Create and mint NFT certificate for course completion
   * @param {String} courseId - Course ID
   * @param {String} userId - User ID
   * @returns {Object} Created certificate
   */
  async createCertificate(courseId, userId) {
    try {
      // Get course and user details
      const course = await LectureCourse.findById(courseId);
      const user = await User.findById(userId);

      if (!course || !user) {
        throw new Error('Course or user not found');
      }

      // Check if user is enrolled and completed
      const enrollment = course.enrolledStudents.find(
        e => e.user.toString() === userId && e.status === 'completed'
      );

      if (!enrollment) {
        throw new Error('User has not completed this course');
      }

      // Check if certificate already exists
      const existingCert = await NFTCertificate.findOne({
        user: userId,
        course: courseId
      });

      if (existingCert && existingCert.status === 'minted') {
        throw new Error('Certificate already minted for this course');
      }

      // Get user's enrollment data
      const sessionsAttended = enrollment.progress || 0;
      const totalSessions = course.totalSessions;
      
      // Calculate grade based on attendance
      const attendanceRate = (sessionsAttended / totalSessions) * 100;
      let grade = 'Pass';
      if (attendanceRate >= 95) grade = 'A+';
      else if (attendanceRate >= 90) grade = 'A';
      else if (attendanceRate >= 85) grade = 'A-';
      else if (attendanceRate >= 80) grade = 'B+';
      else if (attendanceRate >= 75) grade = 'B';
      else if (attendanceRate >= 70) grade = 'B-';
      else if (attendanceRate >= 65) grade = 'C+';
      else if (attendanceRate >= 60) grade = 'C';

      // Create certificate document
      const certificate = new NFTCertificate({
        user: userId,
        userName: user.name,
        userEmail: user.email,
        course: courseId,
        courseTitle: course.title,
        courseInstructor: course.instructor?.name || 'Unknown',
        certificateType: attendanceRate >= 90 ? 'excellence' : 'completion',
        completionDate: enrollment.lastSessionAttended || new Date(),
        score: Math.round(attendanceRate),
        grade,
        sessionsAttended,
        totalSessions,
        attendanceRate,
        skills: course.learningOutcomes || [],
        blockchain: {
          network: this.network,
          contractAddress: this.contractAddress
        }
      });

      // Save certificate (this triggers pre-save middleware)
      await certificate.save();

      return certificate;

    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  /**
   * Process certificate minting (called by queue/job)
   * @param {String} certificateId - Certificate ID
   */
  async processMinting(certificateId) {
    try {
      const certificate = await NFTCertificate.findById(certificateId);
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // Update status to minting
      certificate.status = 'minting';
      await certificate.save();

      try {
        // 1. Generate certificate image
        const imageData = await this.generateCertificateImage({
          userName: certificate.userName,
          courseTitle: certificate.courseTitle,
          completionDate: certificate.completionDate,
          grade: certificate.grade,
          verificationCode: certificate.verificationCode
        });

        // 2. Upload to IPFS
        const metadataUri = await this.uploadToIPFS(
          certificate.metadata,
          Buffer.from(JSON.stringify(imageData)) // Mock - would be actual image buffer
        );

        // 3. Mint NFT
        const txResult = await this.mintNFT(certificate);

        // 4. Update certificate with blockchain data
        certificate.blockchain.transactionHash = txResult.hash;
        certificate.blockchain.tokenId = txResult.tokenId;
        certificate.blockchain.metadataUri = metadataUri;
        certificate.blockchain.mintedAt = new Date();
        certificate.status = 'minted';
        certificate.isVerified = true;
        certificate.verifiedAt = new Date();

        await certificate.save();

        console.log(`Certificate ${certificateId} minted successfully`);
        return certificate;

      } catch (error) {
        // Update status to failed
        certificate.status = 'failed';
        await certificate.save();
        throw error;
      }

    } catch (error) {
      console.error('Error processing minting:', error);
      throw error;
    }
  }

  /**
   * Get certificate by verification code
   * @param {String} verificationCode - Verification code
   * @returns {Object} Certificate details
   */
  async verifyCertificate(verificationCode) {
    try {
      const certificate = await NFTCertificate.findOne({
        verificationCode: verificationCode.toUpperCase(),
        isVerified: true,
        status: { $ne: 'revoked' }
      }).populate('user', 'name email profile')
        .populate('course', 'title description');

      if (!certificate) {
        throw new Error('Certificate not found or invalid');
      }

      // Increment views
      certificate.views += 1;
      certificate.lastViewedAt = new Date();
      await certificate.save();

      return certificate;

    } catch (error) {
      console.error('Certificate verification error:', error);
      throw error;
    }
  }

  /**
   * Get user's certificates
   * @param {String} userId - User ID
   * @returns {Array} User's certificates
   */
  async getUserCertificates(userId) {
    try {
      const certificates = await NFTCertificate.find({
        user: userId,
        status: { $in: ['minted', 'pending'] }
      })
        .populate('course', 'title thumbnail instructor')
        .sort({ createdAt: -1 });

      return certificates;
    } catch (error) {
      console.error('Error getting user certificates:', error);
      throw error;
    }
  }

  /**
   * Revoke a certificate (admin only)
   * @param {String} certificateId - Certificate ID
   * @param {String} reason - Revocation reason
   * @param {String} revokedBy - Admin user ID
   * @returns {Object} Updated certificate
   */
  async revokeCertificate(certificateId, reason, revokedBy) {
    try {
      const certificate = await NFTCertificate.findById(certificateId);
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      if (certificate.status === 'revoked') {
        throw new Error('Certificate already revoked');
      }

      certificate.status = 'revoked';
      certificate.revokedAt = new Date();
      certificate.revokedReason = reason;
      certificate.revokedBy = revokedBy;
      certificate.isVerified = false;

      await certificate.save();

      return certificate;

    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw error;
    }
  }

  /**
   * Share certificate on LinkedIn
   * @param {String} certificateId - Certificate ID
   * @returns {String} Share URL
   */
  async shareOnLinkedIn(certificateId) {
    try {
      const certificate = await NFTCertificate.findById(certificateId);
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // LinkedIn sharing URL
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificate.certificateUrl)}`;
      
      // Update sharing status
      certificate.shareSettings.linkedInShared = true;
      await certificate.save();

      return shareUrl;

    } catch (error) {
      console.error('LinkedIn sharing error:', error);
      throw error;
    }
  }

  /**
   * Share certificate on Twitter
   * @param {String} certificateId - Certificate ID
   * @returns {String} Share URL
   */
  async shareOnTwitter(certificateId) {
    try {
      const certificate = await NFTCertificate.findById(certificateId);
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      const text = `I just earned a certificate in ${certificate.courseTitle} from PeerLearn! 🎓 \n\nVerify: ${certificate.certificateUrl}`;
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      
      // Update sharing status
      certificate.shareSettings.twitterShared = true;
      await certificate.save();

      return shareUrl;

    } catch (error) {
      console.error('Twitter sharing error:', error);
      throw error;
    }
  }

  /**
   * Get certificate statistics
   * @returns {Object} Statistics
   */
  async getCertificateStats() {
    try {
      const stats = await NFTCertificate.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalMinted = await NFTCertificate.countDocuments({ status: 'minted' });
      const totalViews = await NFTCertificate.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]);

      return {
        byStatus: stats,
        totalMinted,
        totalViews: totalViews[0]?.total || 0,
        mostViewed: await NFTCertificate.findOne()
          .sort({ views: -1 })
          .limit(1)
          .select('courseTitle userName views')
      };

    } catch (error) {
      console.error('Error getting certificate stats:', error);
      throw error;
    }
  }

  /**
   * Check if user is eligible for certificate
   * @param {String} courseId - Course ID
   * @param {String} userId - User ID
   * @returns {Object} Eligibility status
   */
  async checkEligibility(courseId, userId) {
    try {
      const course = await LectureCourse.findById(courseId);
      if (!course) {
        return { eligible: false, reason: 'Course not found' };
      }

      const enrollment = course.enrolledStudents.find(
        e => e.user.toString() === userId
      );

      if (!enrollment) {
        return { eligible: false, reason: 'Not enrolled in course' };
      }

      if (enrollment.status !== 'completed' && enrollment.progress < 80) {
        return { 
          eligible: false, 
          reason: 'Course not completed',
          progress: enrollment.progress,
          required: 80
        };
      }

      // Check if certificate already exists
      const existingCert = await NFTCertificate.findOne({
        user: userId,
        course: courseId,
        status: { $in: ['pending', 'minting', 'minted'] }
      });

      if (existingCert) {
        return { 
          eligible: false, 
          reason: 'Certificate already issued',
          certificateId: existingCert._id
        };
      }

      return { eligible: true };

    } catch (error) {
      console.error('Eligibility check error:', error);
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }
}

module.exports = new NFTCertificateService();
