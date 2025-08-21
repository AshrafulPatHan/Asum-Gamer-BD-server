const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const JWT_SECRET = "your_secret_key";


module.exports = (collections) => {
    const { User,reviews,video,news,watchLists,shop,chat,spam } = collections;


// ------------ Register route ------------
router.post('/register', async (req, res) => {
    try {
        const { name, email, photoURL, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await User.insertOne({
            name,
            email,
            photoURL,
            password: hashedPassword
        });
        res.send(result);
        // res.status(201).json({ message: "✅ User Registered!" });
    } catch (error) {
        res.status(500).send("❌ Registration Error: " + error.message);
    }
});

  // ------------ Login with Email + Password ------------
router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found!" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid password!" });

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" } // 1 ঘণ্টা পর expire হবে
      );

      res.json({
        message: "✅ Login Success!",
        token,
        user: { name: user.name, email: user.email, photoURL: user.photoURL },
      });
    } catch (error) {
      res.status(500).send("❌ Login Error: " + error.message);
    }
});

// verify the user
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ message: "No token provided!" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token!" });
    req.user = decoded; // user data এখানে থাকবে
    next();
  });
}

// private rout api 
router.get("/verify", verifyToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ valid: false, message: "Unauthorized" });
    }

    // চাইলে ডাটাবেস থেকে ইউজারের তথ্য আবার যাচাই করতে পারো
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ valid: false, message: "User not found" });
    }

    res.json({ valid: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error("❌ Verify API Error:", error.message);
    res.status(500).json({ valid: false, message: "Internal server error" });
  }
});


// ---------------- login with google ----------
router.post('/google-login', async (req, res) => {
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

// user profile
router.get("/profile", verifyToken, async (req, res) => {
    try{
        const user = await User.findOne({ email: req.user.email });
        res.json(user);
    }catch(error){
        console.error("server error on see profile")
        res.status(500).send("error is coming :",error)
    }
});


// ----------------- Add Review
router.post('/add-review',verifyToken,async (req,res) =>{
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
router.post('/my-review',verifyToken, async (req, res) => {
    try {
        const user = await reviews.find({ userEmail: req.body.email });
        const result = await user.toArray();
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send("❌ review shake is error " + error.message);
    }
});

// post watchLists data
router.post('/watchLists',verifyToken, async (req, res) => {
    const addData = req.body;
    console.log('All watchLists-------------', addData);
    try {
        const result = await watchLists.insertOne(addData);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
        res.send(result);
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send({ message: 'Error inserting data' });
    }
});
//  --------------- catch my watchLists 
router.post('/my-watchLists',verifyToken, async (req, res) => {
    try {
        const user = await watchLists.find({ userEmail: req.body.email });
        const result = await user.toArray();
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send("❌ review shake is error " + error.message);
    }
});
// --------------- post comment
router.patch('/comment',verifyToken, async (req, res) => {
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

return router;
};