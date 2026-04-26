const School = require('../models/School');
const User = require('../models/User');

/**
 * Get all schools
 */
exports.getAllSchools = async (req, res) => {
  try {
    const { district, status, search } = req.query;
    const query = {};

    if (district) query['address.district'] = district;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const schools = await School.find(query)
      .sort({ createdAt: -1 })
      .populate('adminUsers.user', 'username profile');

    res.json({
      success: true,
      data: { schools }
    });
  } catch (error) {
    console.error('Get all schools error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schools' });
  }
};

/**
 * Get school by ID
 */
exports.getSchoolById = async (req, res) => {
  try {
    const school = await School.findById(req.params.id)
      .populate('adminUsers.user', 'username profile');

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({
      success: true,
      data: { school }
    });
  } catch (error) {
    console.error('Get school by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school details' });
  }
};

/**
 * Get school by Code
 */
exports.getSchoolByCode = async (req, res) => {
  try {
    const query = req.params.code;
    let school = await School.findOne({ code: query.toUpperCase() })
      .select('name district type branding');

    if (!school) {
      // Try searching by name if code fails
      school = await School.findOne({ name: { $regex: query, $options: 'i' } })
        .select('name district type branding');
    }

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({
      success: true,
      data: { school }
    });
  } catch (error) {
    console.error('Get school by code error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch school details' });
  }
};

/**
 * Create a new school
 */
exports.createSchool = async (req, res) => {
  try {
    const { name, code, email, type, district } = req.body;

    // Check for existing code
    const existing = await School.findOne({ code });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Institutional code already registered' });
    }

    const school = await School.create({
      name,
      code,
      email,
      type,
      address: { district },
      status: 'active',
      subscription: {
        plan: 'enterprise',
        startDate: new Date(),
        maxUsers: 1000
      }
    });

    res.status(201).json({
      success: true,
      message: 'Institution provisioned successfully',
      data: { school }
    });
  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({ success: false, message: 'Failed to provision school' });
  }
};

/**
 * Update school
 */
exports.updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const school = await School.findByIdAndUpdate(id, req.body, { new: true });

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({
      success: true,
      message: 'Institution configuration updated',
      data: { school }
    });
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ success: false, message: 'Failed to update school' });
  }
};

/**
 * Delete school
 */
exports.deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const school = await School.findByIdAndDelete(id);

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    res.json({
      success: true,
      message: 'Institution decommissioned successfully'
    });
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete school' });
  }
};
