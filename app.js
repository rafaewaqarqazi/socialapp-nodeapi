const express = require('express');
const postRouter = require('./routes/api/posts');
const authRouter = require('./routes/api/auth');
const userRouter = require('./routes/api/user');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();

const expressValidator = require('express-validator');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

//DB Connection

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('Database Connected');
    });
mongoose.connection.on('error', err => {
    console.log(`DB Connection Error: ${err.message}`);
});

//Api Docs
app.get('/',(req, res)=>{
    fs.readFile('docs/apiDocs.json', (err, data) => {
        if (err){
            res.status(400).json({error:err});
        }
        const docs = JSON.parse(data);
        res.json(docs);
    })
});

//Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use('/api',postRouter);
app.use('/api',authRouter);
app.use('/api',userRouter);
app.use(function (err,req,res,next) {
    if (err.name === 'UnauthorizedError'){
        res.status(401).json({error:"Unauthorized"})
    }
});
const PORT = 4000;
app.listen(PORT,()=>{
    console.log(`Server running at PORT ${PORT}`);
});