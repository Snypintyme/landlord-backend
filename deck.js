module.exports = class Deck {
    constructor(doubleDeck) {
        this.cards = [];
        this.cards = Deck.fillDeck(this.cards);
        if (doubleDeck) {
            Deck.fillDeck(this.cards);
        }
        this.cards = Deck.shuffleDeck(this.cards);
    }

    static fillDeck(deck) {
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

    static shuffleDeck(deck) { // Fisher-Yates algorithm
        for (let i = deck.length - 1; i > 0; --i) {
            let j = Math.floor(Math.random() * (i + 1));
            let tmp = deck[i];
            deck[i] = deck[j];
            deck[j] = tmp;
        } 
        return deck;
    }
}
