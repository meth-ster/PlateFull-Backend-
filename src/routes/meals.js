const express = require('express');
const asyncHandler = require('express-async-handler');
const Meal = require('../models/Meal');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all meals for a child
// @route   GET /api/meals
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { childId, date, type, page = 1, limit = 20 } = req.query;

  const query = { parent: req.user.id };

  if (childId) {
    query.child = childId;
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    query.date = { $gte: startDate, $lt: endDate };
  }

  if (type) {
    query.type = type;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const meals = await Meal.find(query)
    .populate('child', 'name avatar')
    .populate('foods.food', 'name category nutrients icon')
    .sort({ date: -1, time: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Meal.countDocuments(query);

  res.status(200).json({
    success: true,
    count: meals.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    data: meals
  });
}));

// @desc    Get meal by ID
// @route   GET /api/meals/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const meal = await Meal.findOne({
    _id: req.params.id,
    parent: req.user.id
  })
    .populate('child', 'name avatar')
    .populate('foods.food', 'name category nutrients icon');

  if (!meal) {
    return res.status(404).json({
      success: false,
      error: 'Meal not found'
    });
  }

  res.status(200).json({
    success: true,
    data: meal
  });
}));

// @desc    Create new meal
// @route   POST /api/meals
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    childId,
    type,
    date,
    time,
    foods,
    photos,
    mood,
    environment,
    notes
  } = req.body;

  const meal = await Meal.create({
    child: childId,
    parent: req.user.id,
    type,
    date,
    time,
    foods,
    photos,
    mood,
    environment,
    notes
  });

  const populatedMeal = await Meal.findById(meal._id)
    .populate('child', 'name avatar')
    .populate('foods.food', 'name category nutrients icon');

  res.status(201).json({
    success: true,
    message: 'Meal logged successfully',
    data: populatedMeal
  });
}));

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const meal = await Meal.findOneAndUpdate(
    {
      _id: req.params.id,
      parent: req.user.id
    },
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
    .populate('child', 'name avatar')
    .populate('foods.food', 'name category nutrients icon');

  if (!meal) {
    return res.status(404).json({
      success: false,
      error: 'Meal not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Meal updated successfully',
    data: meal
  });
}));

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const meal = await Meal.findOneAndDelete({
    _id: req.params.id,
    parent: req.user.id
  });

  if (!meal) {
    return res.status(404).json({
      success: false,
      error: 'Meal not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Meal deleted successfully'
  });
}));

module.exports = router; 