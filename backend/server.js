require("dotenv").config()
const express = require("express");
const http = require("http");
const cors = require("cors")
const connecttoDb = require("./config/db");
const userrouter = require("./routes/userRoutes");
const messagerouter = require("./routes/messageRoutes");
const cookieParser = require("cookie-parser");
const { initSocket } = require("./sockets/socket");


const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 4000
// middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'https://singlechatapplication-with-sockets-d4zw.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

initSocket(server);



// controllers logics
app.use('/api/user',userrouter)
app.use('/api/message',messagerouter)



server.listen(port,()=>{
    console.log(`server is running at port http://localhost:${port}`)
    connecttoDb()
})
