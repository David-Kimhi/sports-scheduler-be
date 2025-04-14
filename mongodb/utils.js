const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.raxoh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


async function writeToMongo(dbName, collectionName, data) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Check if it's one document or an array
    if (Array.isArray(data)) {
      const result = await collection.insertMany(data);
      console.log(`Inserted ${result.insertedCount} documents`);
    } else {
      const result = await collection.insertOne(data);
      console.log(`Inserted 1 document with ID: ${result.insertedId}`);
    }
  } catch (err) {
    console.error('MongoDB write error:', err);
  } finally {
    await client.close();
  }
}


module.exports = { writeToMongo };


