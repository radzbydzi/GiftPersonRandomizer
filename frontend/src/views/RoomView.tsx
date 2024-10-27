import React, { CSSProperties, ReactNode, useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { Alert, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import { SendJsonMessage, WebSocketHook } from 'react-use-websocket/dist/lib/types';
import { WSFrame } from '../types/WSFrames';
import { RoomUser, ServerGetCurrentRoomUsers, ServerGetIsUserRoomAdmin, ServerNewRoomMessage, ServerSendInformation, ServerUserAddAck, ServerUserChosenRecipient } from '../types/UserFrames';
import { WSContext } from '../App';
import Grid from '@mui/material/Grid2';
import ExclusionButton from '../components/ExclusionButton';
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";

interface RoomViewProps {
    setPage: React.Dispatch<React.SetStateAction<ReactNode>>;
    roomId: string
}

function RoomView(props: RoomViewProps) {
    const {lastJsonMessage, sendJsonMessage} = useContext(WSContext);

    const [userData, setUserData] = useState({id: "", name: ""});
    const [exclusions, setExclusions] = useState([] as string[]);
    const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
    const [restartUsers, setRestartUsers] = useState(false);
    const [admin, setAdmin] = useState(false);
    const [drawValue, setDrawValue] = useState("");
    const [messages, setMessages] = useState([] as Message[]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [failedDraw, setFailedDraw] = useState(false);
    let messagesEnd: HTMLDivElement | null;


    useEffect(() => {
        const wsFrame = lastJsonMessage as WSFrame;
        
        if(!wsFrame || !wsFrame.type)
            return;

        if(wsFrame.type === "serverSendInformation") {
            const data = wsFrame.data as ServerSendInformation;
            console.log("data", data)
            setUserData(data);
        } else if(wsFrame.type === "serverGetCurrentRoomUsers") {
            const data = wsFrame.data as ServerGetCurrentRoomUsers;
            const currentUser = data.users.find(u => u.id === userData.id)!;
            setExclusions(currentUser.exclusions || []);
            const newUsers = data.users
                .filter(user => user.id !== userData.id);

            setRoomUsers(newUsers);
        } else if(wsFrame.type === "serverGetIsUserRoomAdmin") {
            const data = wsFrame.data as ServerGetIsUserRoomAdmin;
            console.log(wsFrame)
            setAdmin(data.isAdmin);
        } else if(wsFrame.type === "serverUserDisconnectedAck") {
            setRestartUsers(true);
        } else if(wsFrame.type === "serverUserChosenRecipient") {
            const data = wsFrame.data as ServerUserChosenRecipient;
            setDrawValue(data.recipient.name);
        } else if(wsFrame.type === "serverNewRoomMessage") {
            const data = wsFrame.data as ServerNewRoomMessage;
            
            const newMsg = {
                userId: data.user.id,
                userName: data.user.name,
                date: new Date(data.date),
                message: data.message
            } as Message;

            setMessages([...messages, newMsg]);
            scrollToLastMessage();
        } else if(wsFrame.type === "serverFailedDraw") {
            setFailedDraw(true);

            setTimeout(() => setFailedDraw(false), 2000);
        }
    }, [lastJsonMessage]);

    useEffect(() => {
        if(restartUsers) {
            sendJsonMessage({
                type: "userGetCurrentRoomUsers"
            });
            setRestartUsers(false);
        }
    }, [restartUsers]);

    useEffect(() => {
        sendJsonMessage({
            type: "userGetInformation"
        });
        sendJsonMessage({
            type: "userGetIsUserRoomAdmin"
        });
        setRestartUsers(true);
    }, []);

    const setUserExclusion = (userId: string, state: boolean) => {
        sendJsonMessage({
            type: "userSetExclusion",
            data: {
                userToBeChanged: userId,
                notExcluded: state
            }
        });
    }

    const scrollToLastMessage = () => {
        if(messagesEnd) {
            messagesEnd.scrollIntoView({ behavior: "smooth" });
        }
    }
    const styleCenter = {
        justifyContent: "center",
        alignItems: "center"
    } as CSSProperties;

    return (
        <Stack direction={"column"} style={{width: '100%'}}>
            <Stack direction={"row"} gap={4}>
                <Stack direction={"row"} style={{...styleCenter}}>
                    <h3>Hi,&nbsp;</h3>
                    {userData.name}
                    !
                </Stack>
                <Stack direction={"row"} style={{...styleCenter}}>
                    <h3>Room id:&nbsp;</h3>
                    {props.roomId}
                </Stack>
            </Stack>
            <Stack direction={"column"} style={{ marginLeft: "30%", marginRight: "30%", marginBottom:"40px"}}>
                {!drawValue && 
                    (
                        <>
                            {admin &&
                                <>
                                    <Button variant='contained' onClick={() => {
                                        sendJsonMessage({
                                            type: "userMakeDraw"
                                        });
                                    }}>
                                        Losuj
                                    </Button>
                                    {
                                        failedDraw && <Alert severity="error">Error while prize draw</Alert>
                                    }
                                </>
                            }
                            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                                {roomUsers.map((value, id) => (
                                    <ListItem
                                    key={id}
                                    disableGutters
                                    secondaryAction={
                                        <ExclusionButton
                                            value={!exclusions.includes(value.id)}
                                            onChange={(state) => {
                                                setUserExclusion(value.id, state);
                                            }}
                                        />
                                    }
                                    >
                                    <ListItemText primary={`${value.name}`} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )
                    
                }
                {drawValue && 
                    <>
                        <Fireworks autorun={{ speed: 1, duration: 1000 * 30}} />
                        <h1 style={{textAlign: "center"}}>You are Santa Claus for {drawValue}</h1>
                    </>
                }
            </Stack>
            <Stack direction={"column"} style={{backgroundColor: "white", marginLeft: "1%", marginRight: "1%"}}>
                <Stack direction={"column"} style={{height: "250px", overflowY: "scroll"}}>
                    {
                        messages.map((m, id) => (
                        <Stack key={id} direction={"row"}
                        spacing={1}
                        >
                            <b style={{color: m.userId === userData.id ? "green" : "black"}}>{m.date.toLocaleString()} {m.userName}</b>
                            <span>|</span>
                            <span>{m.message}</span>
                        </Stack>))
                    }
                    <div style={{ float:"left", clear: "both" }}
                        ref={(el) => { messagesEnd = el; }}>
                    </div>
                </Stack>
                <Stack direction={"row"}>
                    <TextField id="outlined-basic" label="Name" style={{width: "80%"}} variant="outlined" value={currentMessage} onChange={(event) => {
                        setCurrentMessage(event.target.value);
                    }} />
                    <Button variant="contained" onClick={() => {
                        sendJsonMessage({
                            type: "userNewRoomMessage",
                            data: {
                                userId: userData.id,
                                message: currentMessage
                            }
                        });
                        setCurrentMessage("");
                    }}>Send</Button>
                </Stack>
            </Stack>
        </Stack>
    );
}

interface Message {
    userId: string,
    userName: string,
    date: Date,
    message: string;
}

export default RoomView;
