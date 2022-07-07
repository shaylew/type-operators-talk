import { AssertFalse, AssertSubtype, IsSubtype } from './subtyping'

export interface StringOptions {
  maxLength?: number
}

export interface NumberOptions {
  min?: number
  max?: number
  integerOnly?: boolean
}

export type OptionsFor<T> = T extends string
  ? StringOptions
  : T extends number
    ? NumberOptions
    : never

type Ex1 = OptionsFor<string> // Evaluates to StringOptiosn
type Ex2 = OptionsFor<number> // Evaluates to NumberOptions

// What about OptionsFor<string | number>? Let's run through it.
type Hmm1 = AssertFalse<IsSubtype<string, string | number>>
type Hmm2 = AssertFalse<IsSubtype<number, string | number>>

// Well, looks like it doesn't extend either "string" or "number", so it should
// skip both branches and come out to "never" -- right?
type Ex3 = OptionsFor<string | number>

// But mouseover Ex3 and it seems to take *both* branches!

// This is called a "distributive conditional type", and it's triggered by a
// generic type definition with a "bare" type parameter on the left side of
// "extends". When a generic type G distributes, TS transforms G<X | Y> into
// G<X> | G<Y> whenever it can.

// Changes 'A' into 'B', and distributes.
type ChangeAToB<T> = T extends 'A' ? 'B' : T
type Ex4A = ChangeAToB<'A'> // Changes 'A'
type Ex4B = ChangeAToB<'C'> // Leaves 'C' the same
type Ex4C = ChangeAToB<'A' | 'C'> // Changes 'A' | 'C' in to 'B' | 'C'

// Returns an object with one field of the given type, but turns 'A' into 'B'.
// This one doesn't distribute because the LHS of the extends is a compound.
type DoesntDistribute<T> = { field: T } extends { field: 'A' }
  ? { field: 'B' }
  : { field: T }
type Ex5A = DoesntDistribute<'A'> // Changes it when it's exactly 'A'
type Ex5B = DoesntDistribute<'C'> // Leaves it the same if it's 'C'
type Ex5C = DoesntDistribute<'A' | 'C'> // Leaves it the same if it's 'A' | 'C'

// Returns an object with one field of the given type, but turns 'A' into 'B'.
// This one doesn't distribute (it doesn't even have an extends in it), but
// it passes T to another conditional type that _does_ distribute.
type CallDistributes<T> = { field: ChangeAToB<T> }
type Ex6A = CallDistributes<'A'> // Changes the field when it's 'A'
type Ex6B = CallDistributes<'C'> // Leaves it the same when it's 'C'
type Ex6C = CallDistributes<'A' | 'C'> // Changes 'A' | 'C' into 'B' | 'C'
