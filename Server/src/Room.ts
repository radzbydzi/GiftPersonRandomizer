import { User } from "./User";
import { v6 as uuidv6 } from 'uuid';

export class Room {
    id: string;
    name: string;
    userAdminId: string;
    users: User[]
    messages: RoomMessage[];
    exclusions: UserExclusions[];
    
    addNewMessage(userId: string, message: string) {
        const user = this.users.find(u => u.id === userId);

        if(user) {
            const msg = {
                user: {
                    id: user.id,
                    name: user.name
                },
                date: Date.now(),
                message: message
            }

            this.messages.push(msg);

            this.users.filter(u => u.active).forEach(u => {
                u.sendMessage(JSON.stringify({
                    type: "serverNewRoomMessage",
                    data: {
                        ...msg
                    }
                }))
            })
        }
    }
    
    addUser(user: User) {

        this.users.push(user);
        this.exclusions.push({
            userId: user.id,
            excludedUsers: []
        })

        this.restartUsers();
        
    }

    deleteUser(userId: string) {
        this.users = this.users.filter(u => u.id !== userId);
        this.exclusions = this.exclusions.filter(e => e.userId !== userId);

        this.restartUsers();
    }

    getUsers(requestUserId: string) {
        return this.users.map(u => {
            let result = {
                id: u.id,
                name: u.name,
                exclusions: null
            };
            if(u.id === requestUserId) {
                result = {...result, exclusions: this.exclusions.find(e => e.userId === requestUserId)?.excludedUsers}
            }
            return result;
        }) || []
    }


    changeExclusions(userId: string, subjectUserId: string, notExcluded: boolean) {
        const exclusionId = this.exclusions.findIndex(e => e.userId === userId);
        const user = this.users.find(u => u.id === userId);
        
        console.log(exclusionId, user)
        if(exclusionId !== -1 && user) {
            const exclusion = this.exclusions[exclusionId]
            let excluded = exclusion.excludedUsers;
            if(notExcluded && excluded.includes(subjectUserId)) {
                console.log("changed")
                excluded = excluded.filter(e => e !== subjectUserId);
            } else if (!notExcluded && !excluded.includes(subjectUserId)) {
                console.log("changed")
                excluded.push(subjectUserId);
            }
            this.exclusions[exclusionId].excludedUsers = excluded;

            const userList = this.getUsers(user.id);
            user.sendMessage(JSON.stringify({
                type: "serverGetCurrentRoomUsers",
                data: {
                    users: userList
                }
            }))
        }
    }

    restartUsers(){
        this.users
        .forEach(u => {
            u.sendMessage(JSON.stringify({
                type: "serverGetCurrentRoomUsers",
                data: {
                    users: this.getUsers(u.id)
                }
            }))
        })
    }
    constructor(userAdminId: string) {
        this.id = uuidv6();
        this.userAdminId = userAdminId;
        this.users = [];
        this.exclusions = [];
        this.messages = [];
    }
}

interface RoomMessage {
    user: {
        id: string,
        name: string
    },
    date: number;
    message: string
}

export interface UserExclusions {
    userId: string,
    excludedUsers: string[]
}