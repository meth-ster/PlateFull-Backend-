const express = require('express');
const asyncHandler = require('express-async-handler');
const Food = require('../models/Food');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all foods
// @route   GET /api/foods
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;

  const query = { isActive: true };
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const foods = await Food.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Food.countDocuments(query);

  res.status(200).json({
    success: true,
    count: foods.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    data: foods
  });
}));

// @desc    Get food by ID
// @route   GET /api/foods/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const food = await Food.findById(req.params.id);

  if (!food) {
    return res.status(404).json({
      success: false,
      error: 'Food not found'
    });
  }

  res.status(200).json({
    success: true,
    data: food
  });
}));

// @desc    Get foods by category
// @route   GET /api/foods/category/:category
// @access  Public
router.get('/category/:category', asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const foods = await Food.find({ category, isActive: true })
    .sort({ name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Food.countDocuments({ category, isActive: true });

  res.status(200).json({
    success: true,
    count: foods.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    data: foods
  });
}));

// @desc    Search foods
// @route   GET /api/foods/search/:query
// @access  Public
router.get('/search/:query', asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const foods = await Food.find({
    $text: { $search: query },
    isActive: true
  })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Food.countDocuments({
    $text: { $search: query },
    isActive: true
  });

  res.status(200).json({
    success: true,
    count: foods.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    data: foods
  });
}));

module.exports = router; 