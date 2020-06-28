import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { BattleLine } from './Game';
import { BattleLineBoard } from './Board';
import { BattleLineLobby } from './Lobby';

const BattleLineClient = Client({
  game: BattleLine,
  board: BattleLineBoard,
  // ONLINE:
  multiplayer: SocketIO({ server: 'https://battleline-backend.herokuapp.com' }),
  // LOCAL:
  // multiplayer: SocketIO({ server: 'localhost:8000' }),
  // END
});

// ONLINE:
const App = () => (
  <div>
    <BattleLineLobby
    gameServer={'https://battleline-backend.herokuapp.com'}
    lobbyServer={'https://battleline-backend.herokuapp.com'}
    gameComponents={[{game: BattleLine, board: BattleLineBoard}]}
    />
  </div>
)

// LOCAL:
// const App = () => (
//   <div>
//     <BattleLineClient/>
//   </div>
// )
// END

export default App;