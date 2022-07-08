import { string } from './validation_fancy/validators'

// Example interface to run these mapped types over.
interface Example {
  a: number
  b: {
    c: string
  }
  optional?: number
}

/*
 * Simple mapped type.
 */

// Union null with every field.
export type AllowNull<T> = {
  [K in keyof T]: T[K] | null
}

type Ex1 = AllowNull<Example>

/*
 * Changing modifiers on fields.
 */

// Make all keys optional and readonly.
export type MakeOptionalReadonly<T> = {
  +readonly [K in keyof T]+?: T[K]
}

type Ex2 = MakeOptionalReadonly<Example>

/*
 * Using `as` to rename keys.
 */

// Throw away all the keys that don't have numbers as their value, by
// renaming the key to never.
export type NumbersOnly<T> = {
  [K in keyof T as T[K] extends number ? K : never]: T[K]
}

type Ex3 = NumbersOnly<Example>
// Note that Ex2 doesn't include the optional key, because Example['optional']
// is number | undefined which doesn't extend plain number.

// Make all keys uppercase.
export type UppercaseAll<T> = {
  // Uppercase, Lowercase, and Capitalize are built-in types with one parameter,
  // which has to extend string.
  [K in keyof T as K extends string ? Uppercase<K> : K]: T[K]
}
type Ex4 = UppercaseAll<Example>

// Getting fancier with mapped types.

// The goal here is to come up with a `pick` function that can take an object,
// an array of keys, and give you back the array of the object's values at those
// keys.

// The tricky part is getting the return type specific enough that if you know
// the keys statically, you also know the type of the returned array!

const example = {
  a: 'hello',
  b: 100,
  c: true
}

// First try:
function pick<T> (obj: T, keys: Array<keyof T>): Array<T[keyof T]> {
  return keys.map((k) => obj[k])
}

// hmm, a very vague return type.
const picked = pick(example, ['a'])

// So let's try again:
function pick2<T, K extends keyof T> (obj: T, keys: K[]): Array<T[K]> {
  return keys.map((k) => obj[k])
}

// starting to look better...
const picked2 = pick2(example, ['a'])
// ... but it doesn't know the number/order of keys.
const [pickedA2, pickedB2] = pick2(example, ['a', 'b'])

type Picked<T, P extends ReadonlyArray<keyof T>> = {
  [I in keyof P]: T[P[I]]
}

function pick3<T, P extends ReadonlyArray<keyof T>> (
  obj: T,
  keys: P
): Picked<T, P> {
  const res: unknown[] = []
  keys.forEach((k) => {
    res.push(obj[k])
  })
  return res as unknown as Picked<T, P>
}

const [pickedA3, pickedB3] = pick3(example, ['a', 'b'] as const)
