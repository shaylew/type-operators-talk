import { Assert, AssertSubtype, isAssignable } from './subtyping'

// ***
// *** unknown
// ***

// `unknown` is the "top type" in the subtyping hierarchy. That means:
// - it's the "least specific" type; anything is assignable to it.
// - knowing something has type unknown doesn't tell you anything about it.
// - `T & unknown` is just T -- you didn't learn anything new.
// - `unknown | T` is unknown -- it still might be anything.

// You can think of unknown as being:
// - the "empty intersection": if you have 0 requirements, unknown meets them.
// - the "union of everything": if all values are allowed, that's an unknown.

// Everything is assignable to unknown.
isAssignable<unknown>('hi')
isAssignable<unknown>(undefined)
isAssignable<unknown>(console.log)

// But a variable of type unknown isn't assignable to any other type, no matter
// what its value "might" be at runtime.
const x: unknown = 'hi'

// An error -- can't assign unknown to string.
isAssignable<string>(x)

// You can learn new things about a variable of unknown type, and narrow the
// type down.
if (typeof x === 'number') {
  isAssignable<number>(x)
}

// ***
// *** never
// ***

// `never` is the "bottom type" in the subtyping hierarchy. That means:
// - it's the "most specific" type; it's assignable to anything.
// - nothing is assignable to never, so you can't actually get one at runtime.
// - `T & never` is never -- never is already everything at once.
// - `T | never` is just T -- it'll never be never, so it'll always just be T.

// You can think of never as being:
// - the "intersection of everything": never meets all possible requirements.
// - the "empty union": if you have 0 allowed values, never is the only option.

// A function can have a return type of never if it never returns.
function throws (): never {
  throw new Error('instead of returning never, I just gave up')
}

// never is assignable to any type.
isAssignable<string>(throws())

function tagNumber (tag: 'a' | 'b'): 1 | 2 {
  switch (tag) {
    case 'a':
      return 1
    case 'b':
      return 2
    default:
      // Each branch removes a possible value from the union type, so once
      // you've dealt with them all you're left with never.
      isAssignable<never>(tag)

      // Even though the types say this branch is impossible, if you include the
      // default branch TS will require you to either return something or throw.

      // Any one of these makes the function's type okay (try uncommenting!):
      // return tag        // -- it's never, so it's assignable to 1 | 2
      // throw new Error() // -- it throws, so it doesn't return
      // throws()          // -- it returns never, so TS knows it never returns
      // impossible(tag, 'tagNumber: invalid tag specified')
      break
  }
}

/**
 * Useful utility for working with code that the type system says is
 * unreachable, but which might happen at runtime if someone subverts the type
 * system with `any` or `as`. You have to pass in a `never` to prove it's
 * supposed to be impossible, but you also have a helpful message if it happens
 * somehow anyway.
 */
function impossible (why: never, message = 'The "impossible" happened'): never {
  throw new Error(message)
}

// ***
// *** void
// ***

// Mostly for defining callbacks, where the return value won't be used for
// anything but it's not illegal to return something from it.
//
// It's a supertype of ("more general than") undefined... but it doesn't have
// any extra values, undefined is still the only one.
type UndefinedExtendsVoid = AssertSubtype<void, undefined>
isAssignable<void>(undefined)

// The one way in which it's more general than undefined: you can use a function
// that returns anything as if it was a function that returns void. An expected
// return type of void lets you return whatever.
isAssignable<() => void>(() => 'hi')
// An expected return type of undefined wants undefined exactly.
isAssignable<() => undefined>(() => 'hi')

// void only has this effect in function return types, though!
isAssignable<void>('hi')

// Historical note: `void` predates `unknown` and these days you could also do
// 99% of the things void is used for with unknown. The difference is that
// unknown is (much) more general than void, and cna have useful values in it.
// So on top of being shorter, if you say you want a callback returning void
// you're being more explicit about the fact that you really won't try to use
// the returned value.
isAssignable<() => unknown>(() => 'hi')
isAssignable<() => unknown>(() => {
  /* empty */
})
