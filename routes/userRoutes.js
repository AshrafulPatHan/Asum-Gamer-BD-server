const express = require("express");
const router = express.Router();

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

// ----------------- Add Review
router.post('/add-review',async (req,res) =>{
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
router.post('/my-review', async (req, res) => {
    try {
        const user = await reviews.find({ userEmail: req.body.email });
        const result = await user.toArray();
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send("❌ review shake is error " + error.message);
    }
});


// post watchLists data
router.post('/watchLists', async (req, res) => {
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
router.post('/my-watchLists', async (req, res) => {
    try {
        const user = await watchLists.find({ userEmail: req.body.email });
        const result = await user.toArray();
        return res.status(200).send(result);
    } catch (error) {
        res.status(500).send("❌ review shake is error " + error.message);
    }
});
// --------------- post comment
router.patch('/comment', async (req, res) => {
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