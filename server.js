require('dotenv').config();
const express     = require('express');
const helmet      = require('helmet');
const bodyParser  = require('body-parser');
const mongo       = require('mongodb');
const apiRoutes   = require('./routes/api.js');
const fccTesting  = require('./routes/fcctesting.js');

const app = express();

/* ----------  SECURITY  ---------- */
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.xFrameOptions({ action: 'sameorigin' }));   // User-story 2
app.use(helmet.dnsPrefetchControl({ allow: false }));      // User-story 3
app.use(helmet.referrerPolicy({ policy: 'same-origin' })); // User-story 4
app.disable('x-powered-by');

/* ----------  MIDDLEWARE  ---------- */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* ----------  SERVE STATIC & FCC TEST ROUTES  ---------- */
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/api', fccTesting);          // keep – required for fcc tests
app.route('/')
  .get((req, res) => res.sendFile(process.cwd() + '/views/index.html'));

/* ----------  DATABASE  ---------- */
mongo.connect(process.env.DB)
     .then(client => {
        app.locals.db = client.db();
        console.log('Mongo connected');
     })
     .catch(err => console.error(err));

/* ----------  API ROUTES  ---------- */
app.use('/api', apiRoutes);

/* ----------  404  ---------- */
app.use((req, res) => res.status(404).type('text').send('Not Found'));

/* ----------  START  ---------- */
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

module.exports = app; // for tests