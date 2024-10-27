export interface ServerSendInformation {
    id: string,
    name: string
}

export interface ServerUserAddAck {
    id: string,
    name: string
}

export interface ServerJoinRoomAck {
    roomId: string,
}

export interface ServerGetCurrentRoomUsers {
    users: RoomUser[]
}

export interface RoomUser {
    id: string;
    name: string;
    exclusions?: string[];
}

export interface ServerGetIsUserRoomAdmin {
    isAdmin: boolean;
}

export interface ServerGetIsUserRoomAdmin {
    isAdmin: boolean;
}

export interface ServerUserChosenRecipient {
    userId: string,
    recipient: {
        id: string,
        name: string
    }
}

export interface ServerNewRoomMessage {
    user: {
        id: string,
        name: string
    },
    date: number,
    message: string
}