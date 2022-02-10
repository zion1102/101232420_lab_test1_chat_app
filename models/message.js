const mongoose = require("mongoose");



const passportLocalMongoose = require("passport-local-mongoose");
const MessageSchema = new mongoose.Schema({
  sender:String,
  message : String,
  room: String,
  date: Date
    
}) ;
MessageSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Message",MessageSchema);