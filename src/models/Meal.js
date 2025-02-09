const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
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
  breakfast: {
    mealTime: {
      type: String,
      trim: true
    },
    foods: [{
      food: {
        type: String,
        // ref: 'Food',
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      // unit: {
      //   type: String,
      //   enum: ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'],
      //   required: true
      // }
    }],
    // totalAmount: {
    //   type: Number,
    //   default: 0
    // }
  },
  lunch: {
    mealTime: {
      type: String,
      trim: true
    },
    foods: [{
      food: {
        type: String,
        // ref: 'Food',
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      // unit: {
      //   type: String,
      //   enum: ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'],
      //   required: true
      // }
    }],
    // totalAmount: {
    //   type: Number,
    //   default: 0
    // }
  },
  dinner: {
    mealTime: {
      type: String,
      trim: true
    },
    foods: [{
      food: {
        type: String,
        // ref: 'Food',
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      // unit: {
      //   type: String,
      //   enum: ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'],
      //   required: true
      // }
    }],
    // totalAmount: {
    //   type: Number,
    //   default: 0
    // }
  },
  snack: {
    mealTime: {
      type: String,
      trim: true
    },
    foods: [{
      food: {
        type: String,
        // ref: 'Food',
        required: true
      },
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      // unit: {
      //   type: String,
      //   enum: ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice'],
      //   required: true
      // }
    }],
    // totalAmount: {
    //   type: Number,
    //   default: 0
    // }
  }
}, {
  timestamps: true
});

// Calculate total amounts for each meal type
mealSchema.methods.calculateTotalAmounts = function() {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  
  mealTypes.forEach(mealType => {
    if (this[mealType] && this[mealType].foods) {
      let totalAmount = 0;
      this[mealType].foods.forEach(foodItem => {
        totalAmount += foodItem.amount || 0;
      });
      this[mealType].totalAmount = totalAmount;
    }
  });
};

// Update total amounts before saving
mealSchema.pre('save', function(next) {
  this.calculateTotalAmounts();
  next();
});

// Index for efficient queries
mealSchema.index({ childId: 1, createdAt: -1 });
mealSchema.index({ parentId: 1, createdAt: -1 });
mealSchema.index({ childId: 1, parentId: 1 });

module.exports = mongoose.model('Meal', mealSchema); 