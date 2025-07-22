const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const apiRoutes = require('./routes/api.js');

const app = express();

/* ----------  SECURITY  ---------- */
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.xFrameOptions({ action: 'sameorigin' }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.disable('x-powered-by');

/* ----------  MIDDLEWARE  ---------- */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* ----------  DATABASE  ---------- */
const uri = process.env.DB;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDB() {
  try {
    await client.connect();
    console.log('MongoDB connected');
    app.locals.db = client.db();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

connectDB();

/* ----------  ROUTES  ---------- */
app.use('/api', apiRoutes);

/* ----------  404  ---------- */
app.use((req, res) => res.status(404).type('text').send('Not Found'));

/* ----------  START  ---------- */
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

module.exports = app; // for tests