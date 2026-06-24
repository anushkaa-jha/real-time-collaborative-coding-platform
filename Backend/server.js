require('dotenv').config();//Loads environment variables from a .env file into process.env  
const mongoose = require('mongoose');//Handles Database interactions
const express = require('express');//Handles http requests and responses
const cors = require('cors');//Enables Cross-Origin Resource Sharing (CORS) for handling requests from different origins
const fs = require('fs');
const socketIO=require('socket.io');//Enables real-time, bidirectional communication between web clients and servers
const Room = require("./Models/Room");

const app = express();
const roomUsers = {};
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
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

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((error) => {
    console.error("Error connecting to MongoDB", error);
});
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const io = socketIO(server, { cors: {origin: "*"} });
io.on("connection", (socket) => { console.log("User connected");
    socket.on("code-change", async(data) => {
        const roomId=socket.roomId;
        const room=await Room.findOne({roomId});
        if(!room){
            return;
        }
        const file = room.files.find(file => file.fileName === data.file);
        if (file){
            file.content = data.code;
            await room.save();
        }

        socket.to(roomId).emit("code-change", data);
    });
    socket.on("join-room", async (roomId) => {
        socket.join(roomId);
        socket.roomId=roomId;
        let room = await Room.findOne({roomId});
        if(!room){
            room = await Room.create({roomId});
            console.log("New room created", roomId);
        }
        const roomState = {};
        room.files.forEach(file => {
            roomState[file.fileName] = file.content;
        });
        if(!roomUsers[roomId]){
            roomUsers[roomId]=[];
        }if(!roomUsers[roomId].includes(socket.id)){
        roomUsers[roomId].push(socket.id);
        }
        io.to(roomId).emit("user-list", roomUsers[roomId]);
        console.log(roomUsers);
        socket.emit("room-state", roomState); 
    });
    socket.on("create-file",async(data)=>{
        const roomId=socket.roomId;
        const room=await Room.findOne({roomId});
            if(!room){
                return;
            }
            const existingFile = room.files.find(file => file.fileName === data.file);
            if (existingFile) {
                socket.emit("file-error", { message: "File already exists" });
                return;
            }
            room.files.push({
                fileName:data.file,
                content:data.content
            });
            await room.save();
        
        socket.to(roomId).emit("create-file", data);
    });
    socket.on("rename-file", async(data)=>{
        const roomId=socket.roomId;
        const room = await Room.findOne({roomId});
        if(!room){
            return;
        }
        const existingFile = room.files.find(file => 
            file.fileName === data.newName);
            if(existingFile){
                socket.emit("file-error",{message:"File already exists"});
                return;
            }

        const file = room.files.find(file => file.fileName === data.oldName);
        if(!file){
            return;
        }
        file.fileName= data.newName;
         await room.save();

        socket.to(roomId).emit("rename-file", data);
    });
    socket.on("delete-file", async(data)=>{
        const roomId=socket.roomId;
        const room = await Room.findOne({roomId});
        if(!room){
            return;
        }
        room.files=room.files.filter(file => file.fileName !== data.file)
        await room.save();
        socket.to(roomId).emit("delete-file", data);
    });
    socket.on("disconnect",(reason)=>{
        console.log("User disconnected",socket.id, reason);
        const roomId=socket.roomId;
        if(!roomId){
            return;
        }
        roomUsers[roomId]=roomUsers[roomId].filter(id=>{return id !==socket.id});
        if(roomUsers[roomId].length===0){
            delete roomUsers[roomId];
        }
        io.to(roomId).emit("user-list", roomUsers[roomId]);
        console.log("User left", socket.id);
    });
    
 });