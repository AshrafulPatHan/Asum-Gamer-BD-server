const express = require("express");
const router = express.Router();

module.exports = (collections) => {
    const { User,reviews,video,blog,watchLists,shop,chat,spam } = collections;

// ----------------- Add video
router.post('/add-video',async (req,res) =>{
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

// --------------- Add Blog data
router.post('/add-news',async (req,res) =>{
    const addBlog = req.body;
    try{
        const result = await blog.insertOne(addBlog);
        res.send(result)
    }catch (error){
        console.error("error in add news",error)
        res.status(500).send({massage:"error inserting data"})
    }
})

// --------------- All review
// --------------- All blog

return router;
};