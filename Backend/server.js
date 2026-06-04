const express = require('express');
const cors = require('cors');
const fs = require('fs');
const socketIO=require('socket.io');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;
app.get("/", (request, response) => {
    response.send("Server Running");
});
app.get("/health", (request, response) => {
    response.json({ status: "running" });
});
app.post("/save", (request, response) => {
    const code = request.body.code;
    fs.writeFile("saved_code.txt", code, (error) => {
        if (error) {
            response.json({ message: "Error saving code" });
            return;
        }
        response.json({ message: "Code saved successfully" });
    });
});
    
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const io = socketIO(server, { cors: {origin: "*"} });
io.on("connection", (socket) => { console.log("User connected");
    socket.on("code-change", (data) => {
        socket.to(socket.roomId).emit("code-change", data);
    });
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        socket.roomId=roomId;
        console.log("Joined room", roomId);
    });
    socket.on("create-file",(data)=>{
        socket.to(socket.roomId).emit("create-file", data);
    });
    socket.on("rename-file",(data)=>{
        socket.to(socket.roomId).emit("rename-file", data);
    });
    socket.on("delete-file",(data)=>{
        socket.to(socket.roomId).emit("delete-file", data);
    });
 });