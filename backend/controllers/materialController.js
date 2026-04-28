const Material = require('../models/Material');

// @desc    Upload new study material
// @route   POST /api/materials
// @access  Private (Student/Tutor)
exports.uploadMaterial = async (req, res) => {
  const { title, description, fileUrl, fileType, subject, grade, price, tags } = req.body;

  try {
    const material = await Material.create({
      title,
      description,
      fileUrl,
      fileType,
      subject,
      grade,
      price,
      tags,
      uploaderId: req.user._id,
      moderationStatus: 'pending' // Review required
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get materials uploaded by current user
// @route   GET /api/materials/my
// @access  Private
exports.getMyMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ uploaderId: req.user._id });
    res.json(materials);
  } catch (error) {
    console.error('Get my materials error:', error);
    res.json([]);
  }
};

// @desc    Get all approved materials (Filtered by Grade for students)
// @route   GET /api/materials
// @access  Private (Authenticated)
exports.getMaterials = async (req, res) => {
  try {
    const query = { moderationStatus: 'approved' };
    
    // Strict Access Control: Students only see their own grade
    if (req.user.role === 'student' && req.user.grade) {
      query.grade = req.user.grade.toString();
    } else if (req.query.grade) {
      // Admins/Tutors/Unset users can use query param
      query.grade = req.query.grade;
    }

    const materials = await Material.find(query)
      .populate('uploaderId', 'username profile.firstName profile.lastName');
    res.json(materials);
  } catch (error) {
    console.error('Get materials error:', error);
    res.json([]);
  }
};

// @desc    Get material by ID
// @route   GET /api/materials/:id
// @access  Private (Authenticated)
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploaderId', 'username profile.firstName profile.lastName');
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Access Control: Students restricted to their grade
    if (req.user.role === 'student' && material.grade !== req.user.grade?.toString()) {
       return res.status(403).json({ message: 'Access denied: This material is for a different grade level.' });
    }

    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update material (approve/reject)
// @route   PUT /api/materials/:id/moderate
// @access  Private (Admin/Moderator)
exports.moderateMaterial = async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    const material = await Material.findById(req.params.id);

    if (material) {
      material.moderationStatus = status;
      material.isApproved = (status === 'approved');
      const updatedMaterial = await material.save();
      res.json(updatedMaterial);
    } else {
      res.status(404).json({ message: 'Material not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private (Owner/Admin)
exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    if (material.uploaderId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const fieldsToUpdate = ['title', 'description', 'fileUrl', 'fileType', 'subject', 'grade', 'price', 'tags'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) material[field] = req.body[field];
    });

    // Reset moderation on update
    material.moderationStatus = 'pending';
    material.isApproved = false;

    const updated = await material.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (Owner/Admin)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (material) {
      if (material.uploaderId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'User not authorized' });
      }
      await material.deleteOne();
      res.json({ message: 'Material removed' });
    } else {
      res.status(404).json({ message: 'Material not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Purchase material
// @route   POST /api/materials/:id/purchase
// @access  Private (Student)
exports.purchaseMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    if (material.price === 0) {
      return res.status(400).json({ message: 'This material is free' });
    }

    if (material.purchasedBy.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already purchased' });
    }

    // In a real app, integrate payment here. For now, we simulate.
    material.purchasedBy.push(req.user._id);
    await material.save();

    res.json({ success: true, message: 'Material purchased successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
