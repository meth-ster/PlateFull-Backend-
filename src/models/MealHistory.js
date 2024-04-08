const mongoose = require('mongoose');

const mealHistorySchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  breakfast: {
    foods: [{
      foodName: {
        type: String,
        required: true,
        trim: true
      },
      plan: {
        type: Number,
        required: true,
        min: 0
      },
      eaten: {
        type: Number,
        required: true,
        min: 0
      },
      percentage: {
        type: Number,
        required: true,
        // min: 0,
        // max: 100
      }
    }],
    totalTime: {
      type: Number,
      default: 0,
      min: 0
    },
    mealPercentage: {
      type: Number,
      required: true,
      // min: 0,
      // max: 100
    },
    totalPlan: {
      type: Number,
    },
    totalEaten: {
      type: Number,
    },
  },
  lunch: {
    foods: [{
      foodName: {
        type: String,
        required: true,
        trim: true
      },
      plan: {
        type: Number,
        required: true,
        min: 0
      },
      eaten: {
        type: Number,
        required: true,
        min: 0
      },
      percentage: {
        type: Number,
        required: true,
        // min: 0,
        // max: 100
      }
    }],
    totalTime: {
      type: Number,
      default: 0,
      min: 0
    },
    mealPercentage: {
      type: Number,
      required: true,
      // min: 0,
      // max: 100
    },
    totalPlan: {
      type: Number,
    },
    totalEaten: {
      type: Number,
    },
  },
  dinner: {
    foods: [{
      foodName: {
        type: String,
        required: true,
        trim: true
      },
      plan: {
        type: Number,
        required: true,
        min: 0
      },
      eaten: {
        type: Number,
        required: true,
        min: 0
      },
      percentage: {
        type: Number,
        required: true,
        // min: 0,
        // max: 100
      }
    }],
    totalTime: {
      type: Number,
      default: 0,
      min: 0
    },
    mealPercentage: {
      type: Number,
      required: true,
      // min: 0,
      // max: 100
    },
    totalPlan: {
      type: Number,
    },
    totalEaten: {
      type: Number,
    },
  },
  snack: {
    foods: [{
      foodName: {
        type: String,
        required: true,
        trim: true
      },
      plan: {
        type: Number,
        required: true,
        min: 0
      },
      eaten: {
        type: Number,
        required: true,
        min: 0
      },
      percentage: {
        type: Number,
        required: true,
        // min: 0,
        // max: 100
      }
    }],
    totalTime: {
      type: Number,
      default: 0,
      min: 0
    },
    mealPercentage: {
      type: Number,
      required: true,
      // min: 0,
      // max: 100
    },
    totalPlan: {
      type: Number,
    },
    totalEaten: {
      type: Number,
    },
  },
  dailyPercentage: {
    type: Number,
    default: 0,
    // min: 0,
    // max: 100
  },
  dailyTotalPlan: {
    type: Number,
    default: 0,
  },
  dailyTotalEaten: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true
});

// Calculate total score based on all meal percentages
mealHistorySchema.methods.calculateDailyPercentage = function() {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  let totalPercentage = 0;
  let mealCount = 0;
  
  mealTypes.forEach(mealType => {
    if (this[mealType] && this[mealType].foods && this[mealType].foods.length > 0) {
      let mealPercentage = 0;
      this[mealType].foods.forEach(food => {
        mealPercentage += food.percentage || 0;
      });
      totalPercentage += mealPercentage / this[mealType].foods.length;
      mealCount++;
    }
  });
  
  this.dailyPercentage = mealCount > 0 ? Math.round(totalPercentage / mealCount) : 0;
};

// Calculate percentages for each food item
mealHistorySchema.methods.calculatePercentages = function() {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  mealTypes.forEach(mealType => {
    if (this[mealType] && this[mealType].foods) {
      this[mealType].foods.forEach(food => {
        if (food.plan > 0) {
          food.percentage = Math.round((food.eaten / food.plan) * 100);
        } else {
          food.percentage = 0;
        }
      });
    }
  });
};

// Update calculations before saving
mealHistorySchema.pre('save', function(next) {
  this.calculatePercentages();
  this.calculateDailyPercentage();
  next();
});

// Index for efficient queries
mealHistorySchema.index({ childId: 1, date: -1 });
mealHistorySchema.index({ parentId: 1, date: -1 });
mealHistorySchema.index({ childId: 1, parentId: 1, date: -1 });

module.exports = mongoose.model('MealHistory', mealHistorySchema);
