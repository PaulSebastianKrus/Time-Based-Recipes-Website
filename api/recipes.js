import axios from 'axios';

const SPOONACULAR_API_KEY = '81a43d147d234da6a68bcc52f023b0e6';

export default async function handler(req, res) {
  const { time } = req.query;
  const timeAvailable = parseInt(time) || 30;

  try {
    const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        maxReadyTime: timeAvailable,
        number: 10,
        addRecipeInformation: true,
        sort: 'readyInMinutes'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
}
