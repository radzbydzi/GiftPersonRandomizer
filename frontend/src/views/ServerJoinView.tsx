import React, { ReactNode, useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import { SendJsonMessage, WebSocketHook } from 'react-use-websocket/dist/lib/types';
import { WSFrame } from '../types/WSFrames';
import { ServerUserAddAck } from '../types/UserFrames';
import RoomView from './RoomView';
import { ReadyState } from 'react-use-websocket';
import { WSContext } from '../App';
import JoinRoomView from './JoinRoomView';


interface ServerJoinViewProps {
    setPage: React.Dispatch<React.SetStateAction<ReactNode>>;
}

function ServerJoinView(props: ServerJoinViewProps) {
    const [name, setName] = useState("");
    const {lastJsonMessage, sendJsonMessage} = useContext(WSContext);

    useEffect(() => {
        const wsFrame = lastJsonMessage as WSFrame;
        console.log(lastJsonMessage);
        if(!wsFrame || !wsFrame.type)
            return;

        if(wsFrame.type === "serverUserAddAck") {
            const data = wsFrame.data as ServerUserAddAck;
            props.setPage(<JoinRoomView setPage={props.setPage}/>)
        }
    }, [lastJsonMessage]);

    return (
        <Stack direction={"column"} gap={3}>
            <Typography variant="h3" component="h3">Type your name</Typography>
            <TextField id="outlined-basic" label="Name" variant="outlined" onChange={(event) => setName(event.target.value)} />
            <Button variant="contained" onClick={() => {
                sendJsonMessage({
                    type: "userNameAdd",
                    data: {
                        name: name
                    }
                });
            }}>Send</Button>
        </Stack>
    );
}

export default ServerJoinView;
