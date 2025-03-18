# API Server

API Server built with Express that loads data from JSON files.

## Features

- RESTful API with Express
- Loads data from JSON files
- Complete CRUD for users and products
- Error handling
- Request logging
- Security with Helmet
- CORS support
- Environment variables with dotenv

## Project Structure

```
.
├── src/
│   ├── config/        # Application configuration
│   ├── controllers/   # Application controllers
│   ├── data/          # JSON data files
│   ├── middlewares/   # Custom middlewares
│   ├── models/        # Data loading utilities
│   ├── routes/        # API route definitions
│   ├── app.js         # Express configuration
│   └── server.js      # Server entry point
├── .env               # Environment variables
├── .gitignore         # Files ignored by Git
├── package.json       # Dependencies and scripts
└── README.md          # Documentation
```

## Requirements

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)

## Installation

1. Clone the repository:
   ```
   git clone [REPOSITORY_URL]
   cd api-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   # Edit .env as needed
   ```

## Usage

### Development

To run the server in development mode with automatic reloading:

```
npm run dev
```

### Production

To run the server in production mode:

```
npm start
```

## API Endpoints

### Users

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get a user by ID
- `POST /api/v1/users` - Create a new user
- `PATCH /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user

### Products

- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get a product by ID
- `POST /api/v1/products` - Create a new product
- `PATCH /api/v1/products/:id` - Update a product
- `DELETE /api/v1/products/:id` - Delete a product

### Query Parameters for Products

- `category` - Filter by category
- `minPrice` - Filter by minimum price
- `maxPrice` - Filter by maximum price

Example: `GET /api/v1/products?category=electronics&minPrice=500`

## Extending the API

To add new resources:

1. Create a JSON file in `src/data/`
2. Create a controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Register the routes in `src/app.js`
 
