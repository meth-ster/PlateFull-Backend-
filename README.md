# Plateful Backend API

A Node.js/Express backend API for the Plateful children's nutrition app.

## Features

- Authentication with JWT
- User and child profile management
- Food database with search
- Meal tracking and nutrition analysis
- Gamification (badges, achievements)
- Learning modules
- Reporting and analytics
- File upload for images

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Users
- GET /api/users/profile - Get profile
- PUT /api/users/profile - Update profile

### Children
- GET /api/children - Get children
- POST /api/children - Create child
- PUT /api/children/:id - Update child

### Foods
- GET /api/foods - Get foods
- GET /api/foods/search/:query - Search foods

### Meals
- GET /api/meals - Get meals
- POST /api/meals - Create meal
- PUT /api/meals/:id - Update meal

### Gamification
- GET /api/gamification/:childId - Get gamification data
- PUT /api/gamification/:childId/experience - Update experience

### Learning
- GET /api/learning/modules - Get learning modules

### Reporting
- GET /api/reporting/nutrition/:childId - Get nutrition summary

### Upload
- POST /api/upload/image - Upload image

## Environment Variables

- NODE_ENV=development
- PORT=5000
- MONGODB_URI=mongodb://localhost:27017/plateful
- JWT_SECRET=your-secret-key
- MAX_FILE_SIZE=5242880

## Database Models

- User: Authentication and profiles
- Child: Child profiles and gamification
- Food: Nutritional database
- Meal: Meal tracking and nutrition

## Security

- JWT authentication
- Role-based access control
- Input validation
- Rate limiting
- File upload security 