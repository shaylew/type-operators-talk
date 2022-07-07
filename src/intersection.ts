import { Compare } from './subtyping'

// ***
// *** Intersection
// ***

// Intersection -- the & operator -- says: "both these things must be true." It
// combines two types into one type that's more specific (a subtype of) both.

// It's the "most general subtype" or the "greatest lower bound"

interface Labeled {
  label: string
}

interface Scored {
  score: number
}

// The intersection of object types has the fields from both.
export type LabeledAndScored = Labeled & Scored
export type L = Compare<LabeledAndScored, { label: string; score: number }>
const rating: LabeledAndScored = { label: 'cats', score: Infinity }

// If one type is already a subtype of the other, the intersection is just the
// more specific one.
export type N = 'N' & string
export type WithN = { N: string } & { N: 'N' }
// TS doesn't always like to reduce unions eagerly, because it can lead to worse
// error messages. So let's make sure that last one was what we expect:
export type M = Compare<WithN, { N: 'N' }>

// ***
// *** Intersection & unions
// ***

export interface Essay {
  tag: 'Essay'
  prompt: string
  rubric: Record<string, string[]>
}

export interface MultipleChoice {
  tag: 'MultipleChoice'
  choices: string[]
  correctChoice: string
}

export type Question = Essay | MultipleChoice

// Intersecting two incompatible types gets you `never`. In this case, they're
// incompatible because the tag is two different string literal types.
export type C = Essay & MultipleChoice

// Intersecting something that's only compatible with some piece of the union
// "narrows" the union to just the compatible parts.
export type A = Compare<Question & { tag: 'Essay' }, Essay>
export type B = Compare<Question & { tag: 'MultipleChoice' }, MultipleChoice>

// In fact, intersection "distributes over" union:
export type Nullish = undefined | null
export type Falsy = undefined | null | false | '' | 0
export type Prim = string | number | boolean

// So you can & a union of literals and a general type to get just the literals
// of that type...
export type F = Falsy & boolean
export type Z = Falsy & number

// And you can & two unions to intersect their possible values.
export type FalsyButNotNullish = Falsy & Prim
