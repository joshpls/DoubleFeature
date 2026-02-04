// server.js
const express = require('express');
const cors = require('cors');
const movieRoutes = require('./routes/movieRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Use the routes
app.use('/api', movieRoutes);

app.listen(PORT, () => {
  console.log(`Server running in MVC pattern on port ${PORT}`);
});
