const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Port = process.env.PORT || 3000;


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/reservationDB", {useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://Admin-JB:Jay8308145340@cluster0-oubaj.mongodb.net/reservationDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true });

const resvSchema = new mongoose.Schema({
  name : String,
  contact : String,
  emailId: String,
  resvDate: Date,
  resvTime : String 
})

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  resvDetails:resvSchema
})


const User = new mongoose.model("User", userSchema);
const Detail = new mongoose.model("Detail" , resvSchema)

app.get("/" , function(req , res){
    res.render("login")
});
app.post("/" , function(req , res){
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({
    email: username
  } , function(err , foundUser){
    if(err){
      console.log(err)
    } else{
      if(foundUser){
        bcrypt.compare(password , foundUser.password , function(err , result){
          if(result == true){
            res.render("reservation");
          } else {
            res.send("You've entered wrong password")
          }
        })
      } else {
        res.send("Register before you login")
      }
    }
  })

})


app.get("/signup" , function(req , res){
  res.render("signup")
})
app.post("/signup" , function(req , res){
  bcrypt.hash(req.body.password , saltRounds ,function(err , hash){
    const newUser = new User({
      email: req.body.username,
      password: hash
    })
    newUser.save(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.render("reservation")
      }
    })
  });

});


app.post("/reservation" , function(req , res){
  const name = req.body.fullName;
  const emailAddr = req.body.email;
  const contact= req.body.contact;
  const date = req.body.resvDate;
  const time = req.body.resvTime;

  const userDetail = new Detail({
      name : req.body.fullName,
      contact : req.body.contact,
      emailId: req.body.email,
      resvDate: req.body.resvDate,
      resvTime: req.body.resvTime
  })
  userDetail.save(function(err){
    if(err){
      console.log(err);
    } else {
      res.render("viewResv" , {
        name: name,
        contact:contact,
        emailId: emailAddr,
        resvDate: date,
         resvTime: time
      })
    }
  })
})
app.get("/editResv" , function(req , res){
  res.render("editResv");
})

app.post("/editResv" , function(req , res ){
  const prevName = req.body.name;
  const newname = req.body.fullName;
  const emailAddr = req.body.email;
  const contact= req.body.contact;
  const date = req.body.resvDate;
  const time = req.body.resvTime;

  Detail.findOneAndUpdate({name: prevName } , {name: newname ,
     emailId: emailAddr ,
      contact : contact , 
      resvDatr: date, 
      resvTime: time})
      res.send("Your details are updated Successfully")
});


app.get("/deleteResv" , function(req ,res){
  res.render("deleteResv");
})
app.post("/deleteResv" , function(req, res){
  const name = req.body.name;
  Detail.findOneAndDelete({name: name} , function(err){
    if(err){
      console.log(err)
    } else{
      res.send("Reservation Deleted successfully")
    }
  })
})

app.listen(Port, function() {
    console.log("Server started on port 3000.");
  });