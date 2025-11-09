// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;


// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Custom middleware to log request details
function requestLogger(req, res, next) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

    // Log request body for POST and PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Body:',
            JSON.stringify(req.body, null, 2));
    }

    next(); // Pass control to next middleware
}

// Validation middleware using express-validator
const menuValidation = [
  body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('category').isIn(['appetizer', 'entree', 'dessert', 'beverage']).withMessage('Invalid category'),
  body('ingredients').isArray({ min: 1 }).withMessage('Ingredients must be a non-empty array'),
  body('available').isBoolean().withMessage('Available must be a boolean')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        const errorMessages =
    errors.array().map(error => error.msg);
    
        return res.status(400).json({
            error: 'Validation failed',
            messages: errorMessages
        });
    }

    // Set default value for available if not provided
    if (req.body.available === undefined) {
        req.body.available = true;
    }
  
    next();
};

// Use the custom middleware
app.use(express.json());
app.use(requestLogger);

// GET /api/menu - Retrieve all menu items
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

// GET /api/menu/:id - Retrieve a specific menu item
app.get('/api/menu/:id', (req, res) => {
  const menuItem = menuItems.find(item => item.id === parseInt(req.params.id));
  if (menuItem) {
    res.json(menuItem);
  } else {
    res.status(404).json({ message: "Menu item not found" });
  }
});

// POST /api/menu - Add a new menu item
app.post('/api/menu', menuValidation, handleValidationErrors, (req, res) => {
  const newId = menuItems.length + 1;
  const newItem = { id: newId, ...req.body };
  menuItems.push(newItem);
  res.status(201).json(newItem);
});

// PUT /api/menu/:id - Update an existing menu item
app.put('/api/menu/:id', menuValidation, handleValidationErrors, (req, res) => {
  const menuItem = menuItems.find(item => item.id === parseInt(req.params.id));
  if (menuItem) {
    Object.assign(menuItem, req.body);
    res.json(menuItem);
  } else {
    res.status(404).json({ message: "Menu item not found" });
  }
});

// DELETE /api/menu/:id - Remove a menu item
app.delete('/api/menu/:id', (req, res) => {
  const menuItemIndex = menuItems.findIndex(item => item.id === parseInt(req.params.id));
  if (menuItemIndex !== -1) {
    menuItems.splice(menuItemIndex, 1);
    res.json({ message: "Menu item deleted" });
  } else {
    res.status(404).json({ message: "Menu item not found" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`The kitchen is at full blast http://localhost:${port}`);
});