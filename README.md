# Unified Coding Progress Tracker & AI Study Coach

A personal web application that automatically tracks, analyzes, and enhances your coding problem-solving journey across major competitive programming platforms.

## Project Structure

```
coding-progress-tracker/
├── backend/                # Node.js Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic
│   ├── .env                # Environment variables
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
│
└── frontend/               # Vite React frontend
    ├── public/             # Static assets
    ├── src/                # Source code
    │   ├── components/     # Reusable components
    │   ├── contexts/       # React contexts
    │   ├── pages/          # Application pages
    │   ├── services/       # API services
    │   ├── App.jsx         # Main component
    │   └── main.jsx        # Entry point
    ├── index.html          # HTML template
    ├── package.json        # Frontend dependencies
    └── vite.config.js      # Vite configuration
```

## Features

### 1. Automatic Problem Tracking
- Seamless integration with platforms like Codeforces, LeetCode, AtCoder, HackerRank
- Auto-logging of problems, difficulty, topics, time taken, and submission details
- Local backup for privacy and offline access

### 2. Unified Dashboard & Visual Analytics
- Centralized view of all solved problems
- Interactive graphs for progress visualization
- Comprehensive activity tracking

### 3. Smart Topic & Difficulty Insights
- Advanced filtering by topic and difficulty
- Gap analysis to identify neglected topics

### 4. Personalized Reminders & Practice Suggestions
- Topic reminders for neglected areas
- Smart recommendations tailored to weak areas

### 5. AI-Powered Feedback & Study Support
- Error analysis with AI-generated hints
- Automatic suggestion of relevant study resources

### 6. Optimization Coach
- Efficiency analysis of your solutions
- Comparison with optimal solutions
- AI-generated optimization tips

### 7. Guided Learning & Retry Flow
- Step-by-step guidance when stuck
- Concept reinforcement through targeted practice

### 8. Gamification & Motivation
- Points system for achievements
- Badges for milestones
- Rewards for optimization

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB or PostgreSQL

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/coding-progress-tracker.git
cd coding-progress-tracker
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Install frontend dependencies
```
cd frontend
npm install
```

4. Set up environment variables
- Create a `.env` file in the backend directory based on the provided example

5. Run the application
```
# Start backend (from backend directory)
npm run dev

# Start frontend (in another terminal, from frontend directory)
npm run dev
```

## Tech Stack
- Backend: Node.js, Express.js, MongoDB/PostgreSQL
- Frontend: JavaScript, Vite, React, Tailwind CSS, Chart.js/D3.js
- AI: OpenAI API integration

## License
MIT
