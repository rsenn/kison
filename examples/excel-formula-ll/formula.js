/*
Generated By kison v0.4.17

Generate time: Mon Aug 09 2021 10:49:14 GMT+0800 (中国标准时间)
*/
var formula = (function(undefined) {
  var my = {
    markType: function(self, type, enter = true) {
      const { userData } = self;
      userData[type] = userData[type] || 0;
      if (enter) {
        ++userData[type];
      } else if (userData.inArray) {
        --userData[type];
      }
    },
    last: function(arr) {
      return arr && arr[arr.length - 1];
    }
  };
  function mix(to, from) {
    for (var f in from) {
      to[f] = from[f];
    }
  }
  function isArray(obj) {
    return "[object Array]" === Object.prototype.toString.call(obj);
  }
  function each(object, fn, context) {
    if (object) {
      var key,
        val,
        length,
        i = 0;

      context = context || null;

      if (!isArray(object)) {
        for (key in object) {
          // can not use hasOwnProperty
          if (fn.call(context, object[key], key, object) === false) {
            break;
          }
        }
      } else {
        length = object.length;
        for (val = object[0]; i < length; val = object[++i]) {
          if (fn.call(context, val, i, object) === false) {
            break;
          }
        }
      }
    }
  }
  function inArray(item, arr) {
    for (var i = 0, l = arr.length; i < l; i++) {
      if (arr[i] === item) {
        return true;
      }
    }
    return false;
  }
  var Lexer = function Lexer(cfg) {
    /*
     lex rules.
     @type {Object[]}
     @example
     [
     {
     regexp:'\\w+',
     state:['xx'],
     token:'c',
     // this => lex
     action:function(){}
     }
     ]
     */
    this.rules = [];

    mix(this, cfg);

    this.rules = [...this.rules];

    this.userData = {};

    const errorRule = (this.errorRule = {
      regexp: this.matchAny,
      token: Lexer.STATIC.UNKNOWN_TOKEN
    });

    const ruleIndexMap = (this.ruleIndexMap = {
      token: 0,
      regexp: 1,
      action: 2,
      filter: 3,
      state: 4
    });

    const errorRuleCompress = (this.errorRuleCompress = []);
    errorRuleCompress[ruleIndexMap.token] = errorRule.token;
    errorRuleCompress[ruleIndexMap.regexp] = errorRule.regexp;

    this.resetInput(this.input);
  };
  Lexer.prototype = {
    matchAny: function() {
      return this.input.length ? this.input[0] : false;
    },
    resetInput: function(input) {
      mix(this, {
        tokensQueue: [],
        tokens: [],
        userData: {},
        input,
        matched: "",
        stateStack: [Lexer.STATIC.INITIAL_STATE],
        match: "",
        text: "",
        firstLine: 1,
        lineNumber: 1,
        lastLine: 1,
        start: 0,
        end: 0,
        firstColumn: 1,
        lastColumn: 1
      });
    },
    mapEndSymbol: function() {
      return this.mapSymbol(Lexer.STATIC.EOF_TOKEN);
    },
    mapHiddenSymbol: function() {
      return this.mapSymbol(Lexer.STATIC.HIDDEN_TOKEN);
    },
    getRuleItem: function(rule, itemType) {
      if (this.isCompress) {
        return rule[this.ruleIndexMap[itemType]];
      } else {
        return rule[itemType];
      }
    },
    getCurrentRules: function() {
      var currentState = this.stateStack[this.stateStack.length - 1],
        rules = [];
      if (this.mapState) {
        currentState = this.mapState(currentState);
      }
      each(this.rules, r => {
        var filter = this.getRuleItem(r, "filter");
        if (filter) {
          if (filter.call(this)) {
            rules.push(r);
          }
          return;
        }
        var state = this.getRuleItem(r, "state");
        if (!state) {
          if (currentState === Lexer.STATIC.INITIAL_STATE) {
            rules.push(r);
          }
        } else if (inArray(currentState, state)) {
          rules.push(r);
        }
      });
      if (this.isCompress) {
        rules.push(this.errorRuleCompress);
      } else {
        rules.push(this.errorRule);
      }
      return rules;
    },
    peekState: function(n) {
      n = n || 1;
      return this.stateStack[this.stateStack.length - n];
    },
    pushState: function(state) {
      this.stateStack.push(state);
    },
    popState: function(num) {
      num = num || 1;
      var ret;
      while (num--) {
        ret = this.stateStack.pop();
      }
      return ret;
    },
    showDebugInfo: function() {
      var { DEBUG_CONTEXT_LIMIT } = Lexer.STATIC;
      var { matched, match, input } = this;

      matched = matched.slice(0, matched.length - match.length);
      var past =
          (matched.length > DEBUG_CONTEXT_LIMIT ? "..." : "") +
          matched
            .slice(0 - DEBUG_CONTEXT_LIMIT)
            .split("\n")
            .join(" "),
        next = match + input;
      //#JSCOVERAGE_ENDIF
      next =
        next
          .slice(0, DEBUG_CONTEXT_LIMIT)
          .split("\n")
          .join(" ") + (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
      return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
    },
    mapSymbol: function(t) {
      var { symbolMap } = this;
      if (!symbolMap) {
        return t;
      }
      // force string, see util.clone iphone5s ios7 bug
      return symbolMap[t] || (symbolMap[t] = this.genShortId("symbol"));
    },
    mapReverseSymbol: function(rs) {
      var { symbolMap, reverseSymbolMap } = this;
      if (!reverseSymbolMap && symbolMap) {
        reverseSymbolMap = this.reverseSymbolMap = {};
        for (var i in symbolMap) {
          reverseSymbolMap[symbolMap[i]] = i;
        }
      }
      if (reverseSymbolMap) {
        return reverseSymbolMap[rs] || rs;
      } else {
        return rs;
      }
    },
    toJSON: function() {
      return {
        text: this.text,
        firstLine: this.firstLine,
        firstColumn: this.firstColumn,
        lastLine: this.lastLine,
        lastColumn: this.lastColumn,
        token: this.token,
        start: this.start,
        end: this.end
      };
    },
    peek: function() {
      const token = this._lex(true);
      this.tokensQueue.push(token);
      if (token.token === Lexer.STATIC.HIDDEN_TOKEN) {
        return this.peek();
      }
      return token;
    },
    matchRegExp: function(regexp) {
      if (regexp.test) {
        return this.input.match(regexp);
      }
      return regexp.call(this, this);
    },
    lex: function() {
      const token = this._lex();
      this.tokens.push(token);
      if (token.token === Lexer.STATIC.HIDDEN_TOKEN) {
        return this.lex();
      }
      return token;
    },
    _lex: function(skipQueue) {
      if (!skipQueue) {
        const { tokensQueue } = this;
        while (tokensQueue.length) {
          const token = tokensQueue.shift();
          return token;
        }
      }
      var i,
        rule,
        m,
        ret,
        lines,
        rules = this.getCurrentRules();

      var { env = this.defaultEnv, input } = this;

      this.match = this.text = "";

      if (!input) {
        return {
          t: this.mapEndSymbol(),
          token: Lexer.STATIC.EOF_TOKEN,
          start: this.end,
          end: this.end,
          firstLine: this.lastLine,
          firstColumn: this.lastColumn,
          lastLine: this.lastLine,
          lastColumn: this.lastColumn
        };
      }

      for (i = 0; i < rules.length; i++) {
        rule = rules[i];
        var regexp = this.getRuleItem(rule, "regexp"),
          token = this.getRuleItem(rule, "token"),
          action = this.getRuleItem(rule, "action");

        if (
          typeof regexp !== "function" &&
          regexp &&
          env &&
          typeof regexp.test !== "function"
        ) {
          regexp = regexp[env];
        }

        if (!regexp) {
          continue;
        }

        //#JSCOVERAGE_ENDIF
        if ((m = this.matchRegExp(regexp))) {
          this.start = this.end;
          this.end += m[0].length;
          lines = m[0].split("\n");
          lines.shift();
          this.lineNumber += lines.length;
          const position = {
            start: this.start,
            end: this.end,
            firstLine: this.lastLine,
            lastLine: this.lineNumber,
            firstColumn: this.lastColumn,
            lastColumn: lines.length
              ? lines[lines.length - 1].length
              : this.lastColumn + m[0].length
          };
          mix(this, position);
          var match;
          // for error report
          match = this.match = m[0];

          // all matches
          this.matches = m;
          // may change by user
          this.text = match;
          // matched content utils now
          this.matched += match;
          ret = action && action.call(this);
          if (ret === undefined) {
            ret = token;
          } else {
            ret = this.mapSymbol(ret);
          }
          input = input.slice(match.length);
          this.input = input;

          if (ret) {
            this.token = this.mapReverseSymbol(ret);
            return {
              text: this.text,
              token: this.token,
              t: ret,
              ...position
            };
          } else {
            // ignore
            return this._lex(skipQueue);
          }
        }
      }
    }
  };
  Lexer.STATIC = {
    INITIAL_STATE: "I",
    DEBUG_CONTEXT_LIMIT: 20,
    EOF_TOKEN: "$EOF",
    UNKNOWN_TOKEN: "$UNKNOWN",
    HIDDEN_TOKEN: "$HIDDEN"
  };
  var lexer = new Lexer({
    rules: [
      ["$HIDDEN", /^\s+/, undefined, undefined, ["s", "I"]],
      [
        "(",
        /^\(/,
        function() {
          const { userData } = this;
          userData.markParen = userData.markParen || [];
          const lastItem = my.last(userData.markParen);
          if (lastItem && lastItem.index === this.start) {
            return;
          }
          userData.markParen.push({ index: this.end, func: false });
        }
      ],
      [
        ")",
        /^\)/,
        function() {
          const { userData } = this;
          userData.markParen = userData.markParen || [];
          userData.markParen.pop();
        }
      ],
      [
        "{",
        /^\{/,
        function() {
          // array constants
          my.markType(this, "a");
        }
      ],
      [":", /^:/],
      ["=", /^=/],
      ["<=", /^<=/],
      [">=", /^>=/],
      ["<>", /^<>/],
      [">", /^>/],
      ["<", /^</],
      ["+", /^\+/],
      ["-", /^\-/],
      ["*", /^\*/],
      ["/", /^\//],
      ["^", /^\^/],
      ["&", /^&/],
      ["%", /^%/],
      [
        "}",
        /^\}/,
        function() {
          my.markType(this, "a", false);
        }
      ],
      ["SPECIFIER_SEPARATOR", /^,/, undefined, undefined, ["s"]],
      [
        "TABLE_ITEM_SPECIFIER",
        /^\[#(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*)\]/,
        undefined,
        undefined,
        ["s", "I"]
      ],
      [
        "TABLE_COLUMN_SPECIFIER",
        /^(?:(?:(?:\[(?:'.|[^\]'#])+\])(?:\:(?:\[(?:'.|[^\]'#])+\]))?)|(?:'.|[^\]#'])+)/,
        undefined,
        undefined,
        ["s"]
      ],
      [
        "[",
        /^\[/,
        function() {
          this.pushState("s");
        },
        undefined,
        ["s", "I"]
      ],
      ["@", /^@/, undefined, undefined, ["s"]],
      [
        "]",
        /^\]/,
        function() {
          this.popState();
        },
        undefined,
        ["s"]
      ],
      [
        "ARRAY_SEPARATOR",
        {
          en: /^[,;]/,
          de: /^[\\;]/
        },
        undefined,
        function() {
          return !!this.userData.a;
        }
      ],
      [
        "REF_SEPARATOR",
        /^,/,
        undefined,
        function() {
          const lastItem = my.last(this.userData.markParen);
          return !lastItem || !lastItem.func;
        }
      ],
      [
        "ARGUMENT_SEPARATOR",
        {
          en: /^,/,
          de: /^;/
        }
      ],
      [
        "STRING",
        /^"(?:""|[^"])*"/,
        function() {
          this.text = this.text.slice(1, -1).replace(/""/g, '"');
        }
      ],
      [
        "FUNCTION",
        /^(?:(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*)(?:\.(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*))*)(?=[(])/,
        function() {
          const { userData } = this;
          userData.markParen = userData.markParen || [];
          userData.markParen.push({ index: this.end, func: true });
        }
      ],
      ["ERROR", /^#[A-Z0-9\/]+(!|\?)? /],
      [
        "CELL",
        /^(?:(?:(?:'(?:''|[^'])*')|(?:(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*)(?:\:(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*))?))!)?(?:\$?[A-Za-z]+\$?[0-9]+)(?:\s*\:\s*(?:\$?[A-Za-z]+\$?[0-9]+))?/
      ],
      ["LOGIC", /^(TRUE|FALSE)(?=\b)/i],
      [
        "TABLE_NAME",
        /^(?:(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*)(?:\.(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*))*)(?=[\[])/
      ],
      [
        "NAME",
        /^(?:(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*)(?:\.(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*))*)/
      ],
      [
        "NUMBER",
        {
          en: /^(?:0|[1-9][0-9]*)?\.(?:[0-9][0-9]*)(?:[eE][+-]?[0-9]+)?/,
          de: /^(?:0|[1-9][0-9]*)?,(?:[0-9][0-9]*)(?:[eE][+-]?[0-9]+)?/
        }
      ],
      ["NUMBER", /^(?:0|[1-9][0-9]*)(?:[eE][+-]?[0-9]+)?/]
    ],
    isCompress: 1,
    defaultEnv: "en"
  });
  var parser = {
    productions: [
      ["formula", ["expression"]],
      ["expression", ["equalExp"], undefined, "single-exp"],
      ["(equalExp)1_", ["=", "addExp", 1, "(equalExp)1_"]],
      ["(equalExp)1_", ["<=", "addExp", 1, "(equalExp)1_"]],
      ["(equalExp)1_", [">=", "addExp", 1, "(equalExp)1_"]],
      ["(equalExp)1_", ["<>", "addExp", 1, "(equalExp)1_"]],
      ["(equalExp)1_", [">", "addExp", 1, "(equalExp)1_"]],
      ["(equalExp)1_", ["<", "addExp", 1, "(equalExp)1_"]],
      ["(equalExp)1_", []],
      ["equalExp", ["addExp", 1, "(equalExp)1_"], undefined, "single-exp"],
      ["(addExp)1_", ["+", "mulExp", 1, "(addExp)1_"]],
      ["(addExp)1_", ["-", "mulExp", 1, "(addExp)1_"]],
      ["(addExp)1_", []],
      ["addExp", ["mulExp", 1, "(addExp)1_"], undefined, "single-exp"],
      ["(mulExp)1_", ["*", "expoExp", 1, "(mulExp)1_"]],
      ["(mulExp)1_", ["/", "expoExp", 1, "(mulExp)1_"]],
      ["(mulExp)1_", []],
      ["mulExp", ["expoExp", 1, "(mulExp)1_"], undefined, "single-exp"],
      ["(expoExp)1_", ["^", "concatExp", 1, "(expoExp)1_"]],
      ["(expoExp)1_", []],
      ["expoExp", ["concatExp", 1, "(expoExp)1_"], undefined, "single-exp"],
      ["(concatExp)1_", ["&", "percentExp", 1, "(concatExp)1_"]],
      ["(concatExp)1_", []],
      [
        "concatExp",
        ["percentExp", 1, "(concatExp)1_"],
        undefined,
        "single-exp"
      ],
      ["(percentExp)1_", ["%", 1, "(percentExp)1_"]],
      ["(percentExp)1_", []],
      [
        "percentExp",
        ["prefix-exp", 1, "(percentExp)1_"],
        undefined,
        "single-exp"
      ],
      ["prefix-exp", ["-", "prefix-exp"], undefined, "single-exp"],
      ["prefix-exp", ["+", "prefix-exp"], undefined, "single-exp"],
      ["prefix-exp", ["atom-exp"], undefined, "single-exp"],
      ["atom-exp", ["(", "equalExp", ")"], undefined, "single-exp"],
      ["atom-exp", ["NUMBER"], undefined, "number-exp"],
      ["atom-exp", ["STRING"], undefined, "string-exp"],
      ["atom-exp", ["LOGIC"], undefined, "string-exp"],
      ["atom-exp", ["ERROR"], undefined, "error-exp"],
      ["atom-exp", ["NAME"], undefined, "error-exp"],
      ["atom-exp", ["reference"], undefined, "single-exp"],
      ["atom-exp", ["function"], undefined, "single-exp"],
      ["atom-exp", ["array"], undefined, "single-exp"],
      ["reference-item", ["CELL"]],
      ["reference-item", ["structure-reference"]],
      ["(reference)1_", ["reference-item", "(reference)1_"]],
      ["(reference)1_", ["REF_SEPARATOR", "reference-item", "(reference)1_"]],
      ["(reference)1_", []],
      ["reference", ["reference-item", "(reference)1_"]],
      ["array-element", ["STRING"]],
      ["array-element", ["NUMBER"]],
      ["array-element", ["LOGIC"]],
      ["array-element", ["ERROR"]],
      [
        "(array-list)1_",
        ["ARRAY_SEPARATOR", "array-element", "(array-list)1_"]
      ],
      ["(array-list)1_", []],
      ["array-list", ["array-element", "(array-list)1_"]],
      ["array", ["{", "array-list", "}"]],
      ["function", ["FUNCTION", "(", "arguments", ")"]],
      ["argument", [], undefined, "single-exp"],
      ["argument", ["equalExp"], undefined, "single-exp"],
      ["(arguments)1_", ["ARGUMENT_SEPARATOR", "argument", "(arguments)1_"]],
      ["(arguments)1_", []],
      ["arguments", ["argument", "(arguments)1_"]],
      ["structure-reference", ["TABLE_NAME", "table-specifier"]],
      ["structure-reference", ["table-specifier"]],
      ["table-specifier", ["TABLE_ITEM_SPECIFIER"]],
      ["table-specifier", ["[", "table-specifier-inner", "]"]],
      ["_1(table-this-row)", ["TABLE_COLUMN_SPECIFIER"]],
      ["_1(table-this-row)", []],
      ["table-this-row", ["@", "_1(table-this-row)"]],
      ["table-specifier-inner", ["table-this-row"]],
      ["table-specifier-inner", ["table-column-specifier"]],
      ["table-specifier-item", ["TABLE_COLUMN_SPECIFIER"]],
      ["table-specifier-item", ["TABLE_ITEM_SPECIFIER"]],
      [
        "(table-column-specifier)1_",
        [
          "SPECIFIER_SEPARATOR",
          "table-specifier-item",
          "(table-column-specifier)1_"
        ]
      ],
      ["(table-column-specifier)1_", []],
      [
        "table-column-specifier",
        ["table-specifier-item", "(table-column-specifier)1_"]
      ]
    ],
    productionIndexMap: {
      symbol: 0,
      rhs: 1,
      action: 2,
      label: 3
    },
    getProductionItemByType: function(p, itemType) {
      if (this.isCompress) {
        return p[this.productionIndexMap[itemType]];
      }
      return p[itemType];
    },
    getProductionSymbol: function(p) {
      return this.getProductionItemByType(p, "symbol");
    },
    getProductionRhs: function(p) {
      return this.getProductionItemByType(p, "rhs");
    },
    getProductionAction: function(p) {
      return this.getProductionItemByType(p, "action");
    },
    getProductionLabel: function(p) {
      return this.getProductionItemByType(p, "label");
    },
    isCompress: 1
  };
  parser.getProductionSymbol = parser.getProductionSymbol.bind(parser);
  parser.getProductionRhs = parser.getProductionRhs.bind(parser);
  parser.getProductionAction = parser.getProductionAction.bind(parser);
  parser.getProductionLabel = parser.getProductionLabel.bind(parser);
  parser.lexer = lexer;
  const productionSkipEndSet = new Set([
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    10,
    11,
    12,
    14,
    15,
    16,
    18,
    19,
    21,
    22,
    24,
    25,
    41,
    42,
    43,
    49,
    50,
    56,
    57,
    63,
    64,
    70,
    71
  ]);
  const productionEndFlag = 2;
  const productionReductionFlag = 1;
  const isProductionEndFlag = function(t) {
    return t === productionEndFlag;
  };
  const isProductionReductionFlag = function(t) {
    return t === productionReductionFlag;
  };
  parser.table = {
    formula: {
      "-": 0,
      "+": 0,
      "(": 0,
      NUMBER: 0,
      STRING: 0,
      LOGIC: 0,
      ERROR: 0,
      NAME: 0,
      CELL: 0,
      TABLE_NAME: 0,
      TABLE_ITEM_SPECIFIER: 0,
      "[": 0,
      FUNCTION: 0,
      "{": 0
    },
    expression: {
      "-": 1,
      "+": 1,
      "(": 1,
      NUMBER: 1,
      STRING: 1,
      LOGIC: 1,
      ERROR: 1,
      NAME: 1,
      CELL: 1,
      TABLE_NAME: 1,
      TABLE_ITEM_SPECIFIER: 1,
      "[": 1,
      FUNCTION: 1,
      "{": 1
    },
    "(equalExp)1_": {
      "=": 2,
      "<=": 3,
      ">=": 4,
      "<>": 5,
      ">": 6,
      "<": 7,
      $EOF: 8,
      ")": 8,
      ARGUMENT_SEPARATOR: 8
    },
    equalExp: {
      "-": 9,
      "+": 9,
      "(": 9,
      NUMBER: 9,
      STRING: 9,
      LOGIC: 9,
      ERROR: 9,
      NAME: 9,
      CELL: 9,
      TABLE_NAME: 9,
      TABLE_ITEM_SPECIFIER: 9,
      "[": 9,
      FUNCTION: 9,
      "{": 9
    },
    "(addExp)1_": {
      "+": 10,
      "-": 11,
      "=": 12,
      "<=": 12,
      ">=": 12,
      "<>": 12,
      ">": 12,
      "<": 12,
      $EOF: 12,
      ")": 12,
      ARGUMENT_SEPARATOR: 12
    },
    addExp: {
      "-": 13,
      "+": 13,
      "(": 13,
      NUMBER: 13,
      STRING: 13,
      LOGIC: 13,
      ERROR: 13,
      NAME: 13,
      CELL: 13,
      TABLE_NAME: 13,
      TABLE_ITEM_SPECIFIER: 13,
      "[": 13,
      FUNCTION: 13,
      "{": 13
    },
    "(mulExp)1_": {
      "*": 14,
      "/": 15,
      "+": 16,
      "-": 16,
      "=": 16,
      "<=": 16,
      ">=": 16,
      "<>": 16,
      ">": 16,
      "<": 16,
      $EOF: 16,
      ")": 16,
      ARGUMENT_SEPARATOR: 16
    },
    mulExp: {
      "-": 17,
      "+": 17,
      "(": 17,
      NUMBER: 17,
      STRING: 17,
      LOGIC: 17,
      ERROR: 17,
      NAME: 17,
      CELL: 17,
      TABLE_NAME: 17,
      TABLE_ITEM_SPECIFIER: 17,
      "[": 17,
      FUNCTION: 17,
      "{": 17
    },
    "(expoExp)1_": {
      "^": 18,
      "*": 19,
      "/": 19,
      "+": 19,
      "-": 19,
      "=": 19,
      "<=": 19,
      ">=": 19,
      "<>": 19,
      ">": 19,
      "<": 19,
      $EOF: 19,
      ")": 19,
      ARGUMENT_SEPARATOR: 19
    },
    expoExp: {
      "-": 20,
      "+": 20,
      "(": 20,
      NUMBER: 20,
      STRING: 20,
      LOGIC: 20,
      ERROR: 20,
      NAME: 20,
      CELL: 20,
      TABLE_NAME: 20,
      TABLE_ITEM_SPECIFIER: 20,
      "[": 20,
      FUNCTION: 20,
      "{": 20
    },
    "(concatExp)1_": {
      "&": 21,
      "^": 22,
      "*": 22,
      "/": 22,
      "+": 22,
      "-": 22,
      "=": 22,
      "<=": 22,
      ">=": 22,
      "<>": 22,
      ">": 22,
      "<": 22,
      $EOF: 22,
      ")": 22,
      ARGUMENT_SEPARATOR: 22
    },
    concatExp: {
      "-": 23,
      "+": 23,
      "(": 23,
      NUMBER: 23,
      STRING: 23,
      LOGIC: 23,
      ERROR: 23,
      NAME: 23,
      CELL: 23,
      TABLE_NAME: 23,
      TABLE_ITEM_SPECIFIER: 23,
      "[": 23,
      FUNCTION: 23,
      "{": 23
    },
    "(percentExp)1_": {
      "%": 24,
      "&": 25,
      "^": 25,
      "*": 25,
      "/": 25,
      "+": 25,
      "-": 25,
      "=": 25,
      "<=": 25,
      ">=": 25,
      "<>": 25,
      ">": 25,
      "<": 25,
      $EOF: 25,
      ")": 25,
      ARGUMENT_SEPARATOR: 25
    },
    percentExp: {
      "-": 26,
      "+": 26,
      "(": 26,
      NUMBER: 26,
      STRING: 26,
      LOGIC: 26,
      ERROR: 26,
      NAME: 26,
      CELL: 26,
      TABLE_NAME: 26,
      TABLE_ITEM_SPECIFIER: 26,
      "[": 26,
      FUNCTION: 26,
      "{": 26
    },
    "prefix-exp": {
      "-": 27,
      "+": 28,
      "(": 29,
      NUMBER: 29,
      STRING: 29,
      LOGIC: 29,
      ERROR: 29,
      NAME: 29,
      CELL: 29,
      TABLE_NAME: 29,
      TABLE_ITEM_SPECIFIER: 29,
      "[": 29,
      FUNCTION: 29,
      "{": 29
    },
    "atom-exp": {
      "(": 30,
      NUMBER: 31,
      STRING: 32,
      LOGIC: 33,
      ERROR: 34,
      NAME: 35,
      CELL: 36,
      TABLE_NAME: 36,
      TABLE_ITEM_SPECIFIER: 36,
      "[": 36,
      FUNCTION: 37,
      "{": 38
    },
    "reference-item": {
      CELL: 39,
      TABLE_NAME: 40,
      TABLE_ITEM_SPECIFIER: 40,
      "[": 40
    },
    "(reference)1_": {
      CELL: 41,
      TABLE_NAME: 41,
      TABLE_ITEM_SPECIFIER: 41,
      "[": 41,
      REF_SEPARATOR: 42,
      "%": 43,
      "&": 43,
      "^": 43,
      "*": 43,
      "/": 43,
      "+": 43,
      "-": 43,
      "=": 43,
      "<=": 43,
      ">=": 43,
      "<>": 43,
      ">": 43,
      "<": 43,
      $EOF: 43,
      ")": 43,
      ARGUMENT_SEPARATOR: 43
    },
    reference: {
      CELL: 44,
      TABLE_NAME: 44,
      TABLE_ITEM_SPECIFIER: 44,
      "[": 44
    },
    "array-element": {
      STRING: 45,
      NUMBER: 46,
      LOGIC: 47,
      ERROR: 48
    },
    "(array-list)1_": {
      ARRAY_SEPARATOR: 49,
      "}": 50
    },
    "array-list": {
      STRING: 51,
      NUMBER: 51,
      LOGIC: 51,
      ERROR: 51
    },
    array: {
      "{": 52
    },
    function: {
      FUNCTION: 53
    },
    argument: {
      ARGUMENT_SEPARATOR: 54,
      ")": 54,
      "-": 55,
      "+": 55,
      "(": 55,
      NUMBER: 55,
      STRING: 55,
      LOGIC: 55,
      ERROR: 55,
      NAME: 55,
      CELL: 55,
      TABLE_NAME: 55,
      TABLE_ITEM_SPECIFIER: 55,
      "[": 55,
      FUNCTION: 55,
      "{": 55
    },
    "(arguments)1_": {
      ARGUMENT_SEPARATOR: 56,
      ")": 57
    },
    arguments: {
      "-": 58,
      "+": 58,
      "(": 58,
      NUMBER: 58,
      STRING: 58,
      LOGIC: 58,
      ERROR: 58,
      NAME: 58,
      CELL: 58,
      TABLE_NAME: 58,
      TABLE_ITEM_SPECIFIER: 58,
      "[": 58,
      FUNCTION: 58,
      "{": 58,
      ARGUMENT_SEPARATOR: 58,
      ")": 58
    },
    "structure-reference": {
      TABLE_NAME: 59,
      TABLE_ITEM_SPECIFIER: 60,
      "[": 60
    },
    "table-specifier": {
      TABLE_ITEM_SPECIFIER: 61,
      "[": 62
    },
    "_1(table-this-row)": {
      TABLE_COLUMN_SPECIFIER: 63,
      "]": 64
    },
    "table-this-row": {
      "@": 65
    },
    "table-specifier-inner": {
      "@": 66,
      TABLE_COLUMN_SPECIFIER: 67,
      TABLE_ITEM_SPECIFIER: 67
    },
    "table-specifier-item": {
      TABLE_COLUMN_SPECIFIER: 68,
      TABLE_ITEM_SPECIFIER: 69
    },
    "(table-column-specifier)1_": {
      SPECIFIER_SEPARATOR: 70,
      "]": 71
    },
    "table-column-specifier": {
      TABLE_COLUMN_SPECIFIER: 72,
      TABLE_ITEM_SPECIFIER: 72
    }
  };

  class AstNode {
    constructor(cfg) {
      Object.assign(this, cfg);
      if (cfg.children) {
        this.setChildren(cfg.children);
      }
    }

    addChild(c) {
      this.addChildren([c]);
    }

    addChildren(cs) {
      this.children.push(...cs);
      this.setChildren(this.children);
    }

    setChildren(cs) {
      if (!cs.length) {
        this.children = [];
        return;
      }
      const first = cs[0];
      const last = cs[cs.length - 1];
      this.start = first.start;
      this.end = last.end;
      this.firstLine = first.firstLine;
      this.lastLine = last.lastLine;
      this.firstColumn = first.firstColumn;
      this.lastColumn = last.lastColumn;
      this.children = cs;
      for (const c of cs) {
        c.parent = this;
      }
    }

    toJSON() {
      const ret = {};
      for (const k of Object.keys(this)) {
        if (k !== "parent" && k !== "t") {
          ret[k] = this[k];
        }
      }
      return ret;
    }
  }

  parser.parse = function parse(input, options) {
    const recoveryTokens = [];
    const terminalNodes = [];

    function isExtraSymbol(ast) {
      return ast.children && !ast.children.length;
    }

    function peekStack(stack, n) {
      n = n || 1;
      return stack[stack.length - n];
    }

    function getTableVal(row, col) {
      return table[row] && table[row][col];
    }

    function noop() {}

    function getOriginalSymbol(s) {
      return lexer.mapReverseSymbol(s);
    }

    options = options || {};
    let error;
    var { onErrorRecovery, onAction = noop, lexerEnv } = options;

    var {
      lexer,
      table,
      productions,
      getProductionSymbol,
      getProductionRhs,
      getProductionLabel
    } = parser;

    lexer.env = lexerEnv;

    var symbolStack = [getProductionSymbol(productions[0])];
    const astStack = [
      new AstNode({
        children: []
      })
    ];
    lexer.resetInput(input);
    let token;
    let next;
    let currentToken;

    function getError() {
      const expected = getExpected();
      return (
        "syntax error at line " +
        lexer.lineNumber +
        ":\n" +
        lexer.showDebugInfo() +
        "\n" +
        (expected.length ? "expect " + expected.join(", ") : "") +
        "\n" +
        (currentToken ? "current token is " + currentToken.token : "")
      );
    }

    function cleanAst(ast) {
      if (ast.token || ast.error) {
        return ast;
      }
      if (ast.children) {
        let children = [];
        for (const c of ast.children) {
          if (cleanAst(c)) {
            children.push(c);
          }
        }
        ast.setChildren(children);
      }
      if (!ast.children || !ast.children.length) {
        return null;
      }
      if (ast.children.length === 1) {
        const child = ast.children[0];
        if (
          (ast.label && child.label && ast.label === child.label) ||
          (!ast.label && !child.label && ast.symbol === child.symbol)
        ) {
          ast.setChildren(child.children);
          ast.symbol = child.symbol;
        }
      }
      return ast;
    }

    function getAst(raw) {
      const ast =
        astStack[0] && astStack[0].children && astStack[0].children[0];
      if (ast) {
        astStack[0].children.forEach(a => delete a.parent);
      }
      if (raw) {
        return ast;
      }
      return ast && cleanAst(ast);
    }

    let topSymbol;

    let errorNode;

    let lastSymbol;

    function popSymbolStack() {
      const last = symbolStack.pop();
      if (typeof last === "string") {
        lastSymbol = last;
      }
    }

    function getExpected() {
      const s = topSymbol || lastSymbol;
      const ret = (table[s] && Object.keys(table[s])) || [];
      return ret.map(r => lexer.mapReverseSymbol(r));
    }

    function closeAstWhenError() {
      errorNode = new AstNode({
        error,
        ...error.lexer
      });
      peekStack(astStack).addChild(errorNode);
      while (astStack.length !== 1) {
        const ast = astStack.pop();
        if (ast.symbol && isExtraSymbol(ast)) {
          const topAst = peekStack(astStack);
          topAst.children.pop();
          topAst.addChildren(ast.children);
        }
      }
    }

    let production;

    while (1) {
      topSymbol = peekStack(symbolStack);

      if (!topSymbol) {
        break;
      }

      while (
        isProductionEndFlag(topSymbol) ||
        isProductionReductionFlag(topSymbol)
      ) {
        let ast = astStack.pop();
        if (isProductionReductionFlag(topSymbol)) {
          const stackTop = peekStack(astStack);
          const wrap = new AstNode({
            symbol: ast.symbol,
            children: [ast],
            label: ast.label
          });
          stackTop.children.pop();
          stackTop.addChild(wrap);
          astStack.push(wrap);
        }
        popSymbolStack();
        topSymbol = peekStack(symbolStack);
        if (!topSymbol) {
          break;
        }
      }

      if (typeof topSymbol === "string") {
        if (!token) {
          token = lexer.lex();
          recoveryTokens.push(token);
        }
        currentToken = token;
        if (topSymbol === token.t) {
          symbolStack.pop();
          const terminalNode = new AstNode(token);
          terminalNodes.push(terminalNode);
          const parent = peekStack(astStack);
          parent.addChild(terminalNode);
          token = null;
        } else if ((next = getTableVal(topSymbol, token.t)) !== undefined) {
          popSymbolStack();
          production = productions[next];

          if (productionSkipEndSet.has(next)) {
            symbolStack.push.apply(
              symbolStack,
              getProductionRhs(production)
                .concat()
                .reverse()
            );
          } else {
            const newAst = new AstNode({
              symbol: getOriginalSymbol(topSymbol),
              label: getProductionLabel(production),
              children: []
            });
            peekStack(astStack).addChild(newAst);
            astStack.push(newAst);
            symbolStack.push.apply(
              symbolStack,
              getProductionRhs(production)
                .concat(productionEndFlag)
                .reverse()
            );
          }
        } else {
          error = {
            errorMessage: getError(),
            expected: getExpected(),
            symbol: lexer.mapReverseSymbol(topSymbol),
            lexer: token
          };
          if (onErrorRecovery) {
            const recommendedAction = {};
            const nextToken = lexer.peek();

            // should delete
            if (
              topSymbol === nextToken.t ||
              getTableVal(topSymbol, nextToken.t) !== undefined
            ) {
              recommendedAction.action = "del";
            } else if (error.expected.length) {
              recommendedAction.action = "add";
            }

            const errorNode = new AstNode({
              error,
              ...error.lexer
            });

            peekStack(astStack).addChild(errorNode);

            const recovery =
              onErrorRecovery(
                {
                  errorNode,
                  ast: getAst(true)
                },
                recommendedAction
              ) || {};
            const { action } = recovery;

            peekStack(astStack).children.pop();

            if (!action) {
              closeAstWhenError();
              break;
            }

            if (action === "del") {
              error.recovery = true;
              recoveryTokens.pop();
              token = null;
            } else if (action === "add") {
              error.recovery = true;
              token = {
                ...token,
                token: recovery.token,
                text: recovery.text,
                t: lexer.mapSymbol(recovery.token)
              };
              recoveryTokens.push(token);
            }
          } else {
            closeAstWhenError();
            break;
          }
        }
      }

      topSymbol = peekStack(symbolStack);

      while (topSymbol && typeof topSymbol === "function") {
        onAction({
          lexer: currentToken,
          action: topSymbol
        });
        popSymbolStack();
        topSymbol = peekStack(symbolStack);
      }

      if (!symbolStack.length) {
        break;
      }
    }

    if (!error && currentToken.t !== lexer.mapEndSymbol()) {
      error = {
        errorMessage: getError(),
        expected: getExpected(),
        symbol: lexer.mapReverseSymbol(topSymbol || lastSymbol),
        lexer: currentToken
      };
      closeAstWhenError();
    }

    const ast = getAst();

    return {
      ast,
      tokens: lexer.tokens,
      recoveryTokens,
      errorNode,
      error,
      terminalNodes
    };
  };

  return parser;
})();

export default formula;
