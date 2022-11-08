const express = require('express');
const app = express()
const port = process.env.PORT || 5000;

app.get('/', (req, res)=>{
    res.send('server is created for providing service')
})

app.listen(port, () => {
    console.log(`This is a service providing Server ${port}`)
})