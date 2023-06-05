import { Card, Rank, Suit } from '../deck';
import { Game, GameState, PossiblePlayers } from './game';
import { Hand } from '../util/parse-hand';

describe('game', () => {
  it('should be properly initilized', () => {
    const game = new Game(3);

    expect(game.deck.cards.length).toBe(54);
    expect(game.gameState.newRound).toBe(true);
    expect(game.gameState.turn).toBe(game.landlord);
    expect(game.gameState.previousPlayer).toBe(-1);
    expect(game.gameState.previousHandPlayed.type).toBe('None');
    expect(game.winner).toBe(-1);
    expect(
      game.playerCards[game.landlord].filter(
        (card) => card.rank === game.landlordCard.rank && card.suit === game.landlordCard.suit
      ).length
    ).toBe(1);
  });

  it('should use a double deck when there are more than 3 players', () => {
    const game = new Game(6);

    expect(game.deck.cards.length).toBe(108);
  });

  it.each([
    [2, 27, 27],
    [3, 17, 20],
    [4, 27, 27],
    [5, 21, 24],
    [6, 17, 23],
  ])(
    'should deal the appropriate amount of cards based on the amount of players',
    (numPlayers: PossiblePlayers, normalCards: number, landlordCards: number) => {
      const game = new Game(numPlayers);

      expect(game.numPlayers).toBe(numPlayers);
      expect(game.playerCards.length).toBe(numPlayers);
      for (let i = 0; i < numPlayers; ++i) {
        if (i === game.landlord) {
          expect(game.playerCards[i].length).toBe(landlordCards);
        } else {
          expect(game.playerCards[i].length).toBe(normalCards);
        }
      }
    }
  );

  describe('gameplay', () => {
    let game: Game;
    let prevGameState: GameState;

    const generateGame = (gameStateOptions: Partial<GameState & Hand>) => {
      game = new Game(3);

      prevGameState = {
        turn: gameStateOptions.turn ?? game.gameState.turn,
        previousPlayer: gameStateOptions.previousPlayer ?? game.gameState.previousPlayer,
        newRound: gameStateOptions.newRound ?? false,
        previousHandPlayed: {
          type: gameStateOptions.type ?? game.gameState.previousHandPlayed.type,
          value: gameStateOptions.value ?? game.gameState.previousHandPlayed.value,
          length: gameStateOptions.length ?? game.gameState.previousHandPlayed.length,
          cards: gameStateOptions.cards ?? game.gameState.previousHandPlayed.cards,
        },
      };

      game.gameState = prevGameState;
    };

    it('should update the game state when a hand is played', () => {
      generateGame({ turn: 0, newRound: true });

      const hand: Card[] = [{ rank: Rank['Ace'], suit: Suit['Diamonds'] }];
      const success = game.playHand(hand);

      expect(success).toBe(true);
      expect(game.gameState).toStrictEqual(
        expect.objectContaining({
          turn: 1,
          previousPlayer: 0,
          newRound: false,
          previousHandPlayed: {
            type: 'Single',
            value: Rank['Ace'],
            length: 1,
            cards: hand,
          },
        })
      );
    });

    it('should not allow an invalid hand to be played', () => {
      generateGame({});

      const hand: Card[] = [
        { rank: Rank['Ace'], suit: Suit['Diamonds'] },
        { rank: Rank['ColourJoker'], suit: Suit['None'] },
      ];
      const success = game.playHand(hand);

      expect(success).toBe(false);
      expect(game.gameState).toStrictEqual(prevGameState);
    });

    it('should allow a hand of higher value to be played', () => {
      generateGame({ turn: 0, type: 'Single', value: Rank['Three'], length: 1 });

      const hand: Card[] = [{ rank: Rank['Ace'], suit: Suit['Diamonds'] }];
      const success = game.playHand(hand);

      expect(success).toBe(true);
      expect(game.gameState).toStrictEqual(
        expect.objectContaining({
          turn: 1,
          previousPlayer: 0,
          newRound: false,
          previousHandPlayed: {
            type: 'Single',
            value: Rank['Ace'],
            length: 1,
            cards: hand,
          },
        })
      );
    });

    it('should not allow a hand of lower or equal value to be played', () => {
      generateGame({ type: 'Single', value: Rank['Three'] });

      const hand: Card[] = [{ rank: Rank['Three'], suit: Suit['Spades'] }];
      const success = game.playHand(hand);

      expect(success).toBe(false);
      expect(game.gameState).toStrictEqual(prevGameState);
    });

    it('should not allow a different type of hand to be played than the type previously played', () => {
      generateGame({ type: 'Airplane Double Passenger' });

      const hand: Card[] = [{ rank: Rank['Ace'], suit: Suit['Diamonds'] }];
      const success = game.playHand(hand);

      expect(success).toBe(false);
      expect(game.gameState).toStrictEqual(prevGameState);
    });

    it('should allow a bomb to be played on a lower type of hand', () => {
      generateGame({ turn: 0, type: 'Straight', value: Rank['Three'] });

      const card: Card = { rank: Rank['Ace'], suit: Suit['Diamonds'] };
      const hand: Card[] = [card, card, card, card, card];
      const success = game.playHand(hand);

      expect(success).toBe(true);
      expect(game.gameState).toStrictEqual(
        expect.objectContaining({
          turn: 1,
          previousPlayer: 0,
          newRound: false,
          previousHandPlayed: {
            type: 'Bomb',
            value: Rank['Ace'],
            length: 5,
            cards: hand,
          },
        })
      );
    });

    it('should allow a bigger bomb to be played on a smaller bomb', () => {
      generateGame({ turn: 0, type: 'Bomb', value: Rank['Ten'], length: 4 });

      const card: Card = { rank: Rank['Three'], suit: Suit['Diamonds'] };
      const hand: Card[] = [card, card, card, card, card];
      const success = game.playHand(hand);

      expect(success).toBe(true);
      expect(game.gameState).toStrictEqual(
        expect.objectContaining({
          turn: 1,
          previousPlayer: 0,
          newRound: false,
          previousHandPlayed: {
            type: 'Bomb',
            value: Rank['Three'],
            length: 5,
            cards: hand,
          },
        })
      );
    });

    it('should allow a nuke to be played on any lower type of hand', () => {
      generateGame({ turn: 0, type: 'Bomb', value: Rank['Six'] });

      const hand: Card[] = [
        { rank: Rank['ColourJoker'], suit: Suit['None'] },
        { rank: Rank['ColourJoker'], suit: Suit['None'] },
      ];
      const success = game.playHand(hand);

      expect(success).toBe(true);
      expect(game.gameState).toStrictEqual(
        expect.objectContaining({
          turn: 1,
          previousPlayer: 0,
          newRound: false,
          previousHandPlayed: {
            type: 'Nuke',
            value: 3,
            length: 2,
            cards: hand,
          },
        })
      );
    });

    it('should allow a bigger nuke to be played on a smaller nuke', () => {
      generateGame({ turn: 0, type: 'Nuke', value: 1, length: 2 });

      const hand: Card[] = [
        { rank: Rank['BlackJoker'], suit: Suit['None'] },
        { rank: Rank['ColourJoker'], suit: Suit['None'] },
      ];
      const success = game.playHand(hand);

      expect(success).toBe(true);
      expect(game.gameState).toStrictEqual(
        expect.objectContaining({
          turn: 1,
          previousPlayer: 0,
          newRound: false,
          previousHandPlayed: {
            type: 'Nuke',
            value: 2,
            length: 2,
            cards: hand,
          },
        })
      );
    });

    it('should not allow a player to play cards that they do not have', () => {
      generateGame({ turn: 0 });

      const success = game.playHand([game.playerCards[1][1]]);

      expect(success).toBe(false);
      expect(game.gameState).toStrictEqual(prevGameState);
    });

    it('should remove cards from a players hand once played', () => {
      generateGame({ turn: 0 });
      game.landlord = 0;

      const someCard: Card = { rank: Rank['Three'], suit: Suit['Clubs'] };
      const anotherCard: Card = { rank: Rank['Seven'], suit: Suit['Clubs'] };
      game.playerCards[0] = [someCard, someCard, anotherCard, anotherCard, someCard, someCard, anotherCard];
      const success = game.playHand([someCard, someCard, someCard, someCard]);

      expect(success).toBe(true);
      expect(game.playerCards[0].length).toBe(3);
      expect(game.playerCards[0]).toStrictEqual(expect.arrayContaining([anotherCard, anotherCard, anotherCard]));
    });

    it('should update the winner when a player has no cards', () => {
      generateGame({ turn: 0, newRound: true });

      const hand: Card[] = [{ rank: Rank['Ten'], suit: Suit['Clubs'] }];
      game.playerCards[0] = hand;
      const success = game.playHand(hand);

      expect(success).toBe(true);
      expect(game.winner).toBe(0);
    });
  });
});
