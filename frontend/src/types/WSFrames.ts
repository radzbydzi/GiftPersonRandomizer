import { ServerGetCurrentRoomUsers, ServerGetIsUserRoomAdmin, ServerJoinRoomAck, ServerNewRoomMessage, ServerSendInformation, ServerUserAddAck, ServerUserChosenRecipient } from "./UserFrames";

export interface WSFrame {
    type: WSFrameType
    data?: ServerSendInformation | ServerUserAddAck | ServerJoinRoomAck | ServerGetCurrentRoomUsers | ServerGetIsUserRoomAdmin | ServerUserChosenRecipient | ServerNewRoomMessage
};

type WSFrameType = "serverSendInformation" 
| "serverUserAddAck" 
| "serverJoinRoomAck" 
| "serverJoinRoomFailedAck" 
| "serverGetCurrentRoomUsers" 
| "serverGetIsUserRoomAdmin"
| "servetSetExclusionAck"
| "serverSetExclusionAck"
| "serverUserChosenRecipient"
| "serverNewRoomMessage"
| "serverFailedDraw"
| "serverUserDisconnectedAck";