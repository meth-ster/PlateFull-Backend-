const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  time: {
    type: String,
    required: true
  },
  foods: [{
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'],
      required: true
    },
    consumed: {
      type: Number,
      min: 0,
      max: 100,
      default: 100 // percentage consumed
    },
    notes: String
  }],
  totalNutrition: {
    calories: {
      type: Number,
      default: 0
    },
    protein: {
      type: Number,
      default: 0
    },
    carbs: {
      type: Number,
      default: 0
    },
    fiber: {
      type: Number,
      default: 0
    },
    sugar: {
      type: Number,
      default: 0
    },
    fat: {
      type: Number,
      default: 0
    }
  },
  photos: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  mood: {
    type: String,
    enum: ['happy', 'neutral', 'sad', 'excited', 'picky'],
    default: 'neutral'
  },
  environment: {
    location: {
      type: String,
      enum: ['home', 'school', 'restaurant', 'park', 'other'],
      default: 'home'
    },
    company: {
      type: String,
      enum: ['alone', 'family', 'friends', 'caregiver'],
      default: 'family'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  isCompleted: {
    type: Boolean,
    default: true
  },
  gamification: {
    pointsEarned: {
      type: Number,
      default: 0
    },
    badgesEarned: [{
      id: String,
      name: String,
      description: String
    }],
    streakUpdated: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Calculate total nutrition based on foods consumed
mealSchema.methods.calculateTotalNutrition = function() {
  let total = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    fat: 0
  };

  this.foods.forEach(foodItem => {
    const consumedRatio = foodItem.consumed / 100;
    const food = foodItem.food; // This should be populated
    
    if (food && food.nutrients) {
      total.calories += (food.nutrients.calories * consumedRatio);
      total.protein += (food.nutrients.protein * consumedRatio);
      total.carbs += (food.nutrients.carbs * consumedRatio);
      total.fiber += (food.nutrients.fiber * consumedRatio);
      total.sugar += (food.nutrients.sugar * consumedRatio);
      total.fat += (food.nutrients.fat * consumedRatio);
    }
  });

  return total;
};

// Update total nutrition before saving
mealSchema.pre('save', function(next) {
  if (this.foods.length > 0) {
    this.totalNutrition = this.calculateTotalNutrition();
  }
  next();
});

// Index for efficient queries
mealSchema.index({ child: 1, date: -1 });
mealSchema.index({ parent: 1, date: -1 });
mealSchema.index({ date: 1, type: 1 });

module.exports = mongoose.model('Meal', mealSchema); 