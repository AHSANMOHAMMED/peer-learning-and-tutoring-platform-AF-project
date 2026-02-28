const Material = require('../models/Material');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'peerlearn-materials',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'mp4', 'avi', 'mov', 'zip', 'rar'],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      return `${timestamp}_${randomString}_${file.originalname.split('.')[0]}`;
    }
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 5 // Maximum 5 files at once
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4', 'video/avi', 'video/quicktime',
      'application/zip', 'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, videos, and archives are allowed.'), false);
    }
  }
});

// Upload material(s)
exports.uploadMaterials = async (req, res) => {
  try {
    const { title, description, subject, grade, tags, categories, type, difficulty, estimatedTime, language, license } = req.body;
    const userId = req.user._id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. Please attach at least one file.'
      });
    }

    const uploadedMaterials = [];

    for (const file of req.files) {
      // Determine material type based on file mimetype
      let materialType = type;
      if (!materialType) {
        if (file.mimetype.startsWith('image/')) materialType = 'image';
        else if (file.mimetype === 'application/pdf') materialType = 'pdf';
        else if (file.mimetype.includes('document') || file.mimetype.includes('word')) materialType = 'document';
        else if (file.mimetype.includes('presentation') || file.mimetype.includes('powerpoint')) materialType = 'presentation';
        else if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel')) materialType = 'spreadsheet';
        else if (file.mimetype.startsWith('video/')) materialType = 'video';
        else if (file.mimetype.includes('zip') || file.mimetype.includes('rar')) materialType = 'archive';
      }

      // Extract metadata from Cloudinary
      let metadata = {};
      try {
        const result = await cloudinary.api.resource(file.public_id);
        metadata = {
          extractedText: result.context?.custom?.caption || '',
          thumbnailUrl: result.secure_url.replace(/\.[^.]+$/, '_thumbnail$&'),
          duration: result.duration,
          dimensions: {
            width: result.width,
            height: result.height
          },
          pages: result.pages,
          wordCount: result.context?.custom?.word_count || 0
        };
      } catch (error) {
        console.warn('Could not extract metadata:', error.message);
      }

      const material = new Material({
        title: title || file.originalname,
        description: description || `Uploaded file: ${file.originalname}`,
        type: materialType,
        fileUrl: file.secure_url,
        fileName: file.filename,
        originalFileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: userId,
        subject,
        grade: grade ? parseInt(grade) : undefined,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
        difficulty,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
        language: language || 'en',
        license: license || 'copyright',
        metadata
      });

      await material.save();
      uploadedMaterials.push(material);
    }

    res.status(201).json({
      success: true,
      message: `${uploadedMaterials.length} material(s) uploaded successfully`,
      data: uploadedMaterials
    });

  } catch (error) {
    console.error('Upload materials error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload materials'
    });
  }
};

// Upload link material
exports.uploadLink = async (req, res) => {
  try {
    const { title, description, subject, grade, tags, categories, url, difficulty, estimatedTime, language, license } = req.body;
    const userId = req.user._id;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required for link materials'
      });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL provided'
      });
    }

    const material = new Material({
      title,
      description,
      type: 'link',
      fileUrl: url,
      fileName: url,
      originalFileName: url,
      uploadedBy: userId,
      subject,
      grade: grade ? parseInt(grade) : undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
      difficulty,
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      language: language || 'en',
      license: license || 'copyright'
    });

    await material.save();

    res.status(201).json({
      success: true,
      message: 'Link material uploaded successfully',
      data: material
    });

  } catch (error) {
    console.error('Upload link error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload link material'
    });
  }
};

// Get materials with filters
exports.getMaterials = async (req, res) => {
  try {
    const {
      subject,
      grade,
      type,
      tags,
      categories,
      sortBy = 'createdAt',
      sortOrder = '-1',
      page = 1,
      limit = 20,
      search
    } = req.query;

    let result;

    if (search) {
      result = await Material.searchMaterials(search, {
        subject,
        grade: grade ? parseInt(grade) : undefined,
        type,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } else {
      result = await Material.getFilteredMaterials({
        subject,
        grade: grade ? parseInt(grade) : undefined,
        type,
        tags: tags ? tags.split(',') : undefined,
        categories: categories ? categories.split(',') : undefined,
        sortBy,
        sortOrder: parseInt(sortOrder),
        page: parseInt(page),
        limit: parseInt(limit)
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get materials'
    });
  }
};

// Get material by ID
exports.getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const material = await Material.findById(id)
      .populate('uploadedBy', 'profile.firstName profile.lastName username profile.avatar')
      .populate('reviews.user', 'profile.firstName profile.lastName username profile.avatar');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if user can access this material
    if (material.status !== 'approved' && material.uploadedBy._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this material'
      });
    }

    // Increment view count
    if (material.status === 'approved' && material.isPublic) {
      await material.incrementViewCount();
    }

    res.status(200).json({
      success: true,
      data: material
    });

  } catch (error) {
    console.error('Get material by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get material'
    });
  }
};

// Download material
exports.downloadMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if material can be downloaded
    if (!material.canDownload) {
      return res.status(403).json({
        success: false,
        message: 'This material cannot be downloaded'
      });
    }

    // Increment download count
    await material.incrementDownloadCount();

    // For link materials, redirect to the URL
    if (material.type === 'link') {
      return res.redirect(material.fileUrl);
    }

    // For other materials, redirect to Cloudinary URL
    res.redirect(material.fileUrl);

  } catch (error) {
    console.error('Download material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download material'
    });
  }
};

// Get user's materials
exports.getUserMaterials = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const result = await Material.getUserMaterials(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get user materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user materials'
    });
  }
};

// Update material
exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if user owns this material
    if (material.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own materials'
      });
    }

    // Don't allow status updates through this endpoint
    delete updates.status;
    delete updates.approvedBy;
    delete updates.approvedAt;

    // Update arrays
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(tag => tag.trim());
    }
    if (updates.categories && typeof updates.categories === 'string') {
      updates.categories = updates.categories.split(',').map(cat => cat.trim());
    }

    Object.assign(material, updates);
    await material.save();

    res.status(200).json({
      success: true,
      message: 'Material updated successfully',
      data: material
    });

  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material'
    });
  }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if user owns this material or is admin
    if (material.uploadedBy.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own materials'
      });
    }

    // Delete from Cloudinary if not a link
    if (material.type !== 'link' && material.fileName) {
      try {
        await cloudinary.uploader.destroy(material.fileName);
      } catch (error) {
        console.warn('Failed to delete from Cloudinary:', error.message);
      }
    }

    await Material.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });

  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material'
    });
  }
};

// Add review to material
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    if (material.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only review approved materials'
      });
    }

    await material.addReview(userId, parseInt(rating), comment);

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: {
        rating: material.rating.average,
        count: material.rating.count
      }
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
};

// Get popular materials
exports.getPopularMaterials = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const materials = await Material.getPopularMaterials(parseInt(limit));

    res.status(200).json({
      success: true,
      data: materials
    });

  } catch (error) {
    console.error('Get popular materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular materials'
    });
  }
};

// Get pending materials for approval (admin only)
exports.getPendingMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = { status: 'pending' };
    const skip = (page - 1) * limit;

    const [materials, total] = await Promise.all([
      Material.find(query)
        .populate('uploadedBy', 'profile.firstName profile.lastName username profile.avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .exec(),
      Material.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        materials,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get pending materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending materials'
    });
  }
};

// Approve material (admin only)
exports.approveMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user._id;

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    material.status = 'approved';
    material.approvedBy = adminId;
    material.approvedAt = new Date();
    material.adminNotes = notes;

    await material.save();

    res.status(200).json({
      success: true,
      message: 'Material approved successfully',
      data: material
    });

  } catch (error) {
    console.error('Approve material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve material'
    });
  }
};

// Reject material (admin only)
exports.rejectMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    material.status = 'rejected';
    material.approvedBy = adminId;
    material.rejectedAt = new Date();
    material.adminNotes = reason;

    await material.save();

    res.status(200).json({
      success: true,
      message: 'Material rejected successfully',
      data: material
    });

  } catch (error) {
    console.error('Reject material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject material'
    });
  }
};

// Export upload middleware for use in routes
exports.upload = upload;

// Get pending materials for admin approval
exports.getPendingMaterials = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const materials = await Material.find({ status: 'pending' })
      .populate('uploadedBy', 'username email profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Material.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: {
        materials,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending materials'
    });
  }
};

// Approve material (admin only)
exports.approveMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const material = await Material.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedBy: req.user._id,
        approvedAt: new Date(),
        adminNotes: notes || ''
      },
      { new: true }
    ).populate('uploadedBy', 'username email');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Notify uploader
    await Notification.create({
      recipient: material.uploadedBy._id,
      type: 'material_approved',
      title: 'Material Approved',
      message: `Your material "${material.title}" has been approved and is now visible to all users.`,
      data: { materialId: material._id }
    });

    res.status(200).json({
      success: true,
      message: 'Material approved successfully',
      data: material
    });
  } catch (error) {
    console.error('Approve material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve material'
    });
  }
};

// Reject material (admin only)
exports.rejectMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const material = await Material.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        rejectedBy: req.user._id,
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    ).populate('uploadedBy', 'username email');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Notify uploader
    await Notification.create({
      recipient: material.uploadedBy._id,
      type: 'material_rejected',
      title: 'Material Rejected',
      message: `Your material "${material.title}" was not approved. Reason: ${reason}`,
      data: { materialId: material._id, reason }
    });

    res.status(200).json({
      success: true,
      message: 'Material rejected',
      data: material
    });
  } catch (error) {
    console.error('Reject material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject material'
    });
  }
};
