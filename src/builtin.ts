// https://www.typescriptlang.org/docs/handbook/utility-types.html

// Examples of the common TS utility types. Mouse over each type to see what it
// evaluates to on the example interface.

export interface Interface {
  a: string
  b?: number
  c: boolean
}

// ***
// *** Records
// ***

/** Partial makes all fields optional. */
export type PartialEx = Partial<Interface>

/** Required makes all fields mandatory. */
export type RequiredEx = Required<Interface>

/** Pick<T, U> keeps just the entries from T whose keys are in the union U. */
export type PickEx = Pick<Interface, 'a' | 'b'>

/** Omit<T, U> leaves out the entries from T whose keys are in the union U. */
export type OmitEx = Omit<Interface, 'b' | 'c'>

// ***
// *** Unions
// ***

export type Union = 'a' | 'b' | 'c' | undefined | number

/** Extract<T, U> keeps just the part of the union T that's assignable to U. */
export type ExtractEx = Extract<Union, string>

/** Exclude<T, U> removes the part of the union T that's assignable to U. */
export type ExcludeEx = Exclude<Union, string>

/** NonNullable<T> removes null and undefined from a union. */
export type NonNullableEx = NonNullable<Union>

// ***
// *** Functions
// ***

function fun (name: string, info: unknown): void {
  console.log(name, info)
}

/** Parameters gives back a (tuple) type for the parameters of a function. */
export type ParametersEx = Parameters<typeof fun>

/** ReturnType gives back the type that a function type returns. */
export type ReturnEx = ReturnType<typeof fun>

// * Strings: Uppercase, Lowercase, Capitalize, & Uncapitalize
