const express = require("express");
const router = express.Router();

module.exports = (collections) => {
    const { User,reviews,video,news,watchLists,shop,chat,spam } = collections;


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

return router;
};
