import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { BattleLine } from './Game';
import { BattleLineBoard } from './Board';
import { BattleLineLobby } from './Lobby';

import { Lobby } from 'boardgame.io/react';

const BattleLineClient = Client({
  game: BattleLine,
  board: BattleLineBoard,
  multiplayer: SocketIO({ server: 'https://battleline-backend.herokuapp.com' }),
});

const App = () => (
  <div>
    <BattleLineLobby
    gameServer={'https://battleline-backend.herokuapp.com'}
    lobbyServer={'https://battleline-backend.herokuapp.com'}
    gameComponents={[{game: BattleLine, board: BattleLineBoard}]}
    />
  </div>
)

export default App;