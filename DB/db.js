const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PAS}@cluster0.zxihh.mongodb.net/Chill-Gamer?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function connectDB() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        
        const db = client.db("AsumGamerBD");
        return {
            // Mail: db.collection("Mail"), 
            User: db.collection('User'),
            reviews: db.collection('reviews'),
            video: db.collection('video'),
            news: db.collection('news'),
            watchLists: db.collection('watchLists'),
            shop: db.collection('shop'),
            chat: db.collection('chat'),
            spam: db.collection('spam'),
        };
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
  } catch(error) {
    // Ensures that the client will close when you finish/error
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}


module.exports = connectDB;
