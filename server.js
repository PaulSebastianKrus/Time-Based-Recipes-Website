const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const port = 3000;

const SPOONACULAR_API_KEY = '81a43d147d234da6a68bcc52f023b0e6';

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sampleRecipes = [
  {
    id: 1,
    title: "Quick Avocado Toast",
    readyInMinutes: 7,
    preparationMinutes: 5,
    cookingMinutes: 2,
    image: "https://spoonacular.com/recipeImages/avocado-toast.jpg",
    summary: "A quick and healthy breakfast option."
  },
  {
    id: 2,
    title: "15-Minute Pasta",
    readyInMinutes: 15,
    preparationMinutes: 5,
    cookingMinutes: 10,
    image: "https://spoonacular.com/recipeImages/quick-pasta.jpg",
    summary: "A simple pasta dish for busy weeknights."
  },
  {
    id: 3,
    title: "Slow-Cooked Beef Stew",
    readyInMinutes: 200,
    preparationMinutes: 20,
    cookingMinutes: 180,
    image: "https://spoonacular.com/recipeImages/beef-stew.jpg",
    summary: "A hearty beef stew that's worth the wait."
  }
];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API route to get recipes filtered by time
app.get('/api/recipes', async (req, res) => {
  const timeAvailable = parseInt(req.query.time) || 30; // Default to 30 minutes
  
  try {
    if (SPOONACULAR_API_KEY) {  // ✅ Check if the API key exists
      const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          maxReadyTime: timeAvailable,
          number: 10,
          addRecipeInformation: true,
          sort: 'readyInMinutes'
        }
      });
      
      return res.json(response.data);
    } else {
      const filteredRecipes = sampleRecipes.filter(recipe => recipe.readyInMinutes <= timeAvailable);
      return res.json({ results: filteredRecipes });
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// API route to get recipe details
app.get('/api/recipe/:id', async (req, res) => {
  const recipeId = parseInt(req.params.id);
  
  try {
    if (SPOONACULAR_API_KEY) {  // ✅ Check if the API key exists
      const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: true
        }
      });
      
      return res.json(response.data);
    } else {
      const recipe = sampleRecipes.find(r => r.id === recipeId);
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      return res.json(recipe);
    }
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    res.status(500).json({ error: 'Failed to fetch recipe details' });
  }
});

app.listen(port, () => {
  console.log(`Time-Based Recipes app listening at http://localhost:${port}`);
});
