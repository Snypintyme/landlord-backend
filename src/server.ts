import { Game } from './game';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer(express());
const io = new Server(httpServer, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;

let players: string[] = [];
let game: Game;

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);
  players.push(socket.id);
  io.emit('waitingForPlayers', {
    numPlayers: players.length,
  });

  if (players.length === 3) {
    game = new Game(3);
    for (let i = 0; i < 3; ++i) {
      io.to(players[i]).emit('gameStart', {
        playerNum: i,
        hand: game.playerCards[i],
        landlord: game.landlord,
        landlordCard: game.landlordCard,
      });
    }
  }

  socket.on('play', (data) => {
    console.log(game.gameState);
    if (game.playHand(data.cards)) {
      io.to(socket.id).emit('successfulPlay');
      io.emit('newTurn', {
        // maybe just emit entire game state
        turn: game.gameState.turn,
        cards: game.gameState.previousHandPlayed.cards,
      });
    } else {
      io.to(socket.id).emit('invalidPlay');
    }
  });

  socket.on('pass', () => {
    if (!game.gameState.newRound && players[game.gameState.turn] === socket.id) {
      game.updateTurn();
      io.emit('newTurn', {
        turn: game.gameState.turn,
        cards: game.gameState.previousHandPlayed.cards,
      });
    } else {
      io.to(socket.id).emit('invalidPlay');
    }
  });

  socket.on('winGame', (data) => {
    let msg;
    if (data.landlordWin) {
      msg = 'Landlord wins!';
    } else {
      msg = 'Peasants win!';
    }
    io.emit('gameOver', {
      message: msg,
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected: ' + socket.id);
    io.emit('playerLeft', {
      numPlayers: players.length,
      //players.findIndex((player) => player === socket.id));
    });
    players = players.filter((player) => player !== socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server live on port ${PORT}`);
});
