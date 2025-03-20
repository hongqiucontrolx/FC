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
    const entreeContainer = document.getElementById('entreeItems');
    const mainContainer = document.getElementById('mainItems');
    const dessertContainer = document.getElementById('dessertItems');
    
    // Clear existing content
    entreeContainer.innerHTML = '';
    mainContainer.innerHTML = '';
    dessertContainer.innerHTML = '';
    
    menuData.forEach(item => {
        const menuItem = `
            <div class="menu-item">
                <label>
                    <input type="checkbox" id="dish-${item.id}">
                    ${item.name}
                </label>
            </div>
        `;
        
        if (item.category === 'entree') {
            entreeContainer.innerHTML += menuItem;
        } else if (item.category === 'main') {
            mainContainer.innerHTML += menuItem;
        } else if (item.category === 'dessert') {
            dessertContainer.innerHTML += menuItem;
        }
    });
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
    // Get the total number of people
    const peopleCount = parseInt(document.getElementById('peopleCount').value) || 1;
    
    // Get all selected dishes - simplified without alternate drop logic
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
            body: JSON.stringify({ 
                selectedDishes, 
                peopleCount 
            })
        });
        
        const data = await response.json();
        displayResults(data.totalIngredients);
    } catch (error) {
        console.error('Error calculating order:', error);
    }
}

// Display the results in the 'ingredientsList' section with categories
function displayResults(ingredients) {
    const resultsDiv = document.getElementById('results');
    const ingredientsList = document.getElementById('ingredientsList');
    
    // Define ingredient categories
    const categories = {
        "PFD": {},
        "BEST FRESH": {}
    };
    
    // Define vegetables for BEST FRESH category
    const vegetables = ["potato", "onion", "carrot", "tomato", "lettuce", "beans", "spring onion", "water cress", 
                       "broccoli", "spinach", "cauliflower", "cabbage", "bell pepper", "garlic", "celery", "corn"];
    
    // Sort ingredients into categories
    Object.entries(ingredients).forEach(([ingredient, amount]) => {
        if (vegetables.some(veg => ingredient.toLowerCase().includes(veg.toLowerCase()))) {
            categories["BEST FRESH"][ingredient] = amount;
        } else {
            categories["PFD"][ingredient] = amount;
        }
    });
    
    // Generate HTML for categorized ingredients
    let html = '';
    
    // Display in order: PFD first, then BEST FRESH
    const displayOrder = ["PFD", "BEST FRESH"];
    
    displayOrder.forEach(category => {
        const items = categories[category];
        if (Object.keys(items).length === 0) return;
        
        html += `<div class="ingredient-category">
            <h3 class="category-title">${category}</h3>
            <div class="category-items">`;
            
        Object.entries(items).forEach(([ingredient, amount]) => {
            html += `<p><strong>${ingredient}:</strong> ${amount} g</p>`;
        });
        
        html += `</div></div>`;
    });
    
    ingredientsList.innerHTML = html;
    resultsDiv.style.display = 'block';
}

function renderDishCategory(dishes) {
    return dishes.map(item => `
        <div class="menu-item">
            <label>
                <input type="checkbox" id="dish-${item.id}">
                ${item.name}
            </label>
        </div>
    `).join('');
}

