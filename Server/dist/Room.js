"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const uuid_1 = require("uuid");
class Room {
    addNewMessage(userId, message) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            const msg = {
                user: {
                    id: user.id,
                    name: user.name
                },
                date: Date.now(),
                message: message
            };
            this.messages.push(msg);
            this.users.filter(u => u.active).forEach(u => {
                u.sendMessage(JSON.stringify({
                    type: "serverNewRoomMessage",
                    data: Object.assign({}, msg)
                }));
            });
        }
    }
    addUser(user) {
        this.users.push(user);
        this.exclusions.push({
            userId: user.id,
            excludedUsers: []
        });
        this.restartUsers();
    }
    deleteUser(userId) {
        this.users = this.users.filter(u => u.id !== userId);
        this.exclusions = this.exclusions.filter(e => e.userId !== userId);
        this.restartUsers();
    }
    getUsers(requestUserId) {
        return this.users.map(u => {
            var _a;
            let result = {
                id: u.id,
                name: u.name,
                exclusions: null
            };
            if (u.id === requestUserId) {
                result = Object.assign(Object.assign({}, result), { exclusions: (_a = this.exclusions.find(e => e.userId === requestUserId)) === null || _a === void 0 ? void 0 : _a.excludedUsers });
            }
            return result;
        }) || [];
    }
    changeExclusions(userId, subjectUserId, notExcluded) {
        const exclusionId = this.exclusions.findIndex(e => e.userId === userId);
        const user = this.users.find(u => u.id === userId);
        console.log(exclusionId, user);
        if (exclusionId !== -1 && user) {
            const exclusion = this.exclusions[exclusionId];
            let excluded = exclusion.excludedUsers;
            if (notExcluded && excluded.includes(subjectUserId)) {
                console.log("changed");
                excluded = excluded.filter(e => e !== subjectUserId);
            }
            else if (!notExcluded && !excluded.includes(subjectUserId)) {
                console.log("changed");
                excluded.push(subjectUserId);
            }
            this.exclusions[exclusionId].excludedUsers = excluded;
            const userList = this.getUsers(user.id);
            user.sendMessage(JSON.stringify({
                type: "serverGetCurrentRoomUsers",
                data: {
                    users: userList
                }
            }));
        }
    }
    restartUsers() {
        this.users
            .forEach(u => {
            u.sendMessage(JSON.stringify({
                type: "serverGetCurrentRoomUsers",
                data: {
                    users: this.getUsers(u.id)
                }
            }));
        });
    }
    constructor(userAdminId) {
        this.id = (0, uuid_1.v6)();
        this.userAdminId = userAdminId;
        this.users = [];
        this.exclusions = [];
        this.messages = [];
    }
}
exports.Room = Room;
//# sourceMappingURL=Room.js.map