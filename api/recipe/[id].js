import axios from 'axios/dist/node/axios.cjs';

const SPOONACULAR_API_KEY = '81a43d147d234da6a68bcc52f023b0e6';

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        includeNutrition: true
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    res.status(500).json({ error: 'Failed to fetch recipe details' });
  }
}