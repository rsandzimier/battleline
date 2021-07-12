// src/server.js

import { Server } from 'boardgame.io/server';
import { BattleLine } from './Game';

const dotenv = require('dotenv');
dotenv.config();

const server = Server({ games: [BattleLine] });
// ONLINE:
const PORT = process.env.PORT || 8000;
// LOCAL:
// const PORT = 8000;
// END

server.run(PORT);