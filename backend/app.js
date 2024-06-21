const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Replace with your Pingdom API key
const PINGDOM_API_KEY = '7S-LOihA3ooDAjkU0HUVk84yPiDQTnYDAiqAAE1EFz0mTZ25oq8CVXOZtiVeQvDMQZ4L8W8';

// Pingdom API base URL
const PINGDOM_API_URL = 'https://api.pingdom.com/api/3.1';

app.use(express.json());

// Proxy endpoint
app.use('/pingdom', async (req, res) => {
  const { method, url, headers, body } = req;
  const targetUrl = `${PINGDOM_API_URL}${url}`;

  console.log('Test');

  console.log('targetUrl', targetUrl);
  try {
    const response = await axios({
      method,
      url: targetUrl,
      headers: {
        'Authorization': `Bearer ${PINGDOM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: body,
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
        console.log(error);
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
