const server = require("express")();
const http = require("http").createServer(server);
const io = require("socket.io")(http, { cors: { origin: "*" }});
const PORT = process.env.PORT || 3000;

class Deck {
    constructor(doubleDeck) {
        this.parseSingle = (cards) => {
            if (cards.length === 1) {
                return (cards[0].rank === 14 && cards[0].suit === 2) ? 15 : cards[0].rank ;
            }
            return false;
        }

        this.parseDouble = (cards) => {
            if (cards.length === 2 && cards[0].rank === cards[1].rank && cards[0].rank !== 14) {
                return cards[0].rank;
            }
            return false;
        }

        this.parseStraight = (cards, minLength) => {
            console.log("parse straight")
            console.log(cards)
            if (cards.length >= minLength) {
                let n = cards[0].rank;
                if (n === 2 && minLength > 1) return false;
                for (let i = 1; i < cards.length; ++i, ++n) {
                    if (cards[i].rank === 2 || cards[i].rank !== n + 1) {
                        if (n === 13 && cards[i].rank === 1) continue;
                        return false;
                    }
                }
                return cards.at(-1).rank;
            }
            return false;
        }

        this.parseBucket = (cards) => {
            if (cards.length >= 6) {
                let straight = [];
                for (let i = 0; i < cards.length; i += 2) {
                    if (cards[i].rank !== cards[i + 1].rank) {
                        return false;
                    }
                    straight.push(cards[i]);
                }
                return this.parseStraight(straight, 3);
            }
            return false;
        }

        this.parseAirplaneSingle = (cards) => {
            if (cards.length % 4 === 0) {
                let straight = [];
                for (let i = 0; i < cards.length - 2; ++i) {
                    if (cards[i].rank === cards[i + 2].rank) {
                        straight.push(cards[i]);
                    }
                }
                return this.parseStraight(straight, cards.length / 4)
            }
            return false;
        }

        this.parseAirplaneDouble = (cards) => {
            if (cards.length % 5 === 0) {
                let straight = [];
                for (let i = 0; i < cards.length - 2; ++i) {
                    if (cards[i].rank === cards[i + 2].rank) {
                        straight.push(cards[i]);
                    }
                }
                return this.parseStraight(straight, cards.length / 5)
            }
            return false;
        }

        this.parseBomb = (cards) => {
            if (cards.length === 4 && cards[0].rank === cards[1].rank && cards[0].rank === cards[2].rank && cards[0].rank === cards[3].rank) {
                return cards[0].rank;
            }
            return false;
        }

        this.parseNuke = (cards) => {
            if (cards.length === 2 && cards[0].rank === cards[1].rank && cards[0].rank === 14) {
                return cards[0].rank;
            }
            return false;
        }

        this.validPlay = (gameState, cards) => {
            if (gameState.newRound) {
                console.log("New Round if")
                let val = this.parseSingle(cards);
                if (val) {
                    updateGameState(gameState, "single", val, null, cards);
                    return true;
                }

                val = this.parseDouble(cards);
                if (val) {
                    updateGameState(gameState, "double", val, null, cards);
                    return true;
                }

                val = this.parseStraight(cards, 5);
                if (val) {
                    updateGameState(gameState, "straight", val, cards.length, cards);
                    return true;
                }

                val = this.parseAirplaneSingle(cards);
                if (val) {
                    updateGameState(gameState, "airplaneSingle", val, cards.length, cards);
                    return true;
                }

                val = this.parseAirplaneDouble(cards);
                if (val) {
                    updateGameState(gameState, "airplaneDouble", val, cards.length, cards);
                    return true;
                }

                val = this.parseBomb(cards);
                if (val) {
                    updateGameState(gameState, "bomb", val, null, cards);
                    return true;
                }

                val = this.parseNuke(cards);
                if (val) {
                    updateGameState(gameState, "nuke", val, null, cards);
                    return true;
                }

                return false;
            }
            else {
                let lastHandPlayed = gameState.playedCards.at(-1);
                console.log("round cont") //DELETE
                console.log(lastHandPlayed);
                if (lastHandPlayed.type === "bomb") {
                    let val = this.parseBomb(cards);
                    if (val && (val > lastHandPlayed.value || (val == 1 && lastHandPlayed.value > 2) || (val == 2 && (lastHandPlayed.value > 2 || lastHandPlayed.value === 1)))) {
                        updateGameState(gameState, "bomb", val, null, cards);
                        return true;
                    }
                }
                else {
                    let val = this.parseBomb(cards);
                    if (val) {
                        updateGameState(gameState, "bomb", val, null, cards);
                        return true;
                    }
                    val = this.parseNuke(cards);
                    if (val) {
                        updateGameState(gameState, "nuke", val, null, cards);
                        return true;
                    }

                    if (lastHandPlayed.type === "single") {
                        val = this.parseSingle(cards);
                        console.log(val)
                        if (val && (val > lastHandPlayed.value || (val == 1 && (lastHandPlayed.value > 2 && lastHandPlayed.value < 14)) || (val == 2 && (lastHandPlayed.value < 14 && lastHandPlayed.value !== 2)))) {
                            updateGameState(gameState, "single", val, null, cards);
                            return true;
                        }
                    } else if (lastHandPlayed.type === "double") {
                        val = this.parseDouble(cards);
                        if (val && (val > lastHandPlayed.value || (val == 1 && lastHandPlayed.value > 2) || (val == 2 && (lastHandPlayed.value > 2 || lastHandPlayed.value === 1)))) {
                            updateGameState(gameState, "double", val, null, cards);
                            return true;
                        }
                    } else if (lastHandPlayed.type === "straight") {
                        val = this.parseStraight(cards, 5);
                        if (val && cards.length === lastHandPlayed.length && (val > lastHandPlayed.value || (val == 1 && lastHandPlayed.value > 2))) {
                            updateGameState(gameState, "straight", val, cards.length, cards);
                            return true;
                        }
                    } else if (lastHandPlayed.type === "bucket") {
                        val = this.parseBucket(cards);
                        if (val && cards.length === lastHandPlayed.length && (val > lastHandPlayed.value || (val == 1 && lastHandPlayed.value > 2))) {
                            updateGameState(gameState, "bucket", val, cards.length, cards);
                            return true;
                        }
                    } else if (lastHandPlayed.type === "airplaneSingle") {
                        val = this.parseAirplaneSingle(cards);
                        if (val && cards.length === lastHandPlayed.length && (val > lastHandPlayed.value || (val == 1 && lastHandPlayed.value > 2))) {
                            updateGameState(gameState, "airplaneSingle", val, cards.length, cards);
                            return true;
                        }
                    } else { // airplaneDouble
                        val = this.parseAirplaneDouble(cards);
                        if (val && cards.length === lastHandPlayed.length && (val > lastHandPlayed.value || (val == 1 && lastHandPlayed.value > 2))) {
                            updateGameState(gameState, "airplaneDouble", val, cards.length, cards);
                            return true;
                        }
                    }
                }
                return false
            }
        }

        this.fillDeck = (deck) => {
            for (let i = 1; i <= 13; ++i) {
                for (let j = 1; j <= 4; ++j) {
                    deck.push({
                        rank: i,
                        suit: j
                    });
                }
            }
            deck = [...deck, { rank: 14, suit: 1 }, { rank: 14, suit: 2 }];
            return deck
        }

        this.shuffleDeck = (deck) => { // Fisher-Yates algorithm
            for (let i = deck.length - 1; i > 0; --i) {
                let j = Math.floor(Math.random() * (i + 1));
                let tmp = deck[i];
                deck[i] = deck[j];
                deck[j] = tmp;
            } 
            return deck;
        }

        this.cards = [];
        if (doubleDeck) {
            this.fillDeck(this.cards);
        }
        this.cards = this.fillDeck(this.cards);
        this.cards = this.shuffleDeck(this.cards);
    }
}

let updateGameState = (gameState, hand, value, length, cards) => {
    gameState.lastPlayed = gameState.turn;
    gameState.newRound = false;
    updateTurn(gameState);
    gameState.playedCards.push({
        type: hand,
        value: value,
        length: length,
        cards: cards
    })
}

let updateTurn = (gameState) => {
    ++gameState.turn;
    if (gameState.turn > 3) {
        gameState.turn = 1;
    }
    if (gameState.turn === gameState.lastPlayed) {
        gameState.newRound = true;
    }
}

let players = [];
let deck;
let gameState = {
    turn: 0,
    playedCards: [],
    newRound: true,
    lastPlayed: -1,
    landlord: null
}

io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);
    players.push(socket.id);
    io.to(socket.id).emit("youJoined", players.length);

    // Start game
    if (players.length === 3) {
        deck = new Deck(false);

        let playerHands = [[], [], []];
        for (let i = 0; i < 51; i += 3) {
            playerHands[0].push(deck.cards[i]);
            playerHands[1].push(deck.cards[i + 1]);
            playerHands[2].push(deck.cards[i + 2]);
        }

        gameState.turn = Math.floor(Math.random() * 3);
        playerHands[gameState.turn].push(deck.cards[51]);
        playerHands[gameState.turn].push(deck.cards[52]);
        playerHands[gameState.turn].push(deck.cards[53]);
        gameState.landlord = players[gameState.turn];
        ++gameState.turn;
        gameState.newRound = true;

        for (let i = 0; i < 3; ++i) {
            console.log(gameState.turn)
            io.to(players[i]).emit("gameStart", {
                hand: playerHands[i],
                landlord: gameState.turn,
                landlordCard: deck.cards[53]
            })
        }
    }

    socket.on("play", (data) => {
        console.log(data)
        if (deck.validPlay(gameState, data.cards)) {
            console.log("new turn")
            io.to(players[(gameState.turn - 2 === -1 ? 2 : gameState.turn - 2)]).emit("successfulPlay")
            io.emit("newTurn", {
                turn: gameState.turn,
                cards: gameState.playedCards.at(-1).cards
            })
        } else {
            io.to(players[gameState.turn - 1]).emit("badHand");
        }
    })

    socket.on("pass", () => {
        console.log(gameState)
        if (!gameState.newRound) {
            updateTurn(gameState);
            io.emit("newTurn", {
                turn: gameState.turn,
                cards: gameState.playedCards.at(-1).cards
            })
        }
        io.to(players[gameState.turn - 1]).emit("badHand");
    })

    socket.on("winGame", () => {
        let msg;
        if (players[(gameState.turn - 2 === -1 ? 2 : gameState.turn - 2)] === gameState.landlord) {
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
	console.log(`server live on port ${PORT}`);
});
