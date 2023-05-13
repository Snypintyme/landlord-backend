import { Deck } from './deck';
import { Rank, Suit } from './card';

describe('deck', () => {
  it('should fill the deck', () => {
    const deck = new Deck(false);

    expect(deck.cards.length).toBe(54);
    expect(deck.cards[0]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['Three'],
        suit: Suit['Diamonds'],
      })
    );
    expect(deck.cards[3]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['Three'],
        suit: Suit['Spades'],
      })
    );
    expect(deck.cards[4]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['Four'],
        suit: Suit['Diamonds'],
      })
    );
    expect(deck.cards[52]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['BlackJoker'],
        suit: Suit['None'],
      })
    );
    expect(deck.cards[53]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['ColourJoker'],
        suit: Suit['None'],
      })
    );
  });

  it('should fill a double deck', () => {
    const deck = new Deck(true);

    expect(deck.cards.length).toBe(108);
    expect(deck.cards[0]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['Three'],
        suit: Suit['Diamonds'],
      })
    );
    expect(deck.cards[54]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['Three'],
        suit: Suit['Diamonds'],
      })
    );
    expect(deck.cards[107]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['ColourJoker'],
        suit: Suit['None'],
      })
    );
  });

  it('should clear the deck', () => {
    const deck = new Deck(false);
    deck.clearDeck();

    expect(deck.cards.length).toBe(0);
  });

  it('should fill the deck', () => {
    const deck = new Deck(false);
    deck.clearDeck();
    deck.fillDeck();

    expect(deck.cards.length).toBe(54);
    expect(deck.cards[0]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['Three'],
        suit: Suit['Diamonds'],
      })
    );
    expect(deck.cards[3]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['Three'],
        suit: Suit['Spades'],
      })
    );
    expect(deck.cards[4]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['Four'],
        suit: Suit['Diamonds'],
      })
    );
    expect(deck.cards[52]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['BlackJoker'],
        suit: Suit['None'],
      })
    );
    expect(deck.cards[53]).toStrictEqual(
      expect.objectContaining({
        rank: Rank['ColourJoker'],
        suit: Suit['None'],
      })
    );
  });

  it('should shuffle the deck', () => {
    const normalDeck = new Deck(false);
    const shuffledDeck = new Deck(false);
    shuffledDeck.shuffleDeck();

    expect(shuffledDeck).not.toStrictEqual(expect.objectContaining(normalDeck));
  });
});
