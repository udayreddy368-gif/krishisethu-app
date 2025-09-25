const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to KrishiSethu API 🚜');
});

app.listen(PORT, () => {
  console.log(`KrishiSethu backend running on http://localhost:${PORT}`);
});
