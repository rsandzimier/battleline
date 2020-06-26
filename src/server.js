// src/server.js

import { Server } from 'boardgame.io/server';
import { BattleLine } from './Game';

const server = Server({ games: [BattleLine] });
const PORT = process.env.PORT || 8000;

server.run(PORT);