const express= require("express")
const dotenv = require('dotenv').config()
const routes= require('./routes/routes')
const app=express()
app.use(express.json());
app.use('/api', routes);
const port =process.env.PORT || 5000
app.listen(port,()=>console.log(`server started on port ${port}`))

