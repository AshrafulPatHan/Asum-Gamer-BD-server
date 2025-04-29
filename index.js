require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const Port = process.env.PORT || 5022;
const mongoose = require("mongoose");


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running Home');
});

app.listen(Port, () => {
  console.log('Server is running on port', Port);
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PAS}@cluster0.zxihh.mongodb.net/Chill-Gamer?retryWrites=true&w=majority`;

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
    // ---------- chill gamer collection ------------
    // user data
    const db = client.db('insertDBaks');
    const userCollection = db.collection('user');
    // wis list data
    const mg = client.db('watchLists');
    const wicCollection = mg.collection('watch');

    // All Data
    const mn = client.db('insertDB');
    const onerCollection = mn.collection('haiku'); 

    // ---------- Asum Gamer BD collection ------------

    const database = client.db('AsumGamerBD');
    const User = database.collection('User');
    const reviews = database.collection('reviews');
    const video = database.collection('video');
    const news = database.collection('news');
    const watchLists = database.collection('watchLists');
    const shop = database.collection('shop');
    const chat = database.collection('chat');
    const spam = database.collection('spam');

// ------------------------------------------------------- Asum Gamer BD crud operation ---------------

// ------------ Register route ------------
app.post('/register', async (req, res) => {
  try {
    const { name, email, photoURL, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.insertOne({
      name,
      email,
      photoURL,
      password: hashedPassword
    });
    res.status(201).json({ message: "✅ User Registered!" });
  } catch (error) {
    res.status(500).send("❌ Registration Error: " + error.message);
  }
});

// ---------------- login with google ----------
app.post('/google-login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // if (!user) return res.status(404).send("❌ User not found!");
    if (!user) {
      return res.status(200).send({"user":true});
    }else{
      return res.status(200).send({"user":false});
    }
  } catch (error) {
    res.status(500).send("❌ Login Error: " + error.message);
  }
});

// ----------------- Add Review
app.post('/add-review',async (req,res) =>{
  const addReview = req.body;
  console.log(addReview);
  try {
    const result = await reviews.insertOne(addReview);
    console.log(result.insertedId);
    res.send(result);
  }catch(error){
    console.error("error in add review",error);
    res.status(500).send({massage:'Error inserting data'}) 
  }
});
//  --------------- catch My Review or user review 
app.post('/my-review', async (req, res) => {
  try {
    const user = await reviews.find({ userEmail: req.body.email });
    const result = await user.toArray();
    return res.status(200).send(result);
  } catch (error) {
    res.status(500).send("❌ review shake is error " + error.message);
  }
});
// ----------------- Add video
app.post('/add-video',async (req,res) =>{
  const addVideo = req.body;
  console.log(addVideo);
  try {
    const result = await video.insertOne(addVideo);
    console.log(result.insertedId);
    res.send(result);
  }catch(error){
    console.error("error in add video",error);
    res.status(500).send({massage:'Error inserting data'}) 
  }
});
// --------------- Add news data
app.post('/add-news',async (req,res) =>{
  const addNews = req.body;
  try{
    const result = await news.insertOne(addNews);
    res.send(result)
  }catch (error){
    console.error("error in add news",error)
    res.status(500).send({massage:"error inserting data"})
  }
})
// post watchLists data
app.post('/watchLists', async (req, res) => {
  const addatas = req.body;
  console.log('All watchLists-------------', addatas);
  try {
    const result = await watchLists.insertOne(addatas);
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    res.send(result);
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send({ message: 'Error inserting data' });
  }
});
//  --------------- catch my watchLists 
app.post('/my-watchLists', async (req, res) => {
  try {
    const user = await watchLists.find({ userEmail: req.body.email });
    const result = await user.toArray();
    return res.status(200).send(result);
  } catch (error) {
    res.status(500).send("❌ review shake is error " + error.message);
  }
});
// --------------- post comment
app.patch('/comment', async (req, res) => {
  const { Comment, username, userEmail, userPhotoURL, _id } = req.body;

  if (!Comment || !username || !userEmail || !userPhotoURL || !_id) {
      return res.status(400).send({ message: 'All fields are required' });
  }

  if (!ObjectId.isValid(_id)) {
      return res.status(400).send({ message: 'Invalid ID format' });
  }

  try {
      const filter = { _id: new ObjectId(_id) }; 
      const updateDoc = {
          $push: { comments: { Comment, username, userPhotoURL,userEmail, date: new Date() } },
      };
      const result = await reviews.updateOne(filter, updateDoc);
      res.send(result);
  } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).send({ message: 'Error updating comment' });
  }
});


                                                // get request
// ----------------- Post all Review
app.get('/all-review', async (req, res) => {
  try {
    const cursor = reviews.find();
    const result = await cursor.toArray();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(result);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// ----------------- Post Latest Review
app.get('/latest-review', async (req, res) => {
  try {
    // const cursor = reviews.find({}).sort({_id:-1}).limit(10,function(err,docs){});
    const result = await reviews.find({}).sort({_id: -1}).limit(4).toArray();
    // const result = await cursor.toArray();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(result);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});
// ----------------- Post Higher rate Review
app.get('/higher-rate-review', async (req, res) => {
  try {
    const result = await reviews.find({}).sort({Rating: -1}).limit(4).toArray();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(result);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});
// ----------------- Post all video
app.get('/video', async (req, res) => {
  try {
    const cursor = video.find();
    const result = await cursor.toArray();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(result);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});
// ----------------- Get all News
app.get('/news', async (req,res) =>{
  try{
    const News = news.find();
    const result = await News.toArray();
    res.setHeader('Access-Control-Allow-Origin','*');
    res.send(result);
  }catch (error){
    console.error('Error retrieving data:',error);
    res.status(500).send({message: 'Internal Server Error'});
  }
})



// ------------------------------------------------------- Chill gamer crud operation ---------------
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

// nodemon index.js