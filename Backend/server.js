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
    socket.on("message", (data) => {
        console.log(data);
        io.emit("message",data)
    });
 });