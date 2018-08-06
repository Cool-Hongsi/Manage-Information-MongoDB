const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  "id": {
    "type" : String,
    "unique" : true
  },
  "password": String,
  "email": String
  },
  {versionKey : false}
);

let User;
let db = mongoose.createConnection("mongodb://SungjunHong:alclsth1@ds141641.mlab.com:41641/web322_sungjunhong", { useNewUrlParser: true });
db.on('error', (err) => {
    console.log(err);
});
db.once('open', () => {
    User = db.model("cruds", userSchema); // put -s
    console.log('Connected Database');
});

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {
                if(err){
                    reject("There was an error encrypting the password");
                } else{
                    userData.password = hash;
                    let newUser = new User(userData);
                    newUser.save((err) => {
                        if(err){
                            if(err.code == 11000){
                                reject("ID is already taken");
                            }
                            else{
                                reject("There was an error creating the user: ");
                            }
                        }  
                        else{
                            resolve();
                        }
                    }
                )}
            })
        })
    })
};

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({id : userData.id}).exec().then((users) => {
        if(users[0].length == 0){
            reject("Unable to find user: " + userData.id);
        }
        else{
            bcrypt.compare(userData.password, users[0].password).then((res) => {
                if (res === true){
                        resolve(users[0]);
                }
                else{
                    reject("Incorrect Password for user: " + userData.id);
                }
        }).catch(() => {
            reject("Unable to find user: " + userData.id);
        })
    }}).catch(()=>{
            reject("there is no matching id");
})})};

module.exports.changeUser = (userData) => {
    return new Promise((resolve, reject) => {
         User.find({id : realId}).exec().then((users) => {
            bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(userData.password, salt, function(err, hash) {
            if(err){
                reject("There was an error encrypting the password");
            } 
            else{
                userData.password = hash;
                User.update({id : realId},
                    {$set: {password : userData.password, email : userData.email}},
                    {multi: false}
        ).exec().then(() => {
            resolve(users[0]);
        }).catch((err) => {
            reject( "There was an error verifying the user: " + err)
        });
    }})})
})})};

module.exports.deleteUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({id : userData}).exec().then((users) => {
            User.remove({id : realId}
            ).exec().then(() => {
                resolve();
            }).catch((err) => {
                reject( "There was an error verifying the user: " + err)
            });
})})};