const express = require('express');
const asyncHandler = require('express-async-handler');
const Child = require('../models/Child');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get child's gamification data
// @route   GET /api/gamification/:childId
// @access  Private
router.get('/:childId', protect, asyncHandler(async (req, res) => {
  const child = await Child.findOne({
    _id: req.params.childId,
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
    data: {
      level: child.gamification.level,
      experience: child.gamification.experience,
      badges: child.gamification.badges,
      streak: child.gamification.streak,
      achievements: child.gamification.achievements
    }
  });
}));

// @desc    Update child's experience and level
// @route   PUT /api/gamification/:childId/experience
// @access  Private
router.put('/:childId/experience', protect, asyncHandler(async (req, res) => {
  const { experiencePoints } = req.body;

  const child = await Child.findOne({
    _id: req.params.childId,
    parent: req.user.id,
    isActive: true
  });

  if (!child) {
    return res.status(404).json({
      success: false,
      error: 'Child not found'
    });
  }

  // Calculate new experience and level
  const newExperience = child.gamification.experience + experiencePoints;
  const newLevel = Math.floor(newExperience / 100) + 1;

  child.gamification.experience = newExperience;
  child.gamification.level = newLevel;

  await child.save();

  res.status(200).json({
    success: true,
    message: 'Experience updated successfully',
    data: {
      level: child.gamification.level,
      experience: child.gamification.experience,
      experienceGained: experiencePoints
    }
  });
}));

// @desc    Add badge to child
// @route   POST /api/gamification/:childId/badges
// @access  Private
router.post('/:childId/badges', protect, asyncHandler(async (req, res) => {
  const { badgeId, name, description } = req.body;

  const child = await Child.findOne({
    _id: req.params.childId,
    parent: req.user.id,
    isActive: true
  });

  if (!child) {
    return res.status(404).json({
      success: false,
      error: 'Child not found'
    });
  }

  // Check if badge already exists
  const existingBadge = child.gamification.badges.find(
    badge => badge.id === badgeId
  );

  if (existingBadge) {
    return res.status(400).json({
      success: false,
      error: 'Badge already earned'
    });
  }

  child.gamification.badges.push({
    id: badgeId,
    name,
    description,
    earnedAt: new Date()
  });

  await child.save();

  res.status(201).json({
    success: true,
    message: 'Badge earned successfully',
    data: {
      badge: {
        id: badgeId,
        name,
        description
      }
    }
  });
}));

// @desc    Update child's streak
// @route   PUT /api/gamification/:childId/streak
// @access  Private
router.put('/:childId/streak', protect, asyncHandler(async (req, res) => {
  const child = await Child.findOne({
    _id: req.params.childId,
    parent: req.user.id,
    isActive: true
  });

  if (!child) {
    return res.status(404).json({
      success: false,
      error: 'Child not found'
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastMealDate = child.gamification.streak.lastMealDate
    ? new Date(child.gamification.streak.lastMealDate)
    : null;

  if (lastMealDate) {
    lastMealDate.setHours(0, 0, 0, 0);
  }

  // Check if it's a consecutive day
  if (!lastMealDate || lastMealDate.getTime() === today.getTime() - 86400000) {
    child.gamification.streak.current += 1;
    if (child.gamification.streak.current > child.gamification.streak.longest) {
      child.gamification.streak.longest = child.gamification.streak.current;
    }
  } else if (lastMealDate && lastMealDate.getTime() !== today.getTime()) {
    // Reset streak if more than one day has passed
    child.gamification.streak.current = 1;
  }

  child.gamification.streak.lastMealDate = today;

  await child.save();

  res.status(200).json({
    success: true,
    message: 'Streak updated successfully',
    data: {
      currentStreak: child.gamification.streak.current,
      longestStreak: child.gamification.streak.longest
    }
  });
}));

module.exports = router; 