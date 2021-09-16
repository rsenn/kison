const operators = [
  ['binary', '=', '<=', '>=', '<>', '>', '<'],
  ['binary', '&'],
  ['binary', '+', '-'],
  ['binary', '*', '/'],
  ['binary', '^'],
  ['unary', '%'],
  ['unary', '+', '-'],
  ['unary', '@'],
  ['atom'],
];

const nameMap = {
  '=': 'equal',
  '<=': 'lessEqual',
  '>=': 'greaterEqual',
  '<>': 'notEqual',
  '<': 'less',
  '>': 'greater',
  '+': 'add',
  '-': 'minus',
  '*': 'mul',
  '/': 'divide',
  '^': 'expo',
  '&': 'concat',
  '%': 'percent',
  '@': 'clip',
};

function getExpSymbol([type, op]) {
  if (nameMap[op]) {
    return `${type}-${nameMap[op]}-exp`;
  }
  return `${type}-exp`;
}

const startExp = getExpSymbol(operators[0]);

const rightBinaryOperatorMap = {
  // "^": 1
};

const rightUnaryOperatorMap = {
  '%': 1,
};

function generateOpProductions() {
  const ret = [];
  operators.slice(0, -1).forEach((o, operatorIndex) => {
    const type = operators[operatorIndex][0];
    const ops = operators[operatorIndex].slice(1);
    const current = ops[0];
    const exp = getExpSymbol(operators[operatorIndex]);
    const nextExp = getExpSymbol(operators[operatorIndex + 1]);
    ret.push({
      symbol: exp,
      rhs: [nextExp],
    });
    if (type === 'unary') {
      for (const o of ops) {
        if (rightUnaryOperatorMap[o]) {
          ret.push({
            symbol: exp,
            rhs: [exp, o],
          });
        } else {
          ret.push({
            symbol: exp,
            rhs: [o, exp],
          });
        }
      }
    } else {
      if (rightBinaryOperatorMap[current]) {
        for (const o of ops) {
          ret.push({
            symbol: exp,
            rhs: [nextExp, o, exp],
          });
        }
      } else {
        for (const o of ops) {
          ret.push({
            symbol: exp,
            rhs: [exp, o, nextExp],
          });
        }
      }
    }
  });
  return ret;
}

const decimalFractionLiteral = '(?:[0-9][0-9]*)';
const decimalIntegerLiteral = '(?:0|[1-9][0-9]*)';
const exponentPart = '(?:[eE][+-]?[0-9]+)';
const namePart = '(?:[_A-Za-z\u4e00-\u9fa5]+[_A-Za-z_0-9\u4e00-\u9fa5]*)';
const fullNamePart = `(?:${namePart}(?:\\.${namePart})*)`;
const cellAddressLiteral = `(?:\\$?[A-Za-z]+\\$?[0-9]+)`;
const rowRangeAddress = `(?:\\d+\\:\\d+)`;
const cellAddress = `(?:
  ${cellAddressLiteral}
  (?:
    \\s*
    \\:
    \\s*
    ${cellAddressLiteral}
    )?
  #?
)`.replace(/\s/g, '');
const sheetAddress = `(?:(?:
  
  (?:'(?:''|[^'])*')
  
  |

(?:${namePart}(?:\\:${namePart})?)

)!)`.replace(/\s/g, '');
const tableColumnSpecifierLiteral = `(?:
  \\[
    (?:
      '.|[^\\]'#]
      )+
    \\]
  )`.replace(/\s/g, '');
const tableColumnRange = `(?:${tableColumnSpecifierLiteral}(?:\\:${tableColumnSpecifierLiteral})?)`;
const tableColumnSpecifier = `(?:${tableColumnRange}|(?:'.|[^\\]#'])+)`;

const my = {
  markType(self, type, enter = true) {
    const { userData } = self;
    userData[type] = userData[type] || 0;
    if (enter) {
      ++userData[type];
    } else if (userData.inArray) {
      --userData[type];
    }
  },
  last(arr) {
    return arr && arr[arr.length - 1];
  },
};

module.exports = () => ({
  my,
  productions: [
    {
      symbol: 'formula',
      rhs: [startExp],
    },
    ...generateOpProductions(),
    {
      symbol: 'atom-exp',
      rhs: ['(', startExp, ')'],
    },
    {
      symbol: 'atom-exp',
      rhs: ['NUMBER'],
    },
    {
      symbol: 'atom-exp',
      rhs: ['STRING'],
    },
    {
      symbol: 'atom-exp',
      rhs: ['LOGIC'],
    },
    {
      symbol: 'atom-exp',
      rhs: ['ERROR'],
    },
    {
      symbol: 'atom-exp',
      rhs: ['reference'],
    },
    {
      symbol: 'reference-item',
      rhs: ['CELL'],
    },
    {
      symbol: 'reference-item',
      rhs: ['NAME'],
    },
    {
      symbol: 'reference-item',
      rhs: ['structure-reference'],
    },
    // reference operator: : SPACE ,
    {
      symbol: 'reference',
      rhs: ['union-reference'],
    },
    {
      symbol: 'union-reference',
      rhs: ['union-reference', 'REF_UNION_OPERATOR', 'intersect-reference'],
    },
    {
      symbol: 'union-reference',
      rhs: ['intersect-reference'],
    },
    {
      symbol: 'intersect-reference',
      rhs: ['intersect-reference', 'expand-reference'],
    },
    {
      symbol: 'intersect-reference',
      rhs: ['expand-reference'],
    },
    {
      symbol: 'expand-reference',
      rhs: ['expand-reference', 'REF_EXPAND_OPERATOR', 'reference-item'],
    },
    {
      symbol: 'expand-reference',
      rhs: ['reference-item'],
    },

    {
      symbol: 'atom-exp',
      rhs: ['function'],
    },
    {
      symbol: 'atom-exp',
      rhs: ['array'],
    },
    {
      symbol: 'array-element',
      rhs: ['STRING'],
    },
    {
      symbol: 'array-element',
      rhs: ['NUMBER'],
    },
    {
      symbol: 'array-element',
      rhs: ['LOGIC'],
    },
    {
      symbol: 'array-element',
      rhs: ['ERROR'],
    },
    {
      symbol: 'array-list',
      rhs: ['array-element'],
    },
    {
      symbol: 'array-list',
      rhs: ['array-list', 'ARRAY_SEPARATOR', 'array-element'],
      flat: true,
    },
    {
      symbol: 'array',
      rhs: ['{', 'array-list', '}'],
    },

    // function
    {
      symbol: 'function',
      rhs: ['FUNCTION', '(', 'arguments', ')'],
    },
    {
      symbol: 'argument',

      rhs: [],
    },
    {
      symbol: 'argument',

      rhs: [startExp],
    },
    {
      symbol: 'arguments',
      rhs: ['argument'],
    },
    {
      symbol: 'arguments',
      rhs: ['arguments', 'ARGUMENT_SEPARATOR', 'argument'],
      flat: true, // arguments => (argument,)*
    },

    // structure reference
    {
      symbol: 'structure-reference',
      rhs: ['TABLE_NAME', 'table-specifier'],
    },
    {
      symbol: 'structure-reference',
      rhs: ['table-specifier'],
    },
    {
      symbol: 'table-specifier',
      rhs: ['TABLE_ITEM_SPECIFIER'],
    },
    {
      symbol: 'table-specifier',
      rhs: ['[', 'table-specifier-inner', ']'],
    },
    {
      symbol: 'table-this-row',
      rhs: ['TABLE_@'],
    },
    {
      symbol: 'table-this-row',
      rhs: ['TABLE_@', 'TABLE_COLUMN_SPECIFIER'],
    },
    {
      symbol: 'table-specifier-inner',
      rhs: ['table-this-row'],
    },
    {
      symbol: 'table-specifier-inner',
      rhs: ['table-column-specifier'],
    },
    {
      symbol: 'table-specifier-item',
      rhs: ['TABLE_COLUMN_SPECIFIER'],
    },
    {
      symbol: 'table-specifier-item',
      rhs: ['TABLE_ITEM_SPECIFIER'],
    },
    {
      symbol: 'table-column-specifier',
      rhs: ['table-specifier-item'],
    },
    {
      symbol: 'table-column-specifier',
      rhs: [
        'table-column-specifier',
        'SPECIFIER_SEPARATOR',
        'table-specifier-item',
      ],
      flat: true,
    },
  ],

  lexer: {
    defaultEnv: 'en',

    rules: [
      {
        state: ['inside structure reference', 'I'],
        regexp: /^\s+/,
        token: '$HIDDEN',
      },
      {
        regexp: /^\(/,
        token: '(',
        action() {
          if (this.tokens[this.tokens.length - 1]?.token === 'FUNCTION') {
            return;
          }
          this.userData.markParen.push({ func: false });
        },
      },
      {
        regexp: /^\)/,
        token: ')',
        action() {
          const { userData } = this;
          userData.markParen = userData.markParen || [];
          userData.markParen.pop();
        },
      },
      {
        regexp: /^\{/,
        token: '{',
        action() {
          // array constants
          my.markType(this, 'a');
        },
      },

      {
        regexp: /^\}/,
        token: '}',
        action() {
          my.markType(this, 'a', false);
        },
      },

      // structure reference
      {
        state: ['inside structure reference'],
        regexp: /^,/,
        token: 'SPECIFIER_SEPARATOR',
      },
      {
        state: ['inside structure reference', 'I'],
        regexp: /^\[#('.|[^\]#])+\]/,
        token: 'TABLE_ITEM_SPECIFIER',
      },
      {
        state: ['inside structure reference'],
        regexp: /^@/,
        token: 'TABLE_@',
      },
      {
        state: ['inside structure reference'],
        regexp: new RegExp(`^${tableColumnSpecifier}`),
        token: 'TABLE_COLUMN_SPECIFIER',
      },
      {
        state: ['inside structure reference', 'I'],
        regexp: /^\[/,
        token: '[',
        action() {
          this.pushState('inside structure reference');
        },
      },

      {
        state: ['inside structure reference'],
        regexp: /^\]/,
        token: ']',
        action() {
          this.popState();
        },
      },
      {
        filter() {
          return !!this.userData.a;
        },
        regexp: { en: /^[,;]/, de: /^[\\;]/ },
        token: 'ARRAY_SEPARATOR',
      },
      {
        filter() {
          const lastItem = my.last(this.userData.markParen);
          return !lastItem || !lastItem.func;
        },
        regexp: /^,/,
        token: 'REF_UNION_OPERATOR',
      },
      {
        regexp: /^:/,
        token: 'REF_EXPAND_OPERATOR',
      },
      {
        regexp: { en: /^,/, de: /^;/ },
        token: 'ARGUMENT_SEPARATOR',
      },
      {
        regexp: /^"(?:""|[^"])*"/,
        token: 'STRING',
        action() {
          this.text = this.text.slice(1, -1).replace(/""/g, '"');
        },
      },
      {
        regexp: new RegExp(`^${fullNamePart}(?=[(])`),
        token: 'FUNCTION',
        action() {
          const { userData } = this;
          userData.markParen = userData.markParen || [];
          userData.markParen.push({ func: true });
        },
      },
      {
        regexp: /^#[A-Z0-9\/]+(!|\?)? /,
        token: 'ERROR',
      },
      {
        // @: disable array formula, allow  Implicit Intersection
        // #: spill reference
        regexp: new RegExp(
          `^${sheetAddress}?(?:${cellAddress}|${rowRangeAddress})`,
        ),
        token: 'CELL',
      },
      {
        regexp: /^(TRUE|FALSE)(?=\b)/i,
        token: 'LOGIC',
      },
      {
        regexp: new RegExp(`^${fullNamePart}(?=[\\[])`),
        token: 'TABLE_NAME',
      },
      {
        regexp: new RegExp(`^${fullNamePart}`),
        token: 'NAME',
      },
      {
        regexp: {
          en: new RegExp(
            `^${decimalIntegerLiteral}?\\.${decimalFractionLiteral}${exponentPart}?`,
          ),
          de: new RegExp(
            `^${decimalIntegerLiteral}?,${decimalFractionLiteral}${exponentPart}?`,
          ),
        },
        token: 'NUMBER',
      },
      {
        regexp: new RegExp(`^${decimalIntegerLiteral}${exponentPart}?`),
        token: 'NUMBER',
      },
    ],
  },
});
