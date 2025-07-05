const express = require("express");
const router = express.Router();

module.exports = (collections) => {
    const { User,reviews,video,news,watchLists,shop,chat,spam } = collections;

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

return router;
};