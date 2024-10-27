import React, { ReactNode, useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { Alert, Typography } from '@mui/material';
import { SendJsonMessage, WebSocketHook } from 'react-use-websocket/dist/lib/types';
import { WSFrame } from '../types/WSFrames';
import { ServerJoinRoomAck, ServerUserAddAck } from '../types/UserFrames';
import { WSContext } from '../App';
import RoomView from './RoomView';


interface JoinRoomViewProps {
    setPage: React.Dispatch<React.SetStateAction<ReactNode>>;
}

function JoinRoomView(props: JoinRoomViewProps) {
    const {lastJsonMessage, sendJsonMessage} = useContext(WSContext);

    const [roomId, setRoomId] = useState("");
    const [noRoomFound, setNoRoomFound] = useState(false);

    useEffect(() => {
        const wsFrame = lastJsonMessage as WSFrame;
        
        if(!wsFrame || !wsFrame.type)
            return;

        if(wsFrame.type === "serverJoinRoomAck") {
            const data = wsFrame.data as ServerJoinRoomAck;
            
            const roomId = data.roomId;
            console.log(roomId);
            props.setPage(<RoomView setPage={props.setPage} roomId={roomId}/>)
        } else if(wsFrame.type === "serverJoinRoomFailedAck") {
            setNoRoomFound(true);
            setRoomId("");
        }
    }, [lastJsonMessage]);

    return (
        <Stack direction={"column"} gap={3}>
            <Typography variant="h3" component="h3">Create room</Typography>
            <Button variant="contained" onClick={() => {
                sendJsonMessage({
                    type: "userMakeRoom",
                    data: {
                    }
                });
            }}>CREATE</Button>
            <Typography variant="h3" component="h3">Join the room</Typography>
            <TextField id="outlined-basic" label="Room ID" variant="outlined"
                value={roomId}
                onChange={(event) => setRoomId(event.target.value)} />
            {
                noRoomFound && <Alert severity="error">No room found</Alert>
            }
            <Button variant="contained" 
                disabled={roomId.length <= 0}
                onClick={() => {
                    sendJsonMessage({
                        type: "userJoinRoom",
                        data: {
                            roomId
                        }
                    });
                }}>JOIN</Button>
        </Stack>
    );
}

export default JoinRoomView;
