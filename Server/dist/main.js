"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.deleteRoom = exports.disconnectFromRoom = exports.joinUserToRoom = exports.makeRoom = exports.getRoomOfUser = exports.rooms = exports.users = void 0;
const Room_1 = require("./Room");
exports.users = [];
exports.rooms = [];
const getRoomOfUser = (userId) => {
    return exports.rooms.find(room => room.users.map(u => u.id).includes(userId));
};
exports.getRoomOfUser = getRoomOfUser;
const makeRoom = (userId) => {
    const room = new Room_1.Room(userId);
    const user = exports.users.find(u => u.id === userId);
    if (user) {
        room.addUser(user);
        exports.rooms.push(room);
    }
    return room.id;
};
exports.makeRoom = makeRoom;
const joinUserToRoom = (userId, roomId) => {
    const room = exports.rooms.find(r => r.id === roomId);
    const user = exports.users.find(u => u.id === userId);
    console.log(exports.rooms);
    console.log(room, user);
    if (user && room) {
        room.addUser(user);
        return true;
    }
    else {
        return false;
    }
};
exports.joinUserToRoom = joinUserToRoom;
const disconnectFromRoom = (roomId, userId) => {
    const room = exports.rooms.find(r => r.id === roomId);
    const user = exports.users.find(u => u.id === userId);
    if (room && user) {
        room.users = room.users.filter(u => u.id !== userId);
        if (exports.users.length <= 0) {
            (0, exports.deleteRoom)(roomId);
            return;
        }
        if (room.userAdminId === userId) {
            room.userAdminId = room.users[0].id;
        }
        room.users.forEach(u => u.sendMessage(JSON.stringify({
            type: "severDisconnectFromRoomAck",
            data: {
                roomId: roomId,
                userId: userId,
            }
        })));
    }
};
exports.disconnectFromRoom = disconnectFromRoom;
const deleteRoom = (roomId) => {
    const roomIndex = exports.rooms.findIndex(r => r.id === roomId);
    if (roomIndex >= 0) {
        delete exports.rooms[roomIndex];
    }
};
exports.deleteRoom = deleteRoom;
const deleteUser = (userId) => {
    if (exports.users.length > 0) {
        console.log("Deleting user", userId);
        exports.users = exports.users.filter(u => u.id !== userId);
    }
};
exports.deleteUser = deleteUser;
(() => __awaiter(void 0, void 0, void 0, function* () {
}))();
//# sourceMappingURL=main.js.map