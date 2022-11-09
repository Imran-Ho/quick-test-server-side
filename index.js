const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleWare added

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gof4ucb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const testsCollection = client.db('english').collection('tests');
        const reviewCollection = client.db('clients').collection('reviews')
// get data
        app.get('/tests', async(req, res)=>{
            
            const cursor = testsCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })
// get data by Id
        app.get('/tests/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await testsCollection.findOne(query)
            res.send(result)
        })
// post services from client side
        app.post('/tests', async (req, res) =>{
            const service = req.body;
            const result = await testsCollection.insertOne(service)
            res.send(result);
        })

// post review from client side-----------------------------------------------
        app.post('/review', async (req, res) =>{
            const reviews = req.body;
            const result = await reviewCollection.insertOne(reviews)
            res.send(result);
        })
// get review data
        // app.get('/review', async(req, res)=>{
        //     const cursor = reviewCollection.find({});
        //     const reviews = await cursor.toArray();
        //     res.send(reviews);
        // })

        app.get('/review',async(req, res) =>{
            console.log(req.query.email)
            let query = {}

            if(req.query.email){
                query = {
                    email:req.query.email
                }
            }

            const cursor = reviewCollection.find(query)
            const opinion = await cursor.toArray();
            res.send(opinion);
        })

// delete 
        app.delete('/review/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)}
            const result = await reviewCollection.deleteOne(query)
            res.send(result);
        })

    }
    finally{

    }

}
run().catch(err => console.log(err))

app.get('/', (req, res)=>{
    res.send('server is created for providing service')
})

app.listen(port, () => {
    console.log(`This is a service providing Server ${port}`)
})