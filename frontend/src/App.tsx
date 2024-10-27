import React, { createContext, ReactNode, useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import ServerJoinView from './views/ServerJoinView';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { WSContextType } from './types/WSContextType';
import dotenv from 'dotenv'; 

export const WSContext = createContext({
  lastJsonMessage: {},
  sendJsonMessage: (message: object) => {}
} as WSContextType);

function App() {
  const [page, setPage] = useState<ReactNode>();
  const {lastJsonMessage, readyState, sendJsonMessage} = useWebSocket<object>(process.env.WS_SERVER || "ws://localhost:3000");
  

  useEffect(() => {
    setPage(<ServerJoinView setPage={setPage}/>);
  }, []);
  
  /*
      UNINSTANTIATED = -1,
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3
  */
  return (
    <Grid style={{
      margin: "10em",
      padding: "3em",
      backgroundColor: "#DDD",
      borderRadius: "25px"

    }}>
      {readyState === ReadyState.UNINSTANTIATED && <h1>Server uninstantiated</h1>}
      {readyState === ReadyState.CONNECTING && <h1>Connecting to server...</h1>}
      {readyState === ReadyState.OPEN && (
        <WSContext.Provider value={{lastJsonMessage, sendJsonMessage}}>
          {page}
        </WSContext.Provider>
      )}
      {readyState === ReadyState.CLOSING && <h1>Server is closing...</h1>}
      {readyState === ReadyState.CLOSED && <h1>Server is closed...</h1>}
    </Grid>
  );
}

export default App;
