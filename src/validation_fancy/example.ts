import * as V from './validators'

// An example of using the validators defined in this directory.

interface Example {
  count: number
  name: string
  objects: Array<{
    field: string
    otherField?: number
  }>
}

// You don't actually have to pass Example explicitly as a type parameter, but
// in this case it helps get better error messages if you
export const checkExample = V.record<Example>({
  count: V.number, // try leaving this out!
  name: V.string, // try making this the wrong type
  // try making this optional
  objects: V.array(
    V.record({
      field: V.string,
      otherField: V.optional(V.number)
    })
  )
})

export const result1 = checkExample({
  count: 10,
  name: 0x2b, // not a string -- will fail validation
  objects: [{}] // object is missing a required field
})

console.log('result1', result1)

export const result2 = checkExample({
  count: 0,
  name: 'mewzler',
  objects: [
    {
      field: 'abc'
    },
    {
      field: 'def',
      otherField: 10
    }
  ]
})

console.log('result2', result2)
