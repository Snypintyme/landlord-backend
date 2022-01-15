const Deck = require("./deck.js");

module.exports = class Game {
    constructor() {
        this.deck = new Deck(false);

        this.playerHands = [[], [], []];
        for (let i = 0; i < 51; i += 3) { // change i%3 ++i
            this.playerHands[0].push(this.deck.cards[i]);
            this.playerHands[1].push(this.deck.cards[i + 1]);
            this.playerHands[2].push(this.deck.cards[i + 2]);
        }

        this.landlord = Math.floor(Math.random() * 3);
        this.playerHands[this.landlord].push(this.deck.cards[51]);
        this.playerHands[this.landlord].push(this.deck.cards[52]);
        this.playerHands[this.landlord].push(this.deck.cards[53]);
        this.landlordCard = this.deck.cards[53];

        this.gameState = {
            turn: this.landlord,
            lastPlayed: -1,
            newRound: true,
            playedCards: [],
        }
    }

    updateGameState(hand, value, length, cards) {
        this.gameState.lastPlayed = this.gameState.turn;
        this.gameState.newRound = false;
        this.updateTurn();
        this.gameState.playedCards.push({
            type: hand,
            value: value,
            length: length,
            cards: cards
        })
    }
    
    updateTurn() {
        ++this.gameState.turn;
        if (this.gameState.turn > 2) {
            this.gameState.turn = 0;
        }
        if (this.gameState.turn === this.gameState.lastPlayed) {
            this.gameState.newRound = true;
        }
    }

    static parseSingle(cards) {
        if (cards.length === 1) {
            return (cards[0].rank === 14 && cards[0].suit === 2) ? 15 : cards[0].rank ;
        }
        return false;
    }

    static parseDouble(cards) {
        if (cards.length === 2 && cards[0].rank === cards[1].rank && cards[0].rank !== 14) {
            return cards[0].rank;
        }
        return false;
    }

    static parseStraight(cards, minLength) {
        console.log(cards, minLength);
        if (cards.length >= minLength) {
            let n = cards[0].rank;
            if (n === 13 && minLength > 1) return false;
            for (let i = 1; i < cards.length; ++i, ++n) {
                if (cards[i].rank === 13 || cards[i].rank !== n + 1) {
                    return false;
                }
            }
            return cards[cards.length - 1].rank;
        }
        return false;
    }

    static parseBucket(cards) {
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

    static parseAirplaneSingle(cards) {
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

    static parseAirplaneDouble(cards) {
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

    static parseBomb(cards) { // needs a rework in double deck
        if (cards.length === 4 && cards[0].rank === cards[1].rank && cards[0].rank === cards[2].rank && cards[0].rank === cards[3].rank) {
            return cards[0].rank;
        }
        return false;
    }

    static parseNuke(cards) { // needs a rework in double deck
        if (cards.length === 2 && cards[0].rank === cards[1].rank && cards[0].rank === 14) {
            return cards[0].rank;
        }
        return false;
    }

    validPlay(cards) {
        let lastHandPlayed = (this.gameState.newRound ? null : this.gameState.playedCards[this.gameState.playedCards.length - 1]);
        let val = Game.parseSingle(cards);
        if (val) {
            if (this.gameState.newRound || (lastHandPlayed.type === "single" && val > lastHandPlayed.value)) {
                this.updateGameState("single", val, null, cards);
                return true;
            }
            return false;
        }

        val = Game.parseDouble(cards);
        if (val) {
            if (this.gameState.newRound || (lastHandPlayed.type === "double" && val > lastHandPlayed.value)) {
                this.updateGameState("double", val, null, cards);
                return true;
            }
            return false;
        }

        val = Game.parseStraight(cards, 5);
        if (val) {
            if (this.gameState.newRound || (lastHandPlayed.type === "straight" && val > lastHandPlayed.value && cards.length === lastHandPlayed.length)) {
                this.updateGameState("straight", val, cards.length, cards);
                return true;
            }
            return false;
        }

        val = Game.parseBucket(cards);
        if (val) {
            if (this.gameState.newRound || (lastHandPlayed.type === "bucket" && val > lastHandPlayed.value && cards.length === lastHandPlayed.length)) {
                this.updateGameState("bucket", val, cards.length, cards);
                return true;
            }
            return false;
        }

        val = Game.parseAirplaneSingle(cards);
        if (val) {
            if (this.gameState.newRound || (lastHandPlayed.type === "airplaneSingle" && val > lastHandPlayed.value && cards.length === lastHandPlayed.length)) {
                this.updateGameState("airplaneSingle", val, cards.length, cards);
                return true;
            }
            return false;
        }

        val = Game.parseAirplaneDouble(cards);
        if (val) {
            if (this.gameState.newRound || (lastHandPlayed.type === "airplaneDouble" && val > lastHandPlayed.value && cards.length === lastHandPlayed.length)) {
                this.updateGameState("airplaneDouble", val, cards.length, cards);
                return true;
            }
            return false;
        }

        val = Game.parseBomb(cards);
        if (val) {
            if (this.gameState.newRound || (lastHandPlayed.type === "bomb" && val > lastHandPlayed.value) || (lastHandPlayed.type !== "bomb" && lastHandPlayed.type !== "nuke")) {
                this.updateGameState("bomb", val, null, cards);
                return true;
            }
            return false;
        }

        val = Game.parseNuke(cards);
        if (val) {
            this.updateGameState("nuke", val, null, cards);
            return true;
        }

        return false;
    }
}