const mongoose = require("mongoose");
//In app.js


const passportLocalMongoose = require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
    username:String,
    firstname:String,
    lastname:String,
    password:String,
    creation:Date
    
}) ;
UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);