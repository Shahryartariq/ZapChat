require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const path = require("path");
const io = socket(server);

io.on("connection", socket => {
    socket.emit("your id", socket.id);
    socket.on("send message", body => {
        io.emit("message", body)
    })
})

if(process.env.PROD) {
    app.use(express.static(path.join(__dirname,'./client/build')));
    app.get('*',(req, res) => {
        res.sendFile(path.join(__dirname,'./client/build/index.html'));
    });
}

const port = process.env.PORT || 8000;
server.listen(port, () => console.log("server is running on port 8000"));