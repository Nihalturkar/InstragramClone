var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');

const passport = require('passport');
const upload = require('./multer');

const localStragy = require('passport-local')
passport.use(new localStragy(userModel.authenticate())); // help of this line user will login

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});
router.get('/login', function (req, res) {
  res.render('login', { footer: false })
})
router.get('/profile', isLoggedIn,async function (req, res,) {
  const user = await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render('profile', { footer: true , user});
});
router.get('/feed', isLoggedIn, async function (req, res,) {
  const user = await userModel.findOne({username:req.session.passport.user});
  const posts = await postModel.find().populate("user"); 
  res.render('feed', { footer: true ,posts, user});
});

router.get('/search', isLoggedIn, function (req, res,) {
  res.render('search', { footer: true });
});
router.get('/upload', isLoggedIn, function (req, res,) {
  res.render('upload', { footer: true });
});
router.get('/edit', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username:req.session.passport.user});
  res.render('edit', { footer: true , user })
})

router.post('/register', function (req, res) {
  const data = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });
  userModel.register(data, req.body.password) //help of this line user account created
    .then(function () {
      passport.authenticate("local")(req, res, function () {  // process of login the user
        res.redirect("/profile");
      })
    })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}), function (req, res) {

})

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
router.post('/update', upload.single("image"), async function(req,res){
  const user = await userModel.findOneAndUpdate({
  username:req.session.passport.user},
  {username:req.body.username, name:req.body.name, bio:req.body.bio},{new:true}
  );
  if(req.file){
    user.profileImage = req.file.filename;
  }
  await user.save();
  res.redirect("/profile");
});
router.post('/upload',isLoggedIn,upload.single("image"), async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
   const post = await postModel.create({
    picture:req.file.filename,
    user: user._id,
    caption:req.body.caption
   })
   user.posts.push(post._id)
   await user.save();
   res.redirect("/feed");
})

// route for search a user
router.get('/username/:username', isLoggedIn, async function (req, res,) {
 
  // i want to search all users starting with given name in mongoose via regex through ChatGpt 

  const regex = new RegExp(`^${req.params.username}`, 'i');
  const users  = await userModel.find({username: regex});
  res.json(users);
})

// for like the post of an user
router.get('/like/post/:id', isLoggedIn,async function (req, res,) {
  const user = await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.id});
  // if like then remove like 
  // if not liked then like the post
  if(post.likes.indexOf(user.id) === -1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user.id),1);
  }
  await post.save();
  res.redirect("/feed");

  
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect("/login");
}

module.exports = router;
