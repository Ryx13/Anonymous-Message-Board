require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.DB;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    console.log('Connected successfully to server');
    await client.db('anonymous').collection('testCollection').insertOne({ myField: 'myValue' });
    console.log('Inserted a document');
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);