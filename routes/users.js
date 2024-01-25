const mongoose  = require("mongoose");
const plm =  require("passport-local-mongoose");

mongoose.connect("mongodb+srv://nihalturkar7489:nihal%40123@cluster.e2gq5rd.mongodb.net/?authMechanism=DEFAULT");

const userSchma =mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  bio:String,
  profileImage:String,
  posts:[{ type: mongoose.Schema.Types.ObjectId , ref:"post"}],
  
}) ;

userSchma.plugin(plm);

module.exports = mongoose.model("user", userSchma);
