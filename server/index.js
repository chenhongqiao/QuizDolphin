const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());

const problems = require('./routes/api/questions');

app.use('/api/questions', problems);

const heartbeat = require('./routes/api/heartbeat');

app.use('/api/heartbeat', heartbeat);

const grading = require('./routes/api/grading');

app.use('/api/grading', grading);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
