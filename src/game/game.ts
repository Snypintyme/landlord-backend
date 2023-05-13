import {
  Hand,
  parseAirplaneDoublePassenger,
  parseAirplaneSinglePassenger,
  parseBomb,
  parseDouble,
  parseHand,
  parseNuke,
  parseRollingBucket,
  parseSingle,
  parseStraight,
} from '../util/parse-hand';
import { Card, Deck } from '../deck';

export type PossiblePlayers = 2 | 3 | 4 | 5 | 6;

export interface GameState {
  turn: number;
  previousPlayer: number;
  newRound: boolean;
  previousHandPlayed: Hand;
}

export class Game {
  deck: Deck;
  numPlayers: PossiblePlayers;
  playerCards: Card[][];
  landlord: number;
  landlordCard: Card;
  gameState: GameState;
  winner: number;

  constructor(numPlayers: PossiblePlayers) {
    this.numPlayers = numPlayers;
    this.deck = new Deck(this.isDoubleDeck());
    this.winner = -1;
    this.generateLandlord();
    this.dealCards();

    this.gameState = {
      turn: this.landlord,
      previousPlayer: -1,
      newRound: true,
      previousHandPlayed: {
        type: 'None',
        value: 0,
        length: 0,
        cards: [],
      },
    };
  }

  isDoubleDeck() {
    return this.numPlayers > 3 ? true : false;
  }

  generateLandlord() {
    this.landlord = Math.floor(Math.random() * this.numPlayers);
  }

  dealCards() {
    this.deck.shuffleDeck();
    this.playerCards = [];
    for (let i = 0; i < this.numPlayers; ++i) {
      this.playerCards.push([]);
    }

    let landlordCards: number;
    switch (this.numPlayers) {
      case 2:
        landlordCards = 0;
        break;
      case 3:
        landlordCards = 3;
        break;
      case 4:
        landlordCards = 0;
        break;
      case 5:
        landlordCards = 3;
        break;
      case 6:
        landlordCards = 6;
        break;
    }

    for (let i = 0; i < landlordCards; ++i) {
      this.playerCards[this.landlord].push(this.deck.cards[i]);
    }

    for (let i = landlordCards; i < (this.isDoubleDeck() ? 108 : 54); i += this.numPlayers) {
      for (let j = 0; j < this.numPlayers; ++j) {
        this.playerCards[j].push(this.deck.cards[i + j]);
      }
    }

    this.landlordCard = this.playerCards[this.landlord][0];
  }

  updateTurn() {
    this.gameState.turn = (this.gameState.turn + 1) % this.numPlayers;

    if (this.gameState.turn === this.gameState.previousPlayer) {
      this.gameState.newRound = true;
    }
  }

  playHand(cards: Card[]): boolean {
    let filterCards = [...cards];
    const newPlayerCards = this.playerCards[this.gameState.turn].filter((playerCard) => {
      for (let i = 0; i < filterCards.length; ++i) {
        if (filterCards[i].rank === playerCard.rank && filterCards[i].suit === playerCard.suit) {
          filterCards = filterCards.splice(i, 1);
          return false;
        }
      }
      return true;
    });

    let newPlayedHand: Hand;
    if (this.gameState.newRound) {
      newPlayedHand = parseHand(cards);
    } else {
      newPlayedHand = {
        type: this.gameState.previousHandPlayed.type,
        value: 0,
        length: this.gameState.previousHandPlayed.length,
        cards: cards,
      };
      switch (this.gameState.previousHandPlayed.type) {
        case 'Single':
          newPlayedHand.value = parseSingle(cards);
          break;
        case 'Double':
          newPlayedHand.value = parseDouble(cards);
          break;
        case 'Straight':
          newPlayedHand.value = parseStraight(cards, this.gameState.previousHandPlayed.length);
          break;
        case 'Rolling Bucket':
          newPlayedHand.value = parseRollingBucket(cards, this.gameState.previousHandPlayed.length);
          break;
        case 'Airplane Single Passenger':
          newPlayedHand.value = parseAirplaneSinglePassenger(cards, this.gameState.previousHandPlayed.length);
          break;
        case 'Airplane Double Passenger':
          newPlayedHand.value = parseAirplaneDoublePassenger(cards, this.gameState.previousHandPlayed.length);
          break;
        case 'Bomb':
          newPlayedHand.value = parseBomb(cards);
          if (cards.length < this.gameState.previousHandPlayed.length) {
            newPlayedHand.value = 0;
          }
          newPlayedHand.length = cards.length;
          break;
        case 'Nuke':
          newPlayedHand.value = parseNuke(cards);
          break;
      }

      if (newPlayedHand.value <= this.gameState.previousHandPlayed.value) {
        newPlayedHand.type = 'None';
      }
    }

    if (newPlayedHand.type === 'None') {
      return false;
    }

    this.playerCards[this.gameState.turn] = newPlayerCards;
    if (newPlayerCards.length === 0) {
      this.winner = this.gameState.turn;
    }
    this.gameState.previousPlayer = this.gameState.turn;
    this.gameState.newRound = false;
    this.gameState.previousHandPlayed = newPlayedHand;
    this.updateTurn();
    return true;
  }
}
