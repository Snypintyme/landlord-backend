import { Card, Rank, Suit } from '../deck';
import {
  HandType,
  parseAirplaneDoublePassenger,
  parseAirplaneSinglePassenger,
  parseBomb,
  parseDouble,
  parseHand,
  parseNuke,
  parseRollingBucket,
  parseSingle,
  parseStraight,
} from './parse-hand';

const makeCard = (rank: Rank) => {
  return { rank, suit: Suit['None'] };
};
const defaultRank: Rank = Rank['Three'];
const defaultCard: Card = makeCard(defaultRank);

describe('parse-hand', () => {
  it.each([Rank['Ace'], Rank['Two'], Rank['Jack'], Rank['BlackJoker'], Rank['ColourJoker']])(
    'should parse a single',
    (rank: Rank) => {
      const result = parseSingle([{ rank, suit: Suit['None'] }]);

      expect(result).toBe(rank);
    }
  );

  it.each([[[]], [[defaultCard, defaultCard]], [[defaultCard, defaultCard, defaultCard, defaultCard]]])(
    'should fail to parse a single',
    (cards: Card[]) => {
      const result = parseSingle(cards);

      expect(result).toBe(0);
    }
  );

  it.each([Rank['Ace'], Rank['Two'], Rank['Jack']])('should parse a double', (rank: Rank) => {
    const result = parseDouble([
      { rank, suit: Suit['None'] },
      { rank, suit: Suit['None'] },
    ]);

    expect(result).toBe(rank);
  });

  it.each([
    [[]],
    [[defaultCard]],
    [[defaultCard, defaultCard, defaultCard]],
    [[defaultCard, makeCard(Rank['Two'])]],
    [[makeCard(Rank['BlackJoker']), makeCard(Rank['BlackJoker'])]],
  ])('should fail to parse a double', (cards: Card[]) => {
    const result = parseDouble(cards);

    expect(result).toBe(0);
  });

  it.each([
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Seven']),
      ],
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Seven']),
        makeCard(Rank['Eight']),
        makeCard(Rank['Nine']),
        makeCard(Rank['Ten']),
        makeCard(Rank['Jack']),
        makeCard(Rank['Queen']),
        makeCard(Rank['King']),
        makeCard(Rank['Ace']),
      ],
    ],
  ])('should parse a straight', (cards: Card[]) => {
    const result = parseStraight(cards, cards.length);

    expect(result).toBe(cards[cards.length - 1].rank);
  });

  it.each([
    [[], 0],
    [[defaultCard], 1],
    [[defaultCard, defaultCard, defaultCard, defaultCard, defaultCard], 5],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Eight']),
      ],
      5,
    ],
    [
      [
        makeCard(Rank['Ace']),
        makeCard(Rank['King']),
        makeCard(Rank['Queen']),
        makeCard(Rank['Jack']),
        makeCard(Rank['Ten']),
      ],
      5,
    ],
    [
      [
        makeCard(Rank['Jack']),
        makeCard(Rank['Queen']),
        makeCard(Rank['King']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Two']),
      ],
      5,
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Seven']),
      ],
      4,
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Seven']),
      ],
      7,
    ],
  ])('should fail to parse a straight', (cards: Card[], length: number) => {
    const result = parseStraight(cards, length);

    expect(result).toBe(0);
  });

  it.each([
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
      ],
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Seven']),
        makeCard(Rank['Seven']),
        makeCard(Rank['Eight']),
        makeCard(Rank['Eight']),
        makeCard(Rank['Nine']),
        makeCard(Rank['Nine']),
        makeCard(Rank['Ten']),
        makeCard(Rank['Ten']),
        makeCard(Rank['Jack']),
        makeCard(Rank['Jack']),
        makeCard(Rank['Queen']),
        makeCard(Rank['Queen']),
        makeCard(Rank['King']),
        makeCard(Rank['King']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
      ],
    ],
  ])('should parse a rolling bucket', (cards: Card[]) => {
    const result = parseRollingBucket(cards, cards.length / 2);

    expect(result).toBe(cards[cards.length - 1].rank);
  });

  it.each([
    [[], 0],
    [[defaultCard], 1],
    [[defaultCard, defaultCard, defaultCard, defaultCard, defaultCard, defaultCard], 3],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
      ],
      3,
    ],
    [
      [
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
      ],
      3,
    ],
    [
      [
        makeCard(Rank['King']),
        makeCard(Rank['King']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
      ],
      3,
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
      ],
      2,
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
      ],
      4,
    ],
  ])('should fail to parse a rolling bucket', (cards: Card[], length: number) => {
    const result = parseRollingBucket(cards, length);

    expect(result).toBe(0);
  });

  it.each([
    [
      [makeCard(Rank['Three']), makeCard(Rank['Three']), makeCard(Rank['Three']), makeCard(Rank['Four'])],
      1,
      Rank['Three'],
    ],
    [
      [makeCard(Rank['Two']), makeCard(Rank['Two']), makeCard(Rank['Two']), makeCard(Rank['ColourJoker'])],
      1,
      Rank['Two'],
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['King']),
        makeCard(Rank['King']),
        makeCard(Rank['King']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
      ],
      2,
      Rank['Ace'],
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Two']),
      ],
      3,
      Rank['Six'],
    ],
  ])('should parse a single passenger airplane', (cards: Card[], length: number, value: number) => {
    const result = parseAirplaneSinglePassenger(cards, length);

    expect(result).toBe(value);
  });

  it.each([
    [[], 0],
    [[defaultCard], 1],
    [[defaultCard, defaultCard, defaultCard, defaultCard], 1],
    [
      [
        makeCard(Rank['BlackJoker']),
        makeCard(Rank['BlackJoker']),
        makeCard(Rank['BlackJoker']),
        makeCard(Rank['Four']),
      ],
      1,
    ],
    [[makeCard(Rank['Three']), makeCard(Rank['Three']), makeCard(Rank['Three']), makeCard(Rank['Four'])], 0],
    [[makeCard(Rank['Three']), makeCard(Rank['Three']), makeCard(Rank['Three']), makeCard(Rank['Four'])], 2],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Seven']),
        makeCard(Rank['Eight']),
      ],
      1,
    ],
    [
      [
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['King']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Two']),
      ],
      3,
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Two']),
      ],
      3,
    ],
    [
      [
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
      ],
      2,
    ],
  ])('should fail to parse a single passenger airplane', (cards: Card[], length: number) => {
    const result = parseAirplaneSinglePassenger(cards, length);

    expect(result).toBe(0);
  });

  it.each([
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
      ],
      1,
      Rank['Three'],
    ],
    [
      [
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
        makeCard(Rank['BlackJoker']),
        makeCard(Rank['BlackJoker']),
      ],
      1,
      Rank['Two'],
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['King']),
        makeCard(Rank['King']),
        makeCard(Rank['King']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
      ],
      2,
      Rank['Ace'],
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
      ],
      3,
      Rank['Six'],
    ],
  ])('should parse a double passenger airplane', (cards: Card[], length: number, value: number) => {
    const result = parseAirplaneDoublePassenger(cards, length);

    expect(result).toBe(value);
  });

  it.each([
    [[], 0],
    [[defaultCard], 1],
    [[defaultCard, defaultCard, defaultCard, defaultCard, defaultCard], 1],
    [
      [
        makeCard(Rank['BlackJoker']),
        makeCard(Rank['BlackJoker']),
        makeCard(Rank['BlackJoker']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
      ],
      1,
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
      ],
      0,
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
      ],
      2,
    ],
    [
      [
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['King']),
        makeCard(Rank['King']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
      ],
      3,
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
      ],
      3,
    ],
    [
      [
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Ace']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
      ],
      2,
    ],
  ])('should fail to parse a double passenger airplane', (cards: Card[], length: number) => {
    const result = parseAirplaneDoublePassenger(cards, length);

    expect(result).toBe(0);
  });

  it.each([
    [[defaultCard, defaultCard, defaultCard, defaultCard]],
    [[defaultCard, defaultCard, defaultCard, defaultCard, defaultCard, defaultCard, defaultCard, defaultCard]],
    [
      [
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
        makeCard(Rank['Two']),
      ],
    ],
  ])('should parse a bomb', (cards: Card[]) => {
    const result = parseBomb(cards);

    expect(result).toBe(cards[0].rank);
  });

  it.each([
    [[]],
    [[defaultCard, defaultCard, defaultCard]],
    [[makeCard(Rank['Ace']), makeCard(Rank['Ace']), makeCard(Rank['Ace']), makeCard(Rank['Two'])]],
    [
      [
        makeCard(Rank['BlackJoker']),
        makeCard(Rank['BlackJoker']),
        makeCard(Rank['BlackJoker']),
        makeCard(Rank['BlackJoker']),
      ],
    ],
    [
      [
        makeCard(Rank['ColourJoker']),
        makeCard(Rank['ColourJoker']),
        makeCard(Rank['ColourJoker']),
        makeCard(Rank['ColourJoker']),
      ],
    ],
  ])('should fail to parse a bomb', (cards: Card[]) => {
    const result = parseBomb(cards);

    expect(result).toBe(0);
  });

  it.each([
    [[makeCard(Rank['BlackJoker']), makeCard(Rank['BlackJoker'])], 1],
    [[makeCard(Rank['BlackJoker']), makeCard(Rank['ColourJoker'])], 2],
    [[makeCard(Rank['ColourJoker']), makeCard(Rank['ColourJoker'])], 3],
  ])('should parse a nuke', (cards: Card[], value: number) => {
    const result = parseNuke(cards);

    expect(result).toBe(value);
  });

  it.each([
    [[]],
    [[defaultCard, defaultCard]],
    [[defaultCard, makeCard(Rank['BlackJoker'])]],
    [[defaultCard, makeCard(Rank['BlackJoker']), makeCard(Rank['BlackJoker'])]],
  ])('should fail to parse a nuke', (cards: Card[]) => {
    const result = parseNuke(cards);

    expect(result).toBe(0);
  });

  it.each<[Card[], HandType, number, number]>([
    [[defaultCard], 'Single', defaultRank, 1],
    [[defaultCard, defaultCard], 'Double', defaultRank, 2],
    [
      [
        makeCard(Rank['Seven']),
        makeCard(Rank['Eight']),
        makeCard(Rank['Nine']),
        makeCard(Rank['Ten']),
        makeCard(Rank['Jack']),
        makeCard(Rank['Queen']),
        makeCard(Rank['King']),
      ],
      'Straight',
      Rank['King'],
      7,
    ],
    [
      [
        makeCard(Rank['Three']),
        makeCard(Rank['Three']),
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Five']),
        makeCard(Rank['Five']),
      ],
      'Rolling Bucket',
      Rank['Five'],
      3,
    ],
    [
      [makeCard(Rank['Three']), makeCard(Rank['Three']), makeCard(Rank['Three']), makeCard(Rank['ColourJoker'])],
      'Airplane Single Passenger',
      Rank['Three'],
      1,
    ],
    [
      [
        makeCard(Rank['Four']),
        makeCard(Rank['Four']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Six']),
        makeCard(Rank['Seven']),
        makeCard(Rank['Seven']),
        makeCard(Rank['Seven']),
        makeCard(Rank['Eight']),
        makeCard(Rank['Eight']),
      ],
      'Airplane Double Passenger',
      Rank['Seven'],
      2,
    ],
    [[defaultCard, defaultCard, defaultCard, defaultCard], 'Bomb', defaultRank, 4],
    [[makeCard(Rank['BlackJoker']), makeCard(Rank['ColourJoker'])], 'Nuke', 2, 2],
    [[], 'None', 0, 0],
    [[makeCard(Rank['Three']), makeCard(Rank['Three']), makeCard(Rank['Four']), makeCard(Rank['Four'])], 'None', 0, 0],
  ])('should parse a hand', (cards: Card[], type: HandType, value: number, length: number) => {
    const result = parseHand(cards);

    expect(result).toStrictEqual(expect.objectContaining({ type, value, length, cards }));
  });
});
