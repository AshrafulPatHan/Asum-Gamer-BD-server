require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connectDB = require("./DB/db");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 5022;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running 1.0');
});


connectDB().then((collections) => {
  const publicRoutes = require("./routes/PublicRoutes")(collections);
  const adminRoutes = require("./routes/AdminRoutes")(collections);
  const UserRoutes = require("./routes/userRoutes")(collections);

  app.use(publicRoutes);
  app.use(UserRoutes);
  app.use("/admin", adminRoutes);

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

