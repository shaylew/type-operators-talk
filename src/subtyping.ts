export type AssertSubtype<A, B extends A> = B

export type IsSubtype<A, B> = [B] extends [A] ? true : false

export type DoCompare<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? 'equals'
    : 'subtype'
  : [B] extends [A]
    ? 'supertype'
    : 'incomparable'

export type Compare<A, B> = [A, DoCompare<A, B>, B]

/** Cause a type error if the type parameter isn't true. */
export type Assert<T extends true> = true

/** Cause a type error if the type parameter isn't false. */
export type AssertFalse<T extends false> = false

export type AssertCompare<A, B, Answer extends DoCompare<A, B>> = Compare<A, B>

export function isAssignable<T> (x: T): T {
  return x
}

export type Check1 = AssertSubtype<unknown, number>
export type Check2 = AssertSubtype<number, unknown>

// undefined is a subtype of ("is more specific than") void, but not the other
// way around.
export type V1 = AssertSubtype<void, undefined>
export type V2 = AssertSubtype<() => void, () => string>
export type V3 = AssertSubtype<() => string, () => void>

type C1 = Compare<unknown, string>
type C2 = Compare<string, unknown>

type _1 = AssertCompare<() => void, () => string, 'supertype'>
