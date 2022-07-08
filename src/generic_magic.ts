export type Num = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
export type Face = 'A' | 'J' | 'Q' | 'K'

export type Suit = 'Spades' | 'Hearts' | 'Clubs' | 'Diamonds'
export type Rank = Num | Face
export type Card = [Rank, Suit]

const jackOfSpades: ['J', 'Spades'] = ['J', 'Spades']
const queenOfHearts: ['Q', 'Hearts'] = ['Q', 'Hearts']

/**
 * You:
 * - Give me a card.
 *
 * I'll:
 * - Give you a card.
 *
 * The audience can check:
 * - They're both cards.
 */
function trade (card: Card): Card {
  return queenOfHearts
}

const traded1 = trade(jackOfSpades)

/**
 * You:
 * - Pick a card and show the audience.
 * - Give me that card.
 *
 * I'll:
 * - Give you a card.
 *
 * The audience can check:
 * - The card you gave me was the one you showed.
 * - I gave you back a card.
 *
 * Showing the audience the card didn't constrain me in any way -- they still
 * can only check that I gave you back a card!
 */
function pedanticTrade<C extends Card> (card: C): Card {
  return trade(card)
}

// All just of type Card, no matter what you pass or what you tell the audience.
const pedantic1 = pedanticTrade(jackOfSpades)
const pedantic2 = pedanticTrade(queenOfHearts)
const pedantic3 = pedanticTrade<['Q', Suit]>(queenOfHearts)
// The only new thing the audience can check is that you actually gave me the
// card you showed them.
const pedantic4 = pedanticTrade<typeof queenOfHearts>(jackOfSpades)

/**
 * You:
 * - Pick a card, and show the audience.
 * - Give me that card.
 *
 * I'll:
 * - Give you back a card matching that description.
 *
 * The audience can check:
 * - The card I gave back matches the card you showed them.
 */
function boomerang<C extends Card> (card: C): C {
  return card
}

// You can explicitly describe the card to the audience, if you like.
const back0 = boomerang<['J', 'Spades']>(jackOfSpades)
// You can leave out the "describe it to the audience" step, and TS will pick
// the most specific description it can.
const back1 = boomerang(jackOfSpades)
// You can wave the card around and keep the audience from getting a very good
// look at it, if you like -- all the contract says is it has to be a Card.
const back2 = boomerang<[Rank, 'Spades']>(jackOfSpades)
const back3 = boomerang<Card>(jackOfSpades)

/**
 *  You:
 * - Pick a suit, and tell the audience.
 * - Give me a card with that suit.
 *
 * I'll:
 * - Give you an Ace in that suit.
 *
 * The audience can check:
 * - You gave me a card that matches the suit you told them.
 * - I gave you an Ace in that same suit.
 */
function tradeUp<S extends Suit> (yours: [Rank, S]): ['A', S] {
  const suit = yours[1]
  return ['A', suit]
}

// You:
// - Pick one or more cards. Describe them to the audience, if you like.
// - Give me all the cards.
// I'll:
// - Give you back a card
// - I promise it'll match one of the cards you gave me.
function draw<D extends [Card, ...Card[]]> (deck: D): D[number] {
  return deck[deck.length - 1]
}

// Return type says it's one of those two.
const drawn = draw([queenOfHearts, jackOfSpades])

function drawFirst<D extends [Card, ...Card[]]> (deck: D): D[0] {
  return deck[0]
}

// Return type says it's specifically the queen of hearts.
const drawnFirst = drawFirst([queenOfHearts, jackOfSpades])

// You:
// - Name a card to the audience.
//
// I'll:
// - Stare into your soul, then pull out that card.
function magic<C extends Card> (): C {
  // Try as you might, you won't be able to hold up your end of this contract.
  // You can make it typecheck if you vanish in a puff of smoke, though.
  throw new Error('I give up')
}

// You:
// - Name a card to the audience.
//
// I'll:
// - Give you a stack of 0 or more copies of that card.
// - I actually sealed the stack in a box before you even picked it!
// - Spooky, huh?
// - (Well, maybe not...)
function emptyPromise<C extends Card> (): C[] {
  return []
}
