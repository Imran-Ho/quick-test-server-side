const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()
const jwt = require('jsonwebtoken');

// middleWare added

app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gof4ucb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// create a function to protect invalid users with provided token
function checkJWT(req, res, next){
    const authHeader = req.headers.authorization;
    // console.log(authHeader) 
    if(!authHeader){
        return req.status(401).send({message: 'unauthorized access'})
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next()

    })
}

async function run(){
    try{
        const testsCollection = client.db('english').collection('tests');
        const reviewCollection = client.db('clients').collection('reviews')

// for getting token in the localStorage
        app.post('/jwt', (req, res) =>{
            const user = req.body;
            // console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '5h'})
            res.send({token})
        })
// get data
        app.get('/limit', async(req, res)=>{
            
            const cursor = testsCollection.find({});
            const services = await cursor.limit(3).toArray();
            res.send(services);
        })
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

        app.get('/review', checkJWT, async (req, res) =>{
            const decoded = req.decoded;
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }
            // console.log(req.headers.authorization)
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
// for update
        // get data by Id
        app.get('/review/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await reviewCollection.findOne(query)
            res.send(result)
        })

        app.put('/review/:id', async(req, res) =>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const items = req.body;
            const option = {upsert: true};
            const updateItems = {
                $set: {
                    name: items.name,
                    photo: items.photo,
                    text: items.text
                }
            }

            const result = await reviewCollection.updateOne(filter, updateItems, option)
            res.send(result)
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