import express, { Request, Response } from "express";
const exApp = express();
import expressWs from 'express-ws';
import { User } from "./User";
import { deleteUser, getRoomOfUser, users } from "./main";
import path from "path";
import dotenv from 'dotenv'; 

const { app } = expressWs(exApp);
dotenv.config();

app.use(function (req, res, next) {
  return next();
});

// app.get('/', function(req, res, next){
//   res.end();
// });

app.use(express.static(path.join(path.resolve(), 'public')));

app.ws('/', function(ws, req) {
  users.push(new User("", ws));
});

setInterval(() => {
  const inactiveUsers = users.filter(user => !user.active);

  if(inactiveUsers.length > 0) {
    console.log("Purging inacitve");
  }

  inactiveUsers.forEach(user => {
    const userRoom = getRoomOfUser(user.id);

    if(userRoom) {
      userRoom.deleteUser(user.id);
    }

    deleteUser(user.id);
  })
}, 1000);

app.listen(process.env.PORT || 443);