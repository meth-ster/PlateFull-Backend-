const express = require('express');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get learning modules
// @route   GET /api/learning/modules
// @access  Public
router.get('/modules', asyncHandler(async (req, res) => {
  // Mock learning modules data
  const modules = [
    {
      id: 'nutrition-basics',
      title: 'Nutrition Basics',
      description: 'Learn about essential nutrients for children',
      ageRange: '6+ months',
      duration: '15 minutes',
      topics: ['Vitamins', 'Minerals', 'Proteins', 'Carbohydrates'],
      completed: false
    },
    {
      id: 'healthy-eating-habits',
      title: 'Healthy Eating Habits',
      description: 'Building good eating habits from an early age',
      ageRange: '1+ years',
      duration: '20 minutes',
      topics: ['Meal Planning', 'Portion Control', 'Snacking'],
      completed: false
    },
    {
      id: 'food-allergies',
      title: 'Food Allergies & Safety',
      description: 'Understanding and managing food allergies',
      ageRange: '6+ months',
      duration: '25 minutes',
      topics: ['Common Allergens', 'Symptoms', 'Prevention'],
      completed: false
    }
  ];

  res.status(200).json({
    success: true,
    count: modules.length,
    data: modules
  });
}));

// @desc    Get learning module by ID
// @route   GET /api/learning/modules/:id
// @access  Public
router.get('/modules/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Mock module content
  const moduleContent = {
    id,
    title: 'Nutrition Basics',
    description: 'Learn about essential nutrients for children',
    content: [
      {
        type: 'text',
        title: 'Introduction',
        content: 'Good nutrition is essential for your child\'s growth and development.'
      },
      {
        type: 'video',
        title: 'Understanding Nutrients',
        url: 'https://example.com/video1.mp4',
        duration: '5 minutes'
      },
      {
        type: 'quiz',
        title: 'Test Your Knowledge',
        questions: [
          {
            question: 'Which vitamin is important for bone health?',
            options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'],
            correct: 2
          }
        ]
      }
    ]
  };

  res.status(200).json({
    success: true,
    data: moduleContent
  });
}));

// @desc    Mark module as completed
// @route   POST /api/learning/modules/:id/complete
// @access  Private
router.post('/modules/:id/complete', protect, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { childId } = req.body;

  // In a real implementation, you would save this to the database
  res.status(200).json({
    success: true,
    message: 'Module completed successfully',
    data: {
      moduleId: id,
      childId,
      completedAt: new Date()
    }
  });
}));

// @desc    Get learning progress
// @route   GET /api/learning/progress/:childId
// @access  Private
router.get('/progress/:childId', protect, asyncHandler(async (req, res) => {
  const { childId } = req.params;

  // Mock progress data
  const progress = {
    childId,
    modulesCompleted: 2,
    totalModules: 5,
    currentStreak: 3,
    totalTimeSpent: 45, // minutes
    achievements: [
      {
        id: 'first-module',
        name: 'First Steps',
        description: 'Completed your first learning module',
        earnedAt: new Date()
      }
    ]
  };

  res.status(200).json({
    success: true,
    data: progress
  });
}));

module.exports = router; 