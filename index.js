require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const Port = process.env.PORT || 5022;
const mongoose = require("mongoose");


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running home');
});

app.listen(Port, () => {
  console.log('Server is running on port', Port);
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PAS}@cluster0.zxihh.mongodb.net/?retryWrites=true&w=majority`;

console.log(process.env.DB_USER, process.env.DB_PAS);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    await client.connect();
    // user data
    const db = client.db('insertDBaks');
    const userCollection = db.collection('user');
    // wis list data
    const mg = client.db('watchLists');
    const wicCollection = mg.collection('watch');

    // All Data
    const mn = client.db('insertDB');
    const onerCollection = mn.collection('haiku'); 

// post user data
    app.post('/add', async (req, res) => {
      const addata = req.body;
      console.log('All Data-------------', addata);

      try {
        const result = await userCollection.insertOne(addata);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
        res.send(result);
      } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send({ message: 'Error inserting data' });
      }
    });

// post watchLists data
    app.post('/watchLists', async (req, res) => {
      const addatas = req.body;
      console.log('All watchLists-------------', addatas);

      try {
        const result = await wicCollection.insertOne(addatas);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
        res.send(result);
      } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send({ message: 'Error inserting data' });
      }
    });
// home page data
    app.get('/datas', async (req, res) => {
      try {
        const cursor = userCollection.find();
        const result = await cursor.toArray();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(result);
      } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });
// gat watchLists data
app.get('/watchListsdata', async (req, res) => {
  try {
    const cursor = wicCollection.find();
    const result = await cursor.toArray();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(result);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});



    // All data
    app.get('/alldata', async (req, res) => {
      try {
        const cursor = onerCollection.find();
        const result = await cursor.toArray();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(result);
      } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });


    // MongoDB limit
    app.get('/limited-data', async (req, res) => {
      const limit = parseInt(req.query.limit) || 6;
      try {
        const cursor = onerCollection.find().limit(limit); 
        const result = await cursor.toArray();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(result);
      } catch (error) {
        console.error('Error retrieving limited data:', error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });

// Delete oparation
app.delete('/user/:id', async (req, res) => { 
  const id = req.params.id; 
  if (ObjectId.isValid(id)) { 
    const query = { _id: new ObjectId(id) }; 
    const result = await userCollection.deleteOne(query);
    res.send(result); } 
    else { res.status(400).send({ message: 'Invalid ID' }); 
  } 
});

// up date

app.put('/up/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateData = req.body;

  const updateDoc = {
    $set: {
      name: updateData.name,
      Description: updateData.Description,
      Image: updateData.Image,
      Year: updateData.Year,
      Rating: updateData.Rating,
      genre: updateData.genre,
    },
  };

  const result = await userCollection.updateOne(filter, updateDoc, { upsert: true });
  res.send(result);
});


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}


run().catch(console.dir);

