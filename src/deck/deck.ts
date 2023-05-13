import { Card, Rank, Suit } from './card';

export class Deck {
  cards: Card[] = [];

  constructor(doubleDeck: boolean) {
    this.fillDeck();
    if (doubleDeck) {
      this.fillDeck();
    }
  }

  clearDeck() {
    this.cards = [];
  }

  fillDeck() {
    Object.values(Rank).forEach((rank) => {
      if (typeof rank !== 'number') {
        return;
      }
      Object.values(Suit).forEach((suit) => {
        if (typeof suit !== 'number') {
          return;
        }
        if ((rank === Rank['BlackJoker'] || rank === Rank['ColourJoker']) && suit !== Suit['None']) {
          return;
        }
        if (!(rank === Rank['BlackJoker'] || rank === Rank['ColourJoker']) && suit === Suit['None']) {
          return;
        }
        this.cards.push({ rank, suit });
      });
    });
  }

  shuffleDeck() {
    // Fisher-Yates algorithm
    for (let i = this.cards.length - 1; i > 0; --i) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = tmp;
    }
  }
}
