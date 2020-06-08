const http = require("http");
const socketIo = require("socket.io");
const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const appp = express();
const app = http.createServer(appp);
const io = socketIo(app);
const RegisterModel = require("./Register.model");
const Notification = require("./Notification.model");
const RegisterRoute = express.Router();
const bcrypt = require("bcryptjs");
const PORT = 5000;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const {
  registerValidation,
  loginValidation,
  NotificationValidation,
} = require("./validation");
const jwt = require("jsonwebtoken");

dotenv.config();
// RegisterRoute.all('*', cors());

appp.use(cors());
appp.use(bodyParser.json());
appp.use(bodyParser.urlencoded({ extended: false }));
RegisterRoute.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/Register", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("connection established successfully");
});

io.set("origins", "*:*");

var jsonParser = bodyParser.json();

RegisterRoute.get("/fetch/:id", function (req, res) {
  console.log("click", "get api is called with id=: ", req.params.id);
  res.send("welcome, " + req.body.username);
});

RegisterRoute.route("/add").post(async (req, res) => {
  console.log(" add the data");

  const { error } = registerValidation(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  }
  console.log("Email", req.body);
  const email = await RegisterModel.findOne({ Email: req.body.Email });
  if (email) return res.status(400).send("Record already exist");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  let Registerdata = new RegisterModel({
    Name: req.body.Name,
    Email: req.body.Email,
    password: hashedPassword,
    City: req.body.City,
    Country: req.body.Country,
    Address: req.body.Address,
    ipfsHash: req.body.ipfsHash,
  });
  Registerdata.save()
    .then((Registerdata) => {
      res.status(200).json({ Registerdata: "Registerdata added successfully" });
    })
    .catch((err) => {
      res.send(450).send({ "adding new Registerdata failed": "failed" });
    });
});

//notification

RegisterRoute.route("/addNotification").post(async (req, res) => {
  console.log("add the notification");

  const { error } = NotificationValidation(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  }
  console.log("Notification data", req.body);

  let RegisterNotification = new Notification({
    FromUser: req.body.FromUser,
    ToUser: req.body.ToUser,
    LandId: req.body.LandId,
  });
  RegisterNotification.save()
    .then((RegisterNotification) => {
      res.status(200).json({
        RegisterNotification: "RegisterNotification added successfully",
      });
    })
    .catch((err) => {
      res
        .send(450)
        .send({ "adding new RegisterNotification failed": "failed" });
    });
});

RegisterRoute.route("/login").post(async (req, res) => {
  console.log("called by login");

  const { error } = loginValidation(req.body);

  if (error) {
    res.status(400).send(error.details[0].message);
  }

  console.log("Email", req.body);
  const email = await RegisterModel.findOne({ Email: req.body.Email });
  if (!email) return res.status(400).send("email is not exist");

  const validpass = await bcrypt.compare(req.body.password, email.password);

  if (!validpass) return res.status(400).send("invalid");
  console.log("reached");

  const token = jwt.sign({ _id: email._id }, process.env.Token_Secret);

  res.header("auth-token", token).send({
    token: token,
    Email: email.Email,
    ipfsHash: email.ipfsHash,
    Name: email.Name,
    Count: count,
  });
});

let count = 0;

io.on("connection", (socket) => {
  console.log("New client connected");
  const sessionid = socket.id;
  console.log("iddd", sessionid);
  count = count + 1;
  socket.on("web", () => {
    console.log("coming");
    socket.broadcast.emit("chkbradcast", "hi");
  });

  socket.on("Approved", (data) => {
    console.log("Approvedata", data);
    io.sockets.emit("SendApprovedata", data);
  });

  socket.on("sale", (data) => {
    console.log("data", data);

    socket.broadcast.emit("sendtonetwork", { data: data });
  });

  //A special namespace "disconnect" for when a client disconnects
  socket.on("disconnect", () => console.log("Client disconnected"));
});

appp.use("/api", RegisterRoute);
appp.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen(PORT, () => {
  console.log("server is Running on", PORT);
});
