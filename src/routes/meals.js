const express = require('express');
const asyncHandler = require('express-async-handler');
const Meal = require('../models/Meal');
const MealHistory = require('../models/MealHistory');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all meals for a child
// @route   GET /api/meals
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { childId, page = 1, limit = 20 } = req.query;

  const query = { parentId: req.user.id };

  if (childId) {
    query.childId = childId;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const meals = await Meal.find(query)
    .populate('childId', 'name avatar')
    .populate('breakfast.foods.food', 'name category nutrients icon')
    .populate('lunch.foods.food', 'name category nutrients icon')
    .populate('dinner.foods.food', 'name category nutrients icon')
    .populate('snack.foods.food', 'name category nutrients icon')
    .sort({ createdAt: -1 })
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
  const meal = await Meal.find({childId: req.params.id})
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
    breakfast,
    lunch,
    dinner,
    snack
  } = req.body;

  const meal = await Meal.create({
    childId,
    parentId: req.user.id,
    breakfast,
    lunch,
    dinner,
    snack
  });

  const populatedMeal = await Meal.findById(meal._id)
    .populate('childId', 'name avatar')
    .populate('breakfast.foods.food', 'name category nutrients icon')
    .populate('lunch.foods.food', 'name category nutrients icon')
    .populate('dinner.foods.food', 'name category nutrients icon')
    .populate('snack.foods.food', 'name category nutrients icon');

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
      parentId: req.user.id
    },
    req.body,
    {
      new: true,
      runValidators: true
    }
  )
    .populate('childId', 'name avatar')
    .populate('breakfast.foods.food', 'name category nutrients icon')
    .populate('lunch.foods.food', 'name category nutrients icon')
    .populate('dinner.foods.food', 'name category nutrients icon')
    .populate('snack.foods.food', 'name category nutrients icon');

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
    parentId: req.user.id
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

// ===== MEAL HISTORY ROUTES =====

// @desc    Get meal history for a child
// @route   GET /api/meals/history
// @access  Private
router.get('/history', protect, asyncHandler(async (req, res) => {
  const { childId, startDate, endDate, page = 1, limit = 20 } = req.query;

  const query = { parentId: req.user.id };

  if (childId) {
    query.childId = childId;
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const mealHistory = await MealHistory.find(query)
    .populate('childId', 'name avatar')
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await MealHistory.countDocuments(query);

  res.status(200).json({
    success: true,
    count: mealHistory.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    data: mealHistory
  });
}));

// @desc    Get meal history by ID
// @route   GET /api/meals/history/:id
// @access  Private
router.get('/history/:id', protect, asyncHandler(async (req, res) => {
  console.log("req.params.id: >>--->", req.params.id);
  const mealHistory = await MealHistory.find({
    childId: req.params.id,
  });

  if (!mealHistory) {
    return res.status(404).json({
      success: false,
      error: 'Meal history not found'
    });
  }

  res.status(200).json({
    success: true,
    data: mealHistory
  });
}));

// @desc    Create new meal history
// @route   POST /api/meals/history
// @access  Private
router.post('/history', protect, asyncHandler(async (req, res) => {
  console.log("req.body: >>--->", req.body);
  const {
    childId,
    date,
    breakfast,
    lunch,
    dinner,
    snack,
    dailyTotalPlan,
    dailyTotalEaten,
    dailyPercentage,
  } = req.body;

  // Check if meal history already exists for this date and child
  const existingHistory = await MealHistory.findOne({
    childId,
    date: new Date(date),
    parentId: req.user.id
  });

  if (existingHistory) {
    return res.status(400).json({
      success: false,
      error: 'Meal history already exists for this date'
    });
  }

  const mealHistory = await MealHistory.create({
    childId,
    parentId: req.user.id,
    date: date ? new Date(date) : new Date(),
    breakfast,
    lunch,
    dinner,
    snack,
    dailyTotalPlan,
    dailyTotalEaten,
    dailyPercentage,
  });

  const populatedHistory = await MealHistory.findById(mealHistory._id)
    .populate('childId', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Meal history created successfully',
    data: populatedHistory
  });
}));

// @desc    Get meal history by ID
// @route   GET /api/meals/history/:id
// @access  Private
// router.get('/history/:id', protect, asyncHandler(async (req, res) => {
//   console.log("req.params.id: >>--->", req.params.id);
//   const mealHistory = await MealHistory.findOne({
//     childId: req.params.id,
//     // parentId: req.user.id
//   });

//   if (!mealHistory) {
//     return res.status(404).json({
//       success: false,
//       error: 'Meal history not found'
//     });
//   } 

//   res.status(200).json({
//     success: true,
//     data: mealHistory
//   });
// }));

// @desc    Update meal history
// @route   PUT /api/meals/history/:id
// @access  Private
router.put('/history/:id', protect, asyncHandler(async (req, res) => {
  const mealHistory = await MealHistory.findOneAndUpdate(
    {
      _id: req.params.id,
      parentId: req.user.id
    },
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('childId', 'name avatar');

  if (!mealHistory) {
    return res.status(404).json({
      success: false,
      error: 'Meal history not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Meal history updated successfully',
    data: mealHistory
  });
}));

// @desc    Delete meal history
// @route   DELETE /api/meals/history/:id
// @access  Private
router.delete('/history/:id', protect, asyncHandler(async (req, res) => {
  const mealHistory = await MealHistory.findOneAndDelete({
    _id: req.params.id,
    parentId: req.user.id
  });

  if (!mealHistory) {
    return res.status(404).json({
      success: false,
      error: 'Meal history not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Meal history deleted successfully'
  });
}));

// @desc    Get meal history summary/analytics
// @route   GET /api/meals/history/summary
// @access  Private
router.get('/history/summary', protect, asyncHandler(async (req, res) => {
  const { childId, days = 7 } = req.query;

  const query = { parentId: req.user.id };
  if (childId) {
    query.childId = childId;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  query.date = { $gte: startDate };

  const mealHistory = await MealHistory.find(query)
    .populate('childId', 'name avatar')
    .sort({ date: -1 });

  // Calculate summary statistics
  const summary = {
    totalDays: mealHistory.length,
    averageScore: 0,
    mealTypeStats: {
      breakfast: { totalTime: 0, averagePercentage: 0, count: 0 },
      lunch: { totalTime: 0, averagePercentage: 0, count: 0 },
      dinner: { totalTime: 0, averagePercentage: 0, count: 0 },
      snack: { totalTime: 0, averagePercentage: 0, count: 0 }
    }
  };

  if (mealHistory.length > 0) {
    let totalScore = 0;
    
    mealHistory.forEach(history => {
      totalScore += history.totalScore || 0;
      
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
        if (history[mealType] && history[mealType].foods && history[mealType].foods.length > 0) {
          summary.mealTypeStats[mealType].count++;
          summary.mealTypeStats[mealType].totalTime += history[mealType].totalTime || 0;
          
          let mealPercentage = 0;
          history[mealType].foods.forEach(food => {
            mealPercentage += food.percentage || 0;
          });
          summary.mealTypeStats[mealType].averagePercentage += mealPercentage / history[mealType].foods.length;
        }
      });
    });

    summary.averageScore = Math.round(totalScore / mealHistory.length);
    
    // Calculate averages for meal types
    ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
      if (summary.mealTypeStats[mealType].count > 0) {
        summary.mealTypeStats[mealType].averagePercentage = Math.round(summary.mealTypeStats[mealType].averagePercentage / summary.mealTypeStats[mealType].count);
        summary.mealTypeStats[mealType].totalTime = Math.round(summary.mealTypeStats[mealType].totalTime / summary.mealTypeStats[mealType].count);
      }
    });
  }

  res.status(200).json({
    success: true,
    data: summary
  });
}));

module.exports = router; 