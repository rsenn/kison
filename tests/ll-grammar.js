const startGroup = `'('`;
const endGroup = `')'`;
const alternative = `'|'`;

module.exports = () => ({
  productions: [
    {
      symbol: 'program',
      rhs: ['statements'],
    },
    {
      symbol: 'statements',
      rhs: [startGroup, 'exp', 'NEW_LINE', endGroup + '+'],
    },
    {
      symbol: 'exp',
      rhs: [
        'exp',
        '+',
        'exp',
        alternative,
        'exp',
        '-',
        'exp',
        alternative,
        'exp',
        '*',
        'exp',
        alternative,
        'exp',
        '/',
        'exp',
        alternative,
        'exp',
        '^',
        'exp',
      ],
      label: 'binary-exp',
    },
    {
      symbol: 'exp',
      rhs: ['-', 'exp'],
      precedence: 'UMINUS',
    },
    {
      symbol: 'exp',
      rhs: ['NUMBER'],
    },
    {
      symbol: 'exp',
      rhs: ['(', 'exp', ')'],
    },
  ],

  operators: [
    ['left', '+', '-'],
    ['left', '*', '/'],
    ['right', '^'],
    ['right', 'UMINUS'],
  ],

  lexer: {
    rules: [
      {
        regexp: /^\n/,
        token: 'NEW_LINE',
      },
      {
        regexp: /^\s+/,
        token: '$HIDDEN',
      },
      {
        regexp: /^[0-9]+(\.[0-9]+)?\b/,
        token: 'NUMBER',
      },
    ],
  },
});
