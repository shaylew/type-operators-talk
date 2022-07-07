module.exports = {
  env: {
    es2021: true,
  },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },

  plugins: ['@typescript-eslint'],

  extends: [
    'plugin:@typescript-eslint/recommended',
    'standard-with-typescript',
    'prettier'
  ],

  rules: {
    // Bubble uses snake_case historically, so don't demand camelCase.
    camelcase: 'off',
    "no-unused-vars": "off",
    // Example code; don't want to have to type "export" everywhere.
    "@typescript-eslint/no-unused-vars": ["off"],
    // Example code: want to be able to write types that could be interfaces.
    "@typescript-eslint/consistent-type-definitions": ["off"],
    // Example code: you shouldn't do these things with void but you _can_.
    "@typescript-eslint/no-invalid-void-type": ["off"]
  }
}
