export interface WSFrame {
    type: WSFrameType
    data?: UserNameAddData | UserSetExclusion | UserJoinRoom | UserNewRoomMessage
};

type WSFrameType = "userNameAdd" 
| "userSetExclusion" 
| "userGetInformation" 
| "userMakeRoom" 
| "userJoinRoom" 
| "userGetCurrentRoomUsers" 
| "userMakeDraw"
| "userNewRoomMessage"
| "userGetIsUserRoomAdmin";

export interface UserNameAddData {
    name: string;
}

export interface UserSetExclusion {
    userToBeChanged: string;
    notExcluded: boolean;
}

export interface UserJoinRoom {
    roomId: string;
}

export interface UserNewRoomMessage {
    userId: string,
    date: number,
    message: string
}