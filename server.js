const app = require('express')()
const http = require('http').createServer(app)
const cors = require('cors')
const { SocketAddress } = require('net')
const PORT= 3000


const io = require('socket.io')(http)

app.use(cors())
const mongoose              =  require("mongoose")
const passport              =  require("passport")
const bodyParser            =  require("body-parser")
const LocalStrategy         =  require("passport-local")
const passportLocalMongoose =  require("passport-local-mongoose")
const User                  =  require("./models/user");




//Connecting database
mongoose.connect("mongodb+srv://zionhenry:1357924680Zion@comp3123.6gerx.mongodb.net/labtest1_chat_app?retryWrites=true&w=majority");
app.use(require("express-session")({
    secret:"Any normal Word",       //decode or encode session
    resave: false,          
    saveUninitialized:false    
}));
passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded(
      { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());



//=======================
//      R O U T E S
//=======================



app.get("/", (req,res) =>{
    res.render("home");
})
app.get("/index",isLoggedIn ,(req,res) =>{
    res.render("index");
})
//Auth Routes
app.get("/login",(req,res)=>{
    res.render("login");
});
app.post("/login",passport.authenticate("local",{
    successRedirect:"/index.html",
    failureRedirect:"/login"
}),function (req, res){
});
app.get("/register",(req,res)=>{
    res.render("register");
});
app.post("/register",(req,res)=>{
    
    User.register(new User({username: req.body.username,phone:req.body.phone,telephone: req.body.telephone}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("register");
        }
    passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
    })    
    })
})
app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
app.get('/index.html',(req,res)=>{
    res.sendFile(__dirname +"/index.html")
} )

//Accept client request
io.on('connection', (socket) => {
    console.log('Connection created....')
    //console.log(socket.id)
    //console.log(socket)
    
    //Send welcome message
    socket.emit('welcome', `Welcome to Chat. Your ID is ${socket.id}`)

    //New message from client
    socket.on('message', (data) => {
        //These will send to current client
        //socket.emit('newMessage', data)

        //These will send to all the client including sender
        const msg = {
            sender: socket.id,
            message: data
        }
       //io.sockets.emit('newMessage', msg)

       //These will send to all the client except sender
       socket.broadcast.emit('newMessage', msg)
    })

    //Join New room
    socket.on('join', (roomName) => {
        socket.join(roomName)
        //Send all client 
        const msg = {
            sender: socket.id,
            message: 'Joined the room successfully'
        }
        io.sockets.emit('newMessage', msg)
    })

    socket.on('room_message', (data) => {
        //console.log(data)
        const msg = {
            sender: socket.id,
            message: data.message
        }
        //Direct message/1-to-1 message using socket ID
        //socket.broadcast.to('socketidtosend').emit('message', msg)
        //io.to('socketidtosend').emit('message', msg)

        //To all client in room
        socket.broadcast.to(data.room).emit('newMessage', msg)
    })

    //Dicsonected
    socket.on('disconnect', () => {
        console.log(`${socket.id} Client Disconnected...`)
    })
})

http.listen(PORT, ()=>{
    console.log(`server running at port ${PORT}`)
})
