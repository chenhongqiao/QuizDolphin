const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const problems = require('./routes/api/problems');
app.use('/api/problems', problems);

const heartbeat = require('./routes/api/heartbeat');
app.use('/api/heartbeat',heartbeat);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Backend Server started on port ${port}`));