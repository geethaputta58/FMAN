const express = require('express');
const axios = require('axios');
const app = express();

const apiKey = 'f70NttRKKo4YSF9C8TM0oyRmQtxN6tqlUQA8tFU6'; // Replace with your correct key

app.use(express.static('public'));

app.get('/api/news', async (req, res) => {
  try {
    const response = await axios.get('https://api.stockdata.org/v1/news/all', {
      params: {
        filter_entities: true,
        language: 'en',               
        limit: 5,
      },
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const news = response.data.data;
    console.log('Fetched News:', news);  // Log the fetched news data
    res.json(news);
  } catch (error) {
    console.error("🛑 ERROR: ", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
