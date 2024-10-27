"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const uuid_1 = require("uuid");
const main_1 = require("./main");
const makeDraw_1 = require("./makeDraw");
class User {
    constructor(name, ws) {
        this.id = (0, uuid_1.v6)();
        this.name = name;
        this.ws = ws;
        console.log(`Client ${this.id} connected`);
        this.startPing();
        this.active = true;
        this.operateMessages();
    }
    startPing() {
        this.pingInterval = setInterval(() => {
            //console.log("ping client: ", this.id);
            this.ws.ping("data", false, (err) => {
                if (err) {
                    clearInterval(this.pingInterval);
                    this.active = false;
                }
            });
        }, 1000);
    }
    sendMessage(message) {
        if (this.active) {
            console.log(`sending msg ${message} from ${this.name}`);
            this.ws.send(message);
        }
    }
    operateMessages() {
        this.ws.on("message", (data, isBinary) => {
            console.log(`Clinet id ${this.id}}: ${data}`);
            const bufferStr = data.toString();
            const wsFrame = JSON.parse(bufferStr);
            if (wsFrame.type === "userNameAdd") {
                const data = wsFrame.data;
                this.name = data.name;
                this.sendMessage(JSON.stringify({
                    type: "serverUserAddAck",
                    data: {
                        id: this.id,
                        name: this.name
                    }
                }));
            }
            else if (wsFrame.type === "userGetInformation") {
                this.sendMessage(JSON.stringify({
                    type: "serverSendInformation",
                    data: {
                        id: this.id,
                        name: this.name
                    }
                }));
            }
            else if (wsFrame.type === "userMakeRoom") {
                const roomId = (0, main_1.makeRoom)(this.id);
                this.sendMessage(JSON.stringify({
                    type: "serverJoinRoomAck",
                    data: {
                        roomId
                    }
                }));
            }
            else if (wsFrame.type === "userJoinRoom") {
                const data = wsFrame.data;
                const roomId = data.roomId;
                const joinRoom = (0, main_1.joinUserToRoom)(this.id, roomId);
                if (joinRoom) {
                    this.sendMessage(JSON.stringify({
                        type: "serverJoinRoomAck",
                        data: {
                            roomId
                        }
                    }));
                }
                else {
                    this.sendMessage(JSON.stringify({
                        type: "serverJoinRoomFailedAck",
                        data: {
                            roomId
                        }
                    }));
                }
            }
            else if (wsFrame.type === "userGetCurrentRoomUsers") {
                const room = (0, main_1.getRoomOfUser)(this.id);
                const userList = room.getUsers(this.id);
                this.sendMessage(JSON.stringify({
                    type: "serverGetCurrentRoomUsers",
                    data: {
                        users: userList
                    }
                }));
            }
            else if (wsFrame.type === "userGetIsUserRoomAdmin") {
                const room = (0, main_1.getRoomOfUser)(this.id);
                this.sendMessage(JSON.stringify({
                    type: "serverGetIsUserRoomAdmin",
                    data: {
                        isAdmin: room.userAdminId === this.id
                    }
                }));
            }
            else if (wsFrame.type === "userSetExclusion") {
                const data = wsFrame.data;
                const room = (0, main_1.getRoomOfUser)(this.id);
                room.changeExclusions(this.id, data.userToBeChanged, data.notExcluded);
            }
            else if (wsFrame.type === "userMakeDraw") {
                const room = (0, main_1.getRoomOfUser)(this.id);
                if (room && this.id === room.userAdminId) {
                    let result = false;
                    for (let i = 0; i < 5; i++) {
                        result = (0, makeDraw_1.makeDraw)(room);
                        if (result) {
                            break;
                        }
                    }
                    if (!result) {
                        this.sendMessage(JSON.stringify({
                            type: "serverFailedDraw"
                        }));
                    }
                }
            }
            else if (wsFrame.type === "userNewRoomMessage") {
                const data = wsFrame.data;
                const room = (0, main_1.getRoomOfUser)(this.id);
                room.addNewMessage(data.userId, data.message);
            }
        });
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map