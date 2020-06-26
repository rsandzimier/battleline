import React from 'react';
import { Client } from 'boardgame.io/react';
import { Lobby } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { BattleLine } from './Game';
import { BattleLineBoard } from './Board';

const BattleLineClient = Client({
  game: BattleLine,
  board: BattleLineBoard,
  multiplayer: SocketIO({ server: 'https://battleline-backend.herokuapp.com/' }),
});
console.log(window);
console.log(window.location);
console.log(window.location.hostname);
const App = () => (
  <div>
    <BattleLineClient/>
    <Lobby
    gameServer={'https://battleline-backend.herokuapp.com/'}
    lobbyServer={'https://battleline-backend.herokuapp.com/'}
    // gameServer={'localhost:8000'}
    // lobbyServer={'localhost:8000'}
    gameComponents={[{game: BattleLine, board: BattleLineBoard}]}
    />
  </div>
)

export default App;