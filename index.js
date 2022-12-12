const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const session = require('express-session')
const passport = require('passport')
const nodemailer = require('nodemailer')
const passportLocalMongoose = require('passport-local-mongoose')

require('dotenv').config();
const app = express();

app.set('view-engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "our secret",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/User", {useNewUrlParser: true});

const userSchema = new mongoose.Schema  ({
    email: String,
    password: String,

  });
userSchema.plugin(passportLocalMongoose)

const secret = 'secrets'
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



const users = []


app.get("/", function(req, res){
  res.render("first.ejs");
}); 


app.get("/login", function(req, res){
  res.render("login.ejs");
});


app.get("/register", function(req, res){
  res.render("register.ejs");
});

app.get('/dash', (req, res)=>{
if(req.isAuthenticated())
{res.render('dash.ejs')
} else{
  res.redirect('/login')
}
})
app.post("/register", function(req, res){
User.register({username: req.body.username}, req.body.password, function(err, user){
  if(err){
    console.log(err);
    res.redirect('/register')
  } else {
    passport.authenticate('local')(
      req, res, function(){
        res.redirect('/dash')
      }
    )
  }
})
})


// app.get('/changepassword', function (req, res) {
//   res.redirect('/auth')
// });

// app.post('/changepassword', function (req, res) {
//   User.findByUsername(req.body.username, (err, user) => {
//       if (err) {
//           res.send(err);
//       } else {
//           user.changePassword(req.body.oldpassword, 
//           req.body.newpassword, function (err) {
//               if (err) {
//                   res.send(err);
//               } else {
//                   res.redirect('/login')
//               }
//           });
//       }})
//         })

app.post("/login", function(req, res){
 const user = new User({
  username: req.body.username,
  password: req.body.password
 })

req.login(user, function(err){
  if(err){
    res.redirect('/auth')
  }else{
    passport.authenticate('local')(
      req, res, function(){
        res.redirect('/dash')
      }
    )
  }
})
})

app.get('/logout', function(req, res){
  req.logout;
  res.redirect("/")
})





let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port);

app.listen(port, function(){
  console.log("Server has started successfully.");
});