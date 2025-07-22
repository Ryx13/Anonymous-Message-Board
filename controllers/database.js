const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;  // or your connection string directly

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));
