// api/recipe/[id].js
import axios from 'axios/dist/node/axios.cjs';

const SPOONACULAR_API_KEY = '81a43d147d234da6a68bcc52f023b0e6';

module.exports = async (req, res) => {
  const recipeId = req.query.id;
  
  try {
    if (SPOONACULAR_API_KEY) {
      const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: true
        }
      });
      
      return res.json(response.data);
    } else {
      const recipe = sampleRecipes.find(r => r.id === parseInt(recipeId));
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      return res.json(recipe);
    }
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    res.status(500).json({ error: 'Failed to fetch recipe details' });
  }
};
