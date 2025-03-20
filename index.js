const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from public directory
app.use(express.static('public'));

// Serve menu data
app.get('/api/menu', (req, res) => {
    const menu = require('./menu.json');
    res.json(menu);
});

// Handle order calculations
app.post('/api/calculate', (req, res) => {
    const { selectedDishes } = req.body;
    const menu = require('./menu.json');
    
    // Calculate total ingredients
    const totalIngredients = {};
    
    selectedDishes.forEach(dish => {
        const menuItem = menu.find(item => item.id === dish.id);
        if (menuItem) {
            Object.entries(menuItem.ingredients).forEach(([ingredient, amount]) => {
                // Use the dish-specific quantity instead of peopleCount
                const totalAmount = amount * dish.quantity;
                totalIngredients[ingredient] = (totalIngredients[ingredient] || 0) + totalAmount;
            });
        }
    });
    
    res.json({ totalIngredients });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
