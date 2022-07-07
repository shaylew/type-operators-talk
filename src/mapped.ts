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
