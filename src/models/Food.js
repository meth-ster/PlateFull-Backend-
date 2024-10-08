const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a food name'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['fruits', 'vegetables', 'proteins', 'grains', 'dairy'],
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  nutrients: {
    calories: {
      type: Number,
      required: true
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
    },
    sodium: {
      type: Number,
      default: 0
    },
    vitamins: [{
      type: String,
      enum: ['A', 'B1', 'B2', 'B3', 'B6', 'B12', 'C', 'D', 'E', 'K', 'Folate']
    }],
    minerals: [{
      type: String,
      enum: ['Calcium', 'Iron', 'Magnesium', 'Phosphorus', 'Potassium', 'Sodium', 'Zinc']
    }]
  },
  benefits: [{
    type: String,
    trim: true
  }],
  allergens: [{
    type: String,
    enum: ['gluten', 'dairy', 'eggs', 'soy', 'nuts', 'peanuts', 'fish', 'shellfish']
  }],
  ageRecommended: {
    type: String,
    enum: ['6+ months', '8+ months', '12+ months', '18+ months', '2+ years', '3+ years'],
    required: true
  },
  servingSize: {
    amount: Number,
    unit: {
      type: String,
      enum: ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice']
    }
  },
  preparation: {
    type: String,
    trim: true
  },
  storage: {
    type: String,
    trim: true
  },
  seasonality: [{
    type: String,
    enum: ['spring', 'summer', 'fall', 'winter', 'year-round']
  }],
  organic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  searchTags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Create text index for search
foodSchema.index({
  name: 'text',
  category: 'text',
  searchTags: 'text'
});

// Virtual for formatted nutrients
foodSchema.virtual('formattedNutrients').get(function() {
  return {
    calories: `${this.nutrients.calories} kcal`,
    protein: `${this.nutrients.protein}g`,
    carbs: `${this.nutrients.carbs}g`,
    fiber: `${this.nutrients.fiber}g`,
    sugar: `${this.nutrients.sugar}g`,
    fat: `${this.nutrients.fat}g`
  };
});

module.exports = mongoose.model('Food', foodSchema); 