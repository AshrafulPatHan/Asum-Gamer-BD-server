const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");


const JWT_SECRET = `${process.env.KEY}`;


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
        { expiresIn: "15d" } 
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
    req.user = decoded; // user data 
    next();
  });
}

// private rout api 
router.get("/verify", verifyToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ valid: false, message: "Unauthorized" });
    }

    // user is verify by database
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
        const { UserEmail,UserName,UserPhoto } = req.body;
        const user = await User.findOne({ email: UserEmail });
        if (!user) { // if user is exist the server send login token

        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "15d" } 
        );

        return res.status(200).send({"message":true,token,"user": { name: user.name, email: user.email, photoURL: user.photoURL }});

        }else{ // if user is not exist new user is create and server send login token
            function generateSecureRandomString(length) {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                let result = "";
                const array = new Uint32Array(length);
                crypto.getRandomValues(array);
                for (let i = 0; i < length; i++) {
                    result += chars[array[i] % chars.length];
                }
                return result;
            }
            
            const password = generateSecureRandomString(10)
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const result = await User.insertOne({ // send the data on database
            name:UserName,
            email:UserEmail,
            photoURL:UserPhoto,
            password: hashedPassword
        });

        const RegUser = await User.findOne({email:UserEmail}); // search the user on database

        const token = jwt.sign(
            { id:RegUser._id,email:RegUser.email},
            JWT_SECRET,
            { expiresIn: "15d" }
        );

        return res.status(200).send({"message":false,token,"user": {name: RegUser.name, email: RegUser.email, photoURL: RegUser.photoURL}});
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

// post watchLists/love review data
router.patch('/lick',verifyToken, async (req, res) => {
    const {ReviewId,userEmail} = req.body;
    
    if (!ReviewId || !userEmail) {
        return res.status(400).send({ message: "All fields are required" })
    }
    console.log(ReviewId,userEmail);

    try {
        const user = await User.findOne({ email: userEmail });
       
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        console.log(user._id,user.email)

        const filter = {_id: new ObjectId(user._id)}; // for find the user
        const likeGame = {
            $push: { likedReviews: ReviewId }, // push the review id which user like
        }

        const result = User.updateOne(filter,likeGame); // mix the data
        res.status(200).send(result)
    } catch (error) {
        console.error('Error give like:', error);
        res.status(500).send({ message: 'Error is coming on lick' });
    }
});
//  --------------- catch my watchLists 
router.post('/my-licks',verifyToken, async (req, res) => {
  try {
    const { userEmail } = req.body;

    // find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // convert string IDs to ObjectId
    const reviewIds = user.likedReviews.map(id => new ObjectId(id));

    // find all reviews by IDs
    const likedReviewsData = await reviews.find({ _id: { $in: reviewIds } }).toArray();

    return res.status(200).send({
      likedReviews: user.likedReviews,
      reviews: likedReviewsData 
    });

  } catch (error) {
    res.status(500).send("❌ review fetch error: " + error.message);
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
