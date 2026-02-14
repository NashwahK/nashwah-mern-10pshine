# 10Pearls Shine Internship

Welcome! This is Nashwah's progress marker for the 10Pearls Shine Internship Cohort 7 :)




## About Me
I love making cool things! This is one of the many side-quests I have going on, so tag along for finding out how this turns out. 


## What's brewing now?
I've completed the whole backend setup for the app. Next week, I'll start with the frontend dev.

# Backend - Pendown Notes App

This folder contains the backend API for the Pendown Notes App.

## Features
- User authentication (JWT)
- Notes CRUD (Create, Read, Update, Delete)
- MongoDB (Mongoose ODM)
- Input validation and error handling
- Logging with Pino
- API documentation with Swagger (OpenAPI)
- Mocha/Chai tests

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your `.env` file (see `.env.example`).
3. Start the development server:
   ```sh
   npm run dev
   ```
4. API docs available at: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

## Running Tests

```sh
npm test
```

## Project Structure
- `src/` - Source code (models, controllers, routes, middleware, config)
- `test/` - Mocha/Chai tests

## API Endpoints
See Swagger docs at `/api/docs` for full details.

---
