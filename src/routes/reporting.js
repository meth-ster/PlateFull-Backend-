const express = require('express');
const asyncHandler = require('express-async-handler');
const Meal = require('../models/Meal');
const Child = require('../models/Child');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get nutrition summary for a child
// @route   GET /api/reporting/nutrition/:childId
// @access  Private
router.get('/nutrition/:childId', protect, asyncHandler(async (req, res) => {
  const { childId } = req.params;

  // Verify child belongs to user
  const child = await Child.findOne({
    _id: childId,
    parent: req.user.id,
    isActive: true
  });

  if (!child) {
    return res.status(404).json({
      success: false,
      error: 'Child not found'
    });
  }

  const meals = await Meal.find({
    child: childId,
    parent: req.user.id
  });

  // Calculate nutrition totals
  const nutritionSummary = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFiber: 0,
    totalSugar: 0,
    totalFat: 0,
    mealCount: meals.length,
    averageCaloriesPerMeal: 0
  };

  meals.forEach(meal => {
    nutritionSummary.totalCalories += meal.totalNutrition.calories;
    nutritionSummary.totalProtein += meal.totalNutrition.protein;
    nutritionSummary.totalCarbs += meal.totalNutrition.carbs;
    nutritionSummary.totalFiber += meal.totalNutrition.fiber;
    nutritionSummary.totalSugar += meal.totalNutrition.sugar;
    nutritionSummary.totalFat += meal.totalNutrition.fat;
  });

  if (meals.length > 0) {
    nutritionSummary.averageCaloriesPerMeal = nutritionSummary.totalCalories / meals.length;
  }

  res.status(200).json({
    success: true,
    data: {
      child: {
        id: child._id,
        name: child.name,
        ageRange: child.ageRange
      },
      nutritionSummary
    }
  });
}));

module.exports = router; 