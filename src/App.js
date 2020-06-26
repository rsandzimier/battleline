import React from 'react';
import { Client } from 'boardgame.io/react';
import { Lobby } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { BattleLine } from './Game';
import { BattleLineBoard } from './Board';

const App = () => (
  <div>
    <Lobby
    gameServer={'https://battleline-backend.herokuapp.com'}
    lobbyServer={'https://battleline-backend.herokuapp.com'}
    gameComponents={[{game: BattleLine, board: BattleLineBoard}]}
    />
  </div>
)

export default App;