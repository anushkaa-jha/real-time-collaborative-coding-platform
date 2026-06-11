const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
    roomId:{
        type:String, 
        required:true, 
        unique:true},
    files:{ type:[
    {
        fileName:String,
        content:String
    }
],
    default:[]
}},
    {
        timestamps:true
});
const Room = mongoose.model("Room", roomSchema);
module.exports = Room;