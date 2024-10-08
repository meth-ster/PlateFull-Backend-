const express = require('express');
const asyncHandler = require('express-async-handler');
const Child = require('../models/Child');
const User = require('../models/User');
const { protect, parent } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all children for a parent
// @route   GET /api/children
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const children = await Child.find({ parent: req.user.id, isActive: true });

  res.status(200).json({
    success: true,
    count: children.length,
    data: children
  });
}));

// @desc    Get child by ID
// @route   GET /api/children/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const child = await Child.findOne({
    _id: req.params.id,
    parent: req.user.id,
    isActive: true
  });

  if (!child) {
    return res.status(404).json({
      success: false,
      error: 'Child not found'
    });
  }

  res.status(200).json({
    success: true,
    data: child
  });
}));

// @desc    Create new child
// @route   POST /api/children
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    name,
    ageRange,
    gender,
    allergies
  } = req.body;

  // Validate ageRange
  const validAgeRanges = ['6-12m', '1-2y', '2-3y', '3-4y', '4-5y', '5-6y', '6+y'];
  if (!ageRange || !validAgeRanges.includes(ageRange)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid age range'
    });
  }

  const child = await Child.create({
    parent: req.user.id,
    name,
    ageRange,
    gender,
    allergies
  });

  // Add child to user's children array
  await User.findByIdAndUpdate(
    req.user.id,
    { $push: { children: child._id } }
  );

  res.status(201).json({
    success: true,
    message: 'Child profile created successfully',
    data: child
  });
}));

// @desc    Update child
// @route   PUT /api/children/:id
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
  console.log('Update request received:', {
    childId: req.params.id,
    userId: req.user.id,
    body: req.body
  });

  // Validate request body
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body cannot be empty'
    });
  }

  // Validate ageRange if provided
  if (req.body.ageRange) {
    const validAgeRanges = ['6-12m', '1-2y', '2-3y', '3-4y', '4-5y', '5-6y', '6+y'];
    if (!validAgeRanges.includes(req.body.ageRange)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid age range'
      });
    }
  }

  // Validate gender if provided
  if (req.body.gender) {
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(req.body.gender)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid gender'
      });
    }
  }

  // First, check if the child exists
  const existingChild = await Child.findOne({
    _id: req.params.id,
    parent: req.user.id,
    isActive: true
  });

  console.log('Existing child found:', existingChild ? 'Yes' : 'No');

  if (!existingChild) {
    return res.status(404).json({
      success: false,
      error: 'Child not found'
    });
  }

  // Prepare update data (only include fields that are provided)
  const updateData = {};
  const allowedFields = ['name', 'ageRange', 'gender', 'allergies', 'fruits', 'vegetables', 'proteins', 'avatar'];
  
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  console.log('Update data prepared:', updateData);

  // Update the child
  const updatedChild = await Child.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  console.log('Updated child result:', updatedChild ? 'Success' : 'Failed');

  if (!updatedChild) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update child profile'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Child profile updated successfully',
    data: updatedChild
  });
}));

// @desc    Delete child
// @route   DELETE /api/children/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const child = await Child.findOneAndUpdate(
    {
      _id: req.params.id,
      parent: req.user.id,
      isActive: true
    },
    { isActive: false },
    { new: true }
  );

  if (!child) {
    return res.status(404).json({
      success: false,
      error: 'Child not found'
    });
  }

  // Remove child from user's children array
  await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { children: child._id } }
  );

  res.status(200).json({
    success: true,
    message: 'Child profile deleted successfully'
  });
}));

// @desc    Restore deleted child
// @route   PATCH /api/children/:id/restore
// @access  Private
router.patch('/:id/restore', protect, asyncHandler(async (req, res) => {
  const child = await Child.findOneAndUpdate(
    {
      _id: req.params.id,
      parent: req.user.id,
      isActive: false
    },
    { isActive: true },
    { new: true }
  );

  if (!child) {
    return res.status(404).json({
      success: false,
      error: 'Deleted child not found'
    });
  }

  // Add child back to user's children array
  await User.findByIdAndUpdate(
    req.user.id,
    { $push: { children: child._id } }
  );

  res.status(200).json({
    success: true,
    message: 'Child profile restored successfully',
    data: child
  });
}));

// @desc    Get all children (including deleted ones)
// @route   GET /api/children/all
// @access  Private
router.get('/all', protect, asyncHandler(async (req, res) => {
  const allChildren = await Child.find({ parent: req.user.id });
  const activeChildren = allChildren.filter(child => child.isActive);
  const deletedChildren = allChildren.filter(child => !child.isActive);

  res.status(200).json({
    success: true,
    data: {
      active: activeChildren,
      deleted: deletedChildren,
      total: allChildren.length,
      activeCount: activeChildren.length,
      deletedCount: deletedChildren.length
    }
  });
}));

module.exports = router; 