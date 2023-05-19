export enum Rank {
  Three = 1,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
  Ace,
  Two,
  BlackJoker,
  ColourJoker,
}

export enum Suit {
  Diamonds = 1,
  Clubs,
  Hearts,
  Spades,
  None,
}

export interface Card {
  rank: Rank;
  suit: Suit;
}
