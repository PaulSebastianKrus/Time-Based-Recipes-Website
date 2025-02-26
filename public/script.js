document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const timeSlider = document.getElementById('timeSlider');
    const timeValue = document.getElementById('timeValue');
    const findRecipesBtn = document.getElementById('findRecipes');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const recipeResults = document.getElementById('recipeResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const recipeModal = document.getElementById('recipeModal');
    const recipeDetails = document.getElementById('recipeDetails');
    const closeModal = document.querySelector('.close-modal');

    // Update time value as slider moves
    timeSlider.addEventListener('input', function() {
        timeValue.textContent = this.value;
    });

    // Find recipes button click
    findRecipesBtn.addEventListener('click', function() {
        const time = timeSlider.value;
        fetchRecipes(time);
    });

    // Quick filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const time = this.getAttribute('data-time');
            timeSlider.value = time;
            timeValue.textContent = time;
            fetchRecipes(time);
        });
    });

    // Close modal when clicking X
    closeModal.addEventListener('click', function() {
        recipeModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === recipeModal) {
            recipeModal.style.display = 'none';
        }
    });

    // Fetch recipes based on time
    function fetchRecipes(maxTime) {
        recipeResults.innerHTML = '<div class="loading">Finding recipes...</div>';
        resultsTitle.textContent = `Recipes Ready in ${maxTime} Minutes or Less`;

        fetch(`/api/recipes?time=${maxTime}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displayRecipes(data.results);
            })
            .catch(error => {
                console.error('Error fetching recipes:', error);
                recipeResults.innerHTML = '<div class="error">Error loading recipes. Please try again.</div>';
            });
    }

    // Display recipe cards
    function displayRecipes(recipes) {
        if (!recipes || recipes.length === 0) {
            recipeResults.innerHTML = '<div class="no-results">No recipes found for the selected time. Try increasing your available time.</div>';
            return;
        }

        recipeResults.innerHTML = '';
        
        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.setAttribute('data-id', recipe.id);
            
            // Use a default image if none is provided
            const imageUrl = recipe.image || 'https://spoonacular.com/recipeImages/default-recipe.jpg';
            
            recipeCard.innerHTML = `
                <img src="${imageUrl}" alt="${recipe.title}" class="recipe-image">
                <div class="recipe-info">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-time">Ready in ${recipe.readyInMinutes} min</div>
                    <p class="recipe-summary">${recipe.summary ? recipe.summary.substring(0, 100) + '...' : 'Click for details'}</p>
                </div>
            `;
            
            recipeCard.addEventListener('click', function() {
                openRecipeDetails(recipe.id);
            });
            
            recipeResults.appendChild(recipeCard);
        });
    }

    // Open recipe details modal
    function openRecipeDetails(recipeId) {
        recipeDetails.innerHTML = '<div class="loading">Loading recipe details...</div>';
        recipeModal.style.display = 'block';
        
        fetch(`/api/recipe/${recipeId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(recipe => {
                displayRecipeDetails(recipe);
            })
            .catch(error => {
                console.error('Error fetching recipe details:', error);
                recipeDetails.innerHTML = '<div class="error">Error loading recipe details. Please try again.</div>';
            });
    }

    // Display recipe details in modal
    function displayRecipeDetails(recipe) {
        const prepTime = recipe.preparationMinutes || Math.floor(recipe.readyInMinutes / 3);
        const cookTime = recipe.cookingMinutes || (recipe.readyInMinutes - prepTime);
        
        // Use a default image if none is provided
        const imageUrl = recipe.image || 'https://spoonacular.com/recipeImages/default-recipe.jpg';
        
        // Create HTML for ingredients
        let ingredientsHTML = '<ul class="ingredients-list">';
        if (recipe.extendedIngredients) {
            recipe.extendedIngredients.forEach(ingredient => {
                ingredientsHTML += `<li class="ingredient-item">${ingredient.original || ingredient.originalString}</li>`;
            });
        } else {
            // Fallback for sample data
            ingredientsHTML += `<li class="ingredient-item">Sample ingredient 1</li>`;
            ingredientsHTML += `<li class="ingredient-item">Sample ingredient 2</li>`;
            ingredientsHTML += `<li class="ingredient-item">Sample ingredient 3</li>`;
        }
        ingredientsHTML += '</ul>';
        
        // Create HTML for instructions
        let instructionsHTML = '<ol class="instructions-list">';
        if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
            recipe.analyzedInstructions[0].steps.forEach(step => {
                instructionsHTML += `<li>${step.step}</li>`;
            });
        } else if (recipe.instructions) {
            // If instructions are provided as a string
            const steps = recipe.instructions.split('. ');
            steps.forEach(step => {
                if (step.trim()) {
                    instructionsHTML += `<li>${step}.</li>`;
                }
            });
        } else {
            // Fallback for sample data
            instructionsHTML += `<li>Sample cooking instruction step 1.</li>`;
            instructionsHTML += `<li>Sample cooking instruction step 2.</li>`;
            instructionsHTML += `<li>Sample cooking instruction step 3.</li>`;
        }
        instructionsHTML += '</ol>';
        
        recipeDetails.innerHTML = `
            <div class="recipe-header">
                <img src="${imageUrl}" alt="${recipe.title}" class="recipe-detail-image">
                <div class="recipe-detail-info">
                    <h2 class="recipe-detail-title">${recipe.title}</h2>
                    <div class="time-info">
                        <div class="time-item">
                            <div class="time-label">Prep Time</div>
                            <div class="time-value">${prepTime} min</div>
                        </div>
                        <div class="time-item">
                            <div class="time-label">Cook Time</div>
                            <div class="time-value">${cookTime} min</div>
                        </div>
                        <div class="time-item">
                            <div class="time-label">Total Time</div>
                            <div class="time-value">${recipe.readyInMinutes} min</div>
                        </div>
                    </div>
                    <div class="recipe-summary">
                        ${recipe.summary ? recipe.summary : 'A delicious recipe based on your time availability.'}
                    </div>
                </div>
            </div>
            
            <div class="ingredients-section">
                <h3 class="section-title">Ingredients</h3>
                ${ingredientsHTML}
            </div>
            
            <div class="instructions-section">
                <h3 class="section-title">Instructions</h3>
                ${instructionsHTML}
            </div>
        `;
    }

    // Load initial recipes on page load (30 minutes by default)
    fetchRecipes(30);
});