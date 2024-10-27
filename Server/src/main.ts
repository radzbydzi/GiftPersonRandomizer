import { Room } from "./Room";
import { User } from "./User";

export let users = [] as User[];
export let rooms = [] as Room[];

export const getRoomOfUser = (userId: string) => {
    return rooms.find(room => room.users.map(u => u.id).includes(userId));
}

export const makeRoom = (userId: string) => {
    const room = new Room(userId);
    const user = users.find(u => u.id === userId);

    if(user) {
        room.addUser(user);
        rooms.push(room);
    }

    return room.id;
}

export const joinUserToRoom = (userId: string, roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const user = users.find(u => u.id === userId);

    console.log(rooms);
    console.log(room, user);
    if(user && room) {
        room.addUser(user)
        return true;
    } else {
        return false;
    }
}

export const disconnectFromRoom = (roomId: string, userId: string) => {
    const room = rooms.find(r => r.id === roomId);
    const user = users.find(u => u.id === userId);

    if(room && user) {
        room.users = room.users.filter(u => u.id !== userId);
        if(users.length <= 0) {
            deleteRoom(roomId);
            return;
        }
        
        if(room.userAdminId === userId) {
            room.userAdminId = room.users[0].id;
        }

        room.users.forEach(u => u.sendMessage(JSON.stringify({
            type: "severDisconnectFromRoomAck",
            data: {
                roomId: roomId,
                userId: userId,
            }
        })))

    }
}

export const deleteRoom = (roomId: string) => {
   const roomIndex = rooms.findIndex(r => r.id === roomId);

   if(roomIndex >= 0) {
        delete rooms[roomIndex];
   }
}

export const deleteUser = (userId: string) => {
    if(users.length > 0) {
        console.log("Deleting user", userId);
        users = users.filter(u => u.id !== userId);
    }

}

(async() => {

})();