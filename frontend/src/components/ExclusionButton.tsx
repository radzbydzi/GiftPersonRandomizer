import React, { CSSProperties, ReactNode, useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { IconButton, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import { SendJsonMessage, WebSocketHook } from 'react-use-websocket/dist/lib/types';
import { WSFrame } from '../types/WSFrames';
import { RoomUser, ServerGetCurrentRoomUsers, ServerGetIsUserRoomAdmin, ServerSendInformation, ServerUserAddAck } from '../types/UserFrames';
import { WSContext } from '../App';
import Grid from '@mui/material/Grid2';

interface ExclusionButtonProps {
    value: boolean
    onChange: (state: boolean) => void
}

function ExclusionButton(props: ExclusionButtonProps) {
    function showButton(value: string, checkingValue: boolean) {
        const checked = props.value === checkingValue;
        const style = {
          width: "1.5em", 
          height: "1.5em", 
          alignContent: "center", 
          textAlign: "center" , 
          cursor: "pointer",
          userSelect: "none"
        } as React.CSSProperties;
    
        if(!checked) {
          return <Paper 
          elevation={1} 
          style={{...style, backgroundColor: "WhiteSmoke"}}
          onClick={() => {props.onChange && props.onChange(checkingValue)}}
          >
            {value}
            </Paper>
        } else {
          return <Paper elevation={9} style={{...style, backgroundColor: "green"}}>{value}</Paper>
        }
    }

    return <Stack direction="row"
        justifyContent={"center"}
        spacing={1}>
        {showButton("✔️", true)}
        {showButton("❌", false)}
    </Stack>


}

export default ExclusionButton;
