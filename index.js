const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleWare added

app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('server is created for providing service')
})

app.listen(port, () => {
    console.log(`This is a service providing Server ${port}`)
})