const mongoose = require('mongoose');
const Food = require('../models/Food');
require('dotenv').config();

const foods = [
  {
    name: 'Apple',
    category: 'fruits',
    icon: '/images/foods/apple.png',
    nutrients: {
      calories: 52,
      protein: 0.3,
      carbs: 14,
      fiber: 2.4,
      sugar: 10,
      fat: 0.2,
      sodium: 1,
      vitamins: ['C', 'K'],
      minerals: ['Potassium']
    },
    benefits: [
      'Rich in antioxidants',
      'Good source of fiber',
      'Supports heart health'
    ],
    allergens: [],
    ageRecommended: '6+ months',
    searchTags: ['apple', 'fruit', 'healthy', 'fiber']
  },
  {
    name: 'Banana',
    category: 'fruits',
    icon: '/images/foods/banana.png',
    nutrients: {
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fiber: 2.6,
      sugar: 12,
      fat: 0.3,
      sodium: 1,
      vitamins: ['B6', 'C'],
      minerals: ['Potassium', 'Magnesium']
    },
    benefits: [
      'Easy to digest',
      'Great energy source',
      'Helps with digestion'
    ],
    allergens: [],
    ageRecommended: '6+ months',
    searchTags: ['banana', 'fruit', 'energy', 'potassium']
  },
  {
    name: 'Carrot',
    category: 'vegetables',
    icon: '/images/foods/carrot.png',
    nutrients: {
      calories: 41,
      protein: 0.9,
      carbs: 10,
      fiber: 2.8,
      sugar: 4.7,
      fat: 0.2,
      sodium: 69,
      vitamins: ['A', 'C', 'K'],
      minerals: ['Potassium']
    },
    benefits: [
      'Excellent source of vitamin A',
      'Good for eye health',
      'Supports immune system'
    ],
    allergens: [],
    ageRecommended: '6+ months',
    searchTags: ['carrot', 'vegetable', 'vitamin a', 'eye health']
  },
  {
    name: 'Chicken Breast',
    category: 'proteins',
    icon: '/images/foods/chicken.png',
    nutrients: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      fat: 3.6,
      sodium: 74,
      vitamins: ['B6', 'B12'],
      minerals: ['Iron', 'Zinc']
    },
    benefits: [
      'Excellent source of protein',
      'Low in fat',
      'Supports muscle growth'
    ],
    allergens: [],
    ageRecommended: '8+ months',
    searchTags: ['chicken', 'protein', 'lean meat', 'muscle']
  },
  {
    name: 'Brown Rice',
    category: 'grains',
    icon: '/images/foods/rice.png',
    nutrients: {
      calories: 111,
      protein: 2.6,
      carbs: 23,
      fiber: 1.8,
      sugar: 0.4,
      fat: 0.9,
      sodium: 5,
      vitamins: ['B1', 'B6'],
      minerals: ['Magnesium', 'Phosphorus']
    },
    benefits: [
      'Good source of complex carbohydrates',
      'Rich in fiber',
      'Provides sustained energy'
    ],
    allergens: [],
    ageRecommended: '6+ months',
    searchTags: ['rice', 'grain', 'fiber', 'energy']
  },
  {
    name: 'Yogurt',
    category: 'dairy',
    icon: '/images/foods/yogurt.png',
    nutrients: {
      calories: 59,
      protein: 10,
      carbs: 3.6,
      fiber: 0,
      sugar: 3.2,
      fat: 0.4,
      sodium: 36,
      vitamins: ['B12', 'D'],
      minerals: ['Calcium', 'Phosphorus']
    },
    benefits: [
      'Excellent source of calcium',
      'Contains probiotics',
      'Good for bone health'
    ],
    allergens: ['dairy'],
    ageRecommended: '6+ months',
    searchTags: ['yogurt', 'dairy', 'calcium', 'probiotics']
  }
];

const seedFoods = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing foods
    await Food.deleteMany({});
    console.log('Cleared existing foods');

    // Insert new foods
    const insertedFoods = await Food.insertMany(foods);
    console.log(`Inserted ${insertedFoods.length} foods`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedFoods(); 