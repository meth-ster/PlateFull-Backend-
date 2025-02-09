const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a child name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  height: {
    type : String
  },
  weight : {
    type: String
  },
  avatar: {
    type: String,
    default: ''
  },
  ageRange: {
    type: String,
    enum: ['6-12m', '1-2y', '2-3y', '3-4y', '4-5y', '5-6y', '6+y'],
    required: true
  },
  allergies: [{
    type: String,
    enum: ['none', 'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'egg_free', 'soy_free']
  }],
  fruits: [{
    type: String
  }],
  vegetables: [{
    type: String
  }],
  proteins: [{
    type: String
  }],
  nutritionGoals: {
    dailyCalories: Number,
    dailyProtein: Number,
    dailyCarbs: Number,
    dailyFat: Number,
    dailyFiber: Number
  },
  preferences: {
    favoriteFoods: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food'
    }],
    dislikedFoods: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food'
    }],
    mealTimes: {
      breakfast: String,
      lunch: String,
      dinner: String,
      snacks: [String]
    }
  },
  gamification: {
    level: {
      type: Number,
      default: 1
    },
    experience: {
      type: Number,
      default: 0
    },
    badges: [{
      id: String,
      name: String,
      description: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastMealDate: Date
    },
    achievements: [{
      id: String,
      name: String,
      description: String,
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Child', childSchema); 