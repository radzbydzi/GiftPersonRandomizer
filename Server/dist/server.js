"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const exApp = (0, express_1.default)();
const express_ws_1 = __importDefault(require("express-ws"));
const User_1 = require("./User");
const main_1 = require("./main");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const { app } = (0, express_ws_1.default)(exApp);
dotenv_1.default.config();
app.use(function (req, res, next) {
    return next();
});
// app.get('/', function(req, res, next){
//   res.end();
// });
app.use(express_1.default.static(path_1.default.join(path_1.default.resolve(), 'public')));
app.ws('/', function (ws, req) {
    main_1.users.push(new User_1.User("", ws));
});
setInterval(() => {
    const inactiveUsers = main_1.users.filter(user => !user.active);
    if (inactiveUsers.length > 0) {
        console.log("Purging inacitve");
    }
    inactiveUsers.forEach(user => {
        const userRoom = (0, main_1.getRoomOfUser)(user.id);
        if (userRoom) {
            userRoom.deleteUser(user.id);
        }
        (0, main_1.deleteUser)(user.id);
    });
}, 1000);
app.listen(process.env.PORT || 443);
//# sourceMappingURL=server.js.map