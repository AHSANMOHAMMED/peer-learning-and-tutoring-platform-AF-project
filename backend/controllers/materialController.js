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
    res.status(500).json({ message: error.message });
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
      await material.remove();
      res.json({ message: 'Material removed' });
    } else {
      res.status(404).json({ message: 'Material not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
