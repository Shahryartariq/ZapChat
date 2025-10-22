require("dotenv").config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const path = require("path");
const io = socket(server, { cors: { origin: "*" } });

let users = {}; // { socketId: username }

io.on("connection", socket => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join", (username) => {
    users[socket.id] = username;

    // Send full list to all
    io.emit("user list", users);

    // Notify everyone (except the one who joined)
    socket.broadcast.emit("system message", `${username} joined the chat`);
  });

  socket.on("send message", (messageData) => {
    io.emit("message", messageData);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    if (username) {
      socket.broadcast.emit("system message", `${username} left the chat`);
      delete users[socket.id];
      io.emit("user list", users);
    }
  });
});

if (process.env.PROD) {
  app.use(express.static(path.join(__dirname, "./client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
  });
}

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`🚀 Server running on port ${port}`));
