import { Card, Rank } from '../deck';

/*
  Functions will return 0 if it does not match, otherwise returns the relative strength (value) of the hand
  Assumes cards are given in rank and suit order
*/

const isEven = (length: number) => length % 2 === 0;
const isJoker = (card: Card) => card.rank === Rank['BlackJoker'] || card.rank === Rank['ColourJoker'];

export const parseSingle = (cards: Card[]): number => {
  if (cards.length === 1) {
    return cards[0].rank;
  }
  return 0;
};

export const parseDouble = (cards: Card[]): number => {
  if (cards.length === 2 && cards[0].rank === cards[1].rank && !isJoker(cards[0])) {
    return cards[0].rank;
  }
  return 0;
};

export const parseStraight = (cards: Card[], length: number, minLength = 5): number => {
  if (length >= minLength && length <= 12 && cards.length === length) {
    if (cards.find((card) => card.rank === Rank['BlackJoker'] || card.rank === Rank['ColourJoker'])) {
      return 0;
    }
    let currentRank = cards[0].rank;
    // Straight of length 1, Rank['Two'] passes
    for (let i = 1; i < cards.length; ++i, ++currentRank) {
      if (cards[i].rank !== currentRank + 1 || cards[i].rank === Rank['Two']) {
        return 0;
      }
    }
    return currentRank;
  }
  return 0;
};

export const parseRollingBucket = (cards: Card[], length: number): number => {
  if (isEven(cards.length) && length >= 3 && length <= 12 && cards.length / 2 === length) {
    const straight = [];
    for (let i = 0; i < cards.length; i += 2) {
      if (cards[i].rank !== cards[i + 1].rank) {
        return 0;
      }
      straight.push(cards[i]);
    }
    return parseStraight(straight, straight.length, 3);
  }
  return 0;
};

export const parseAirplaneSinglePassenger = (cards: Card[], length: number): number => {
  if (cards.length % 4 === 0 && cards.length / 4 === length) {
    const straight = [];
    for (let i = 0; i < cards.length - 2; ++i) {
      if (i !== 0 && cards[i].rank === cards[i - 1].rank) {
        return 0;
      }
      if (cards[i].rank === cards[i + 2].rank && (i + 3 >= cards.length || cards[i].rank !== cards[i + 3].rank)) {
        straight.push(cards[i]);
        i += 2;
      }
    }
    return parseStraight(straight, length, 1);
  }
  return 0;
};

export const parseAirplaneDoublePassenger = (cards: Card[], length: number): number => {
  if (cards.length % 5 === 0 && cards.length / 5 === length) {
    const straight = [];
    for (let i = 0; i < cards.length - 2; ++i) {
      if (i !== 0 && cards[i].rank === cards[i - 1].rank) {
        return 0;
      }
      if (cards[i].rank === cards[i + 2].rank && (i + 3 >= cards.length || cards[i].rank !== cards[i + 3].rank)) {
        straight.push(cards[i]);
        i += 2;
      } else if (
        cards[i].rank === cards[i + 1].rank &&
        (i + 2 >= cards.length || cards[i].rank !== cards[i + 2].rank)
      ) {
        i += 1;
      }
    }
    return parseStraight(straight, length, 1);
  }
  return 0;
};

export const parseBomb = (cards: Card[]): number => {
  const minBombSize = 4;
  if (
    cards.length >= minBombSize &&
    cards[0].rank <= Rank['Two'] &&
    cards.every((card) => card.rank === cards[0].rank)
  ) {
    return cards[0].rank;
  }
  return 0;
};

export const parseNuke = (cards: Card[]): number => {
  if (cards.length === 2 && cards.every((card) => isJoker(card))) {
    const numColourJokers = cards.filter((card) => card.rank === Rank['ColourJoker']).length;
    return numColourJokers + 1;
  }
  return 0;
};

export type HandType =
  | 'Single'
  | 'Double'
  | 'Straight'
  | 'Rolling Bucket'
  | 'Airplane Single Passenger'
  | 'Airplane Double Passenger'
  | 'Bomb'
  | 'Nuke'
  | 'None';

export interface Hand {
  type: HandType;
  value: number;
  length: number;
  cards: Card[];
}

export const parseHand = (cards: Card[]): Hand => {
  let value: number;

  value = parseSingle(cards);
  if (value) {
    return {
      type: 'Single',
      value: value,
      length: 1,
      cards: cards,
    };
  }

  value = parseDouble(cards);
  if (value) {
    return {
      type: 'Double',
      value: value,
      length: 2,
      cards: cards,
    };
  }

  for (let i = 5; i <= 12; ++i) {
    value = parseStraight(cards, i);
    if (value) {
      return {
        type: 'Straight',
        value: value,
        length: i,
        cards: cards,
      };
    }
  }

  for (let i = 3; i <= 12; ++i) {
    value = parseRollingBucket(cards, i);
    if (value) {
      return {
        type: 'Rolling Bucket',
        value: value,
        length: i,
        cards: cards,
      };
    }
  }

  for (let i = 1; i <= 7; ++i) {
    value = parseAirplaneSinglePassenger(cards, i);
    if (value) {
      return {
        type: 'Airplane Single Passenger',
        value: value,
        length: i,
        cards: cards,
      };
    }
  }

  for (let i = 1; i <= 7; ++i) {
    value = parseAirplaneDoublePassenger(cards, i);
    if (value) {
      return {
        type: 'Airplane Double Passenger',
        value: value,
        length: i,
        cards: cards,
      };
    }
  }

  value = parseBomb(cards);
  if (value) {
    return {
      type: 'Bomb',
      value: value,
      length: cards.length,
      cards: cards,
    };
  }

  value = parseNuke(cards);
  if (value) {
    return {
      type: 'Nuke',
      value: value,
      length: 2,
      cards: cards,
    };
  }

  return {
    type: 'None',
    value: 0,
    length: 0,
    cards: cards,
  };
};
