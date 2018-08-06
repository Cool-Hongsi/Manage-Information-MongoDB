const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const clientSessions = require('client-sessions');
const checklogin = require('./checklogin.js');
const alert = require('alert-node');

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: "session",
    secret: "hongsi",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.set('view engine', 'jade');
app.set('views', './public/jade');

app.get('/', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup/success', (req,res) => {
    checklogin.registerUser(req.body).then(()=>{
        res.render('signupsuccess', {successMessage : "New User Created"});
    }).catch((err)=>{
        alert(err);
    });
});

app.get('/login/success', (req, res) => {
    res.render('loginsuccess', {id : req.session.user.id, password : req.session.user.password, email : req.session.user.email});
});

app.post('/login/success', (req,res) => {
    checklogin.checkUser(req.body).then((user)=>{
        req.session.user = {
            id : user.id,
            password : user.password,
            email : user.email
        }
        global.realId = req.session.user.id;
        res.render('loginsuccess', {id : req.session.user.id, password : req.session.user.password, email : req.session.user.email});
    }).catch((err)=>{
        res.render('nomatch');
    });
});

app.get('/change', (req, res) => {
    res.render('changeuser', {id : req.session.user.id});
});

app.post('/change/success', (req, res) => {
    checklogin.changeUser(req.body).then((user)=>{
        res.render('changeUserSuccess');
    }).catch((err)=>{
        console.log(err);
    });
})

app.get('/delete', (req, res) => {
    res.render('deleteuser', {id : req.session.user.id});
});

app.get('/accountdelsuccess', (req, res) => {
    checklogin.deleteUser(realId).then(()=>{
        res.render('deleteUserSuccess');
    }).catch((err)=>{
        console.log(err);
    });
});

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Connected in ${port}`);
});
