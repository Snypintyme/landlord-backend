const Game = require("./game.js")
const server = require("express")();
const http = require("http").createServer(server);
const io = require("socket.io")(http, { cors: { origin: "*" }});
const PORT = process.env.PORT || 3000;

let players = [];
let game = new Game();

io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);
    players.push(socket.id);

    // Start game
    if (players.length === 3) {
        game = new Game();

        for (let i = 0; i < 3; ++i) {
            io.to(players[i]).emit("gameStart", {
                playerNum: i,
                hand: game.playerHands[i],
                landlord: game.landlord,
                landlordCard: game.landlordCard
            })
        }
    }

    socket.on("play", (data) => {
        console.log(game.gameState);
        if (game.validPlay(data.cards)) {
            io.to(socket.id).emit("successfulPlay");
            io.emit("newTurn", { // maybe just emit entire game state
                turn: game.gameState.turn,
                cards: game.gameState.playedCards.at(-1).cards
            })
        } else {
            io.to(socket.id).emit("invalidPlay");
        }
    })

    socket.on("pass", () => {
        if (!game.gameState.newRound) {
            game.updateTurn();
            io.emit("newTurn", {
                turn: game.gameState.turn,
                cards: game.gameState.playedCards.at(-1).cards
            })
        } else {
            io.to(socket.id).emit("invalidPlay");
        }
    })

    socket.on("winGame", (data) => {
        let msg;
        if (data.landlordWin) {
            msg = "Landlord wins!"
        } else {
            msg = "Peasants win!"
        }
        io.emit("gameOver", {
            message: msg
        })
    })

    socket.on("disconnect", () => {
        console.log("A user disconnected: " + socket.id);
        io.emit("playerLeft", players.findIndex((player) => player === socket.id));
        players = players.filter((player) => player !== socket.id);
    })
})

http.listen(PORT, () => {
	console.log(`Server live on port ${PORT}`);
});
