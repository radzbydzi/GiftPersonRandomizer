import { v6 as uuidv6 } from 'uuid';
import WebSocket, { WebSocketServer } from 'ws';
import { UserJoinRoom, UserNameAddData, UserNewRoomMessage, UserSetExclusion, WSFrame } from './types';
import { getRoomOfUser, joinUserToRoom, makeRoom } from './main';
import { makeDraw } from './makeDraw';

export class User {
    id: string;
    name: string;
    ws: WebSocket;
    pingInterval: NodeJS.Timeout;
    active: boolean;
 
    constructor(name: string, ws: WebSocket) {
        this.id = uuidv6();
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
            this.ws.ping("data", false, (err: Error) => {
                if(err) {
                    clearInterval(this.pingInterval);
                    this.active = false;
                }
            })
        }, 1000);
    }

    sendMessage(message: BufferLike) {
        if(this.active) {
            console.log(`sending msg ${message} from ${this.name}`);
            this.ws.send(message);
        }
    }
    operateMessages() {
        this.ws.on("message", (data, isBinary) => {
            console.log(`Clinet id ${this.id}}: ${data}`);
            const bufferStr = data.toString();
            const wsFrame = JSON.parse(bufferStr) as WSFrame;

            if(wsFrame.type === "userNameAdd") {
                const data = wsFrame.data as UserNameAddData;
                this.name = data.name;
                this.sendMessage(JSON.stringify({
                    type: "serverUserAddAck",
                    data: {
                        id: this.id,
                        name: this.name
                    }
                }));
            } else if (wsFrame.type === "userGetInformation") {
                this.sendMessage(JSON.stringify({
                    type: "serverSendInformation",
                    data: {
                        id: this.id,
                        name: this.name
                    }
                }));
            } else if (wsFrame.type === "userMakeRoom") {
                const roomId = makeRoom(this.id);
                
                this.sendMessage(JSON.stringify({
                    type: "serverJoinRoomAck",
                    data: {
                        roomId
                    }
                }));
            } else if (wsFrame.type === "userJoinRoom") {
                const data = wsFrame.data as UserJoinRoom;
                const roomId = data.roomId;

                const joinRoom = joinUserToRoom(this.id, roomId);

                if(joinRoom) {
                    this.sendMessage(JSON.stringify({
                        type: "serverJoinRoomAck",
                        data: {
                            roomId
                        }
                    }));
                }else {
                    this.sendMessage(JSON.stringify({
                        type: "serverJoinRoomFailedAck",
                        data: {
                            roomId
                        }
                    }));

                }
            } else if (wsFrame.type === "userGetCurrentRoomUsers") {
                const room = getRoomOfUser(this.id);
                const userList = room.getUsers(this.id);
                this.sendMessage(JSON.stringify({
                    type: "serverGetCurrentRoomUsers",
                    data: {
                        users: userList
                    }
                }))
            } else if (wsFrame.type === "userGetIsUserRoomAdmin") {
                const room = getRoomOfUser(this.id);

                this.sendMessage(JSON.stringify({
                    type: "serverGetIsUserRoomAdmin",
                    data: {
                        isAdmin: room.userAdminId === this.id
                    }
                }))
            } else if (wsFrame.type === "userSetExclusion") {
                const data = wsFrame.data as UserSetExclusion;
                const room = getRoomOfUser(this.id);

                room.changeExclusions(this.id, data.userToBeChanged, data.notExcluded);
                
            } else if (wsFrame.type === "userMakeDraw") {
                const room = getRoomOfUser(this.id);

                if(room && this.id === room.userAdminId) {
                    let result = false;
                    for(let i=0; i<5; i++) {
                        result = makeDraw(room);

                        if(result) {
                            break;
                        }
                    }

                    if(!result) {
                        this.sendMessage(JSON.stringify({
                            type: "serverFailedDraw"
                        }))
                    }
                }
            } else if (wsFrame.type === "userNewRoomMessage") {
                const data = wsFrame.data as UserNewRoomMessage;
                const room = getRoomOfUser(this.id);

                room.addNewMessage(data.userId, data.message);
            }
        })
    }
}

type BufferLike =
    | string
    | Buffer
    | DataView
    | number
    | ArrayBufferView
    | Uint8Array
    | ArrayBuffer
    | SharedArrayBuffer
    | readonly any[]
    | readonly number[]
    | { valueOf(): ArrayBuffer }
    | { valueOf(): SharedArrayBuffer }
    | { valueOf(): Uint8Array }
    | { valueOf(): readonly number[] }
    | { valueOf(): string }
    | { [Symbol.toPrimitive](hint: string): string };