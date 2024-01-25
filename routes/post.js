const mongoose  = require("mongoose");
const user = require("./users");

mongoose.connect("mongodb+srv://nihalturkar7489:nihal%40123@cluster.e2gq5rd.mongodb.net/?authMechanism=DEFAULT");
const postSchema =mongoose.Schema({
    picture:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    caption:String,
    date:{
        type:Date,
        default:Date.toLocalString,
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }]  
}) ;


module.exports = mongoose.model("post", postSchema);
