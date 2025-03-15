let menuData = [];

// Fetch menu data when the page loads
window.addEventListener('load', async () => {
    try {
        const response = await fetch('/api/menu');
        menuData = await response.json();
        displayMenu();
    } catch (error) {
        console.error('Error loading menu:', error);
    }
});

// Display the menu items and their quantity inputs
function displayMenu() {
    const menuContainer = document.getElementById('menuItems');
    menuContainer.innerHTML = menuData.map(item => `
        <div class="menu-item">
            <h3>${item.name}</h3>
            <label>
                <input type="checkbox" 
                       id="dish-${item.id}" 
                       checked
                       onchange="updateDishQuantity(this)">
                Include this dish
            </label>
        </div>
    `).join('');
}

// Update quantities based on checkbox state
function updateQuantityForAllDishes() {
    const peopleCount = parseInt(document.getElementById('peopleCount').value) || 1;
    
    menuData.forEach(item => {
        const dishInput = document.getElementById(`dish-${item.id}`);
        // Convert checkbox state to 1 or 0
        const quantityPerPerson = dishInput.checked ? 1 : 0;
    });
}

// Calculate the total ingredients based on the number of people and selected dishes
async function calculateOrder() {
    const peopleCount = parseInt(document.getElementById('peopleCount').value) || 1;
    
    const selectedDishes = menuData.map(item => ({
        id: item.id,
        quantity: document.getElementById(`dish-${item.id}`).checked ? 1 : 0
    })).filter(dish => dish.quantity > 0);
    
    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selectedDishes, peopleCount })
        });
        
        const data = await response.json();
        displayResults(data.totalIngredients);
    } catch (error) {
        console.error('Error calculating order:', error);
    }
}

// Display the results in the 'ingredientsList' section
function displayResults(ingredients) {
    const resultsDiv = document.getElementById('results');
    const ingredientsList = document.getElementById('ingredientsList');
    
    ingredientsList.innerHTML = Object.entries(ingredients)
        .map(([ingredient, amount]) => `
            <p><strong>${ingredient}:</strong> ${amount} grams</p>
        `).join('');
    
    resultsDiv.style.display = 'block';
}
