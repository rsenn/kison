/*
Generated By kison v0.4.12

Generate time: Thu Jul 29 2021 18:52:17 GMT+0800 (中国标准时间)
*/
var parser = (function(undefined) {
  var my = {
    c0: 48,
    c9: 57,
    charRange: [[9], [10], [13], [32, 55295], [57344, 65533], [65536, 1114111]],
    createMatchString: function(str, lexer) {
      const { input } = lexer;
      if (input.lastIndexOf(str, 0) !== 0) {
        return false;
      }
      return [str];
    },
    matchChar: function(lexer) {
      const { input } = lexer;
      let m = "";
      let char = input[0];
      m += char;
      if (char === "\\") {
        char = input[1];
        m += char;
      }
      const range = my.charRange;
      const charCode = char.charCodeAt(0);
      for (const r of range) {
        if (r.length == 1) {
          if (r[0] === charCode) {
            return [m];
          }
        } else if (charCode >= r[0] || charCode <= r[1]) {
          return [m];
        }
      }
      return false;
    },
    matchBackreference: function(lexer) {
      const { input } = lexer;
      if (input[0] !== "\\") {
        return false;
      }
      const match = my.matchNumber({ input: input.slice(1) });
      if (match === false) {
        return false;
      }
      match[0] = "\\" + match[0];
      return match;
    },
    matchNumber: function(lexer) {
      let index = 0;
      const match = [];
      const { input } = lexer;
      const l = input.length;
      while (index < l) {
        const char = input[index];
        const codeCode = input.charCodeAt(index);
        if (codeCode < my.c0 || codeCode > my.c9) {
          break;
        }
        match.push(char);
        index++;
      }
      return match.length ? [match.join("")] : false;
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
    this.tokensQueue = [];

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
        userData: {},
        input: input,
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
    peek: function(skipHidden) {
      const token = this.lex(skipHidden, true);
      if (this.tokensQueue.indexOf(token) === -1) {
        this.tokensQueue.push(token);
      }
      return token;
    },
    matchRegExp: function(regexp) {
      if (regexp.test) {
        return this.input.match(regexp);
      }
      return regexp.call(this, this);
    },
    lex: function(skipHidden, reserveQueue) {
      if (skipHidden === undefined) {
        skipHidden = true;
      }
      const { tokensQueue } = this;
      if (reserveQueue) {
        for (let i = 0; i < tokensQueue.length; i++) {
          const token = tokensQueue[i];
          if (skipHidden && token.t === this.mapHiddenSymbol()) {
            continue;
          }
          return token;
        }
      } else {
        while (tokensQueue.length) {
          const token = tokensQueue.shift();
          if (skipHidden && token.t === this.mapHiddenSymbol()) {
            continue;
          }
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
            if (ret === this.mapHiddenSymbol() && skipHidden) {
              return this.lex();
            }
            return {
              text: this.text,
              token: this.token,
              t: ret,
              ...position
            };
          } else {
            // ignore
            return this.lex();
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
      ["$", my.createMatchString.bind(undefined, "$")],
      [",", my.createMatchString.bind(undefined, ",")],
      ["^", my.createMatchString.bind(undefined, "^")],
      ["?:", my.createMatchString.bind(undefined, "?:")],
      ["?", my.createMatchString.bind(undefined, "?")],
      ["(", my.createMatchString.bind(undefined, "(")],
      [")", my.createMatchString.bind(undefined, ")")],
      ["{", my.createMatchString.bind(undefined, "{")],
      ["}", my.createMatchString.bind(undefined, "}")],
      ["[", my.createMatchString.bind(undefined, "[")],
      ["]", my.createMatchString.bind(undefined, "]")],
      ["-", my.createMatchString.bind(undefined, "-")],
      ["|", my.createMatchString.bind(undefined, "|")],
      ["*", my.createMatchString.bind(undefined, "*")],
      ["+", my.createMatchString.bind(undefined, "+")],
      [".", my.createMatchString.bind(undefined, ".")],
      ["characterClassAnyWord", my.createMatchString.bind(undefined, "\\w")],
      [
        "characterClassAnyWordInverted",
        my.createMatchString.bind(undefined, "\\W")
      ],
      [
        "characterClassAnyDecimalDigit",
        my.createMatchString.bind(undefined, "\\d")
      ],
      [
        "characterClassAnyDecimalDigitInverted",
        my.createMatchString.bind(undefined, "\\D")
      ],
      ["backreference", my.matchBackreference],
      ["anchorWordBoundary", my.createMatchString.bind(undefined, "\\b")],
      ["anchorNonWordBoundary", my.createMatchString.bind(undefined, "\\B")],
      ["anchorStartOfStringOnly", my.createMatchString.bind(undefined, "\\A")],
      [
        "anchorEndOfStringOnlyNotNewline",
        my.createMatchString.bind(undefined, "\\z")
      ],
      ["anchorEndOfStringOnly", my.createMatchString.bind(undefined, "\\Z")],
      ["anchorPreviousMatchEnd", my.createMatchString.bind(undefined, "\\G")],
      ["int", my.matchNumber],
      [
        "char",
        my.matchChar,
        function() {
          if (this.text[0] === "\\") {
            this.text = this.text.slice(1);
          }
        }
      ]
    ],
    isCompress: 1,
    defaultEnv: undefined
  });
  var parser = {
    productions: [
      ["Regexp", ["^", "Expression"]],
      ["Regexp", ["Expression"]],
      ["Expression_", ["|", "SubExpression", "Expression_"]],
      ["Expression_", []],
      ["Expression", ["SubExpression", "Expression_"]],
      ["SubExpression_", ["ExpressionItem", "SubExpression_"]],
      ["SubExpression_", []],
      ["SubExpression", ["ExpressionItem", "SubExpression_"]],
      ["ExpressionItem", ["Match"]],
      ["ExpressionItem", ["Group"]],
      ["ExpressionItem", ["Anchor"]],
      ["ExpressionItem", ["backreference"]],
      ["Group", ["(", "_Group"]],
      ["__Group", ["Quantifier"]],
      ["__Group", []],
      ["_Group", ["Expression", ")", "__Group"]],
      ["_Group", ["?:", "Expression", ")", "__Group"]],
      ["_Match", []],
      ["_Match", ["Quantifier"]],
      ["Match", ["MatchItem", "_Match"]],
      ["MatchItem", ["."]],
      ["MatchItem", ["MatchCharacterClass"]],
      ["MatchItem", ["char"]],
      ["MatchCharacterClass", ["CharacterGroup"]],
      ["MatchCharacterClass", ["CharacterClass"]],
      ["_CharacterGroup", ["CharacterGroupInner", "]"]],
      ["_CharacterGroup", ["^", "CharacterGroupInner", "]"]],
      ["CharacterGroup", ["[", "_CharacterGroup"]],
      ["CharacterGroupInner_", ["CharacterGroupItem", "CharacterGroupInner_"]],
      ["CharacterGroupInner_", []],
      ["CharacterGroupInner", ["CharacterGroupItem", "CharacterGroupInner_"]],
      ["CharacterGroupItem", ["CharacterClass"]],
      ["CharacterGroupItem", ["CharacterRange"]],
      ["CharacterClass", ["characterClassAnyWordInverted"]],
      ["CharacterClass", ["characterClassAnyDecimalDigit"]],
      ["CharacterClass", ["characterClassAnyDecimalDigitInverted"]],
      ["_CharacterRange", ["-", "char"]],
      ["_CharacterRange", []],
      ["CharacterRange", ["char", "_CharacterRange"]],
      ["_Quantifier", []],
      ["_Quantifier", ["?"]],
      ["Quantifier", ["QuantifierType", "_Quantifier"]],
      ["QuantifierType", ["*"]],
      ["QuantifierType", ["+"]],
      ["QuantifierType", ["?"]],
      ["_QuantifierType", ["}"]],
      ["QuantifierType", ["{", "int", "_QuantifierType"]],
      ["__QuantifierType", ["int", "}"]],
      ["__QuantifierType", ["}"]],
      ["_QuantifierType", [",", "__QuantifierType"]],
      ["Anchor", ["anchorWordBoundary"]],
      ["Anchor", ["anchorNonWordBoundary"]],
      ["Anchor", ["anchorStartOfStringOnly"]],
      ["Anchor", ["anchorEndOfStringOnlyNotNewline"]],
      ["Anchor", ["anchorEndOfStringOnly"]],
      ["Anchor", ["anchorPreviousMatchEnd"]],
      ["Anchor", ["$"]]
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
    5,
    6,
    13,
    14,
    15,
    16,
    17,
    18,
    25,
    26,
    28,
    29,
    36,
    37,
    39,
    40,
    45,
    47,
    48,
    49
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
    Regexp: {
      "^": 0,
      ".": 1,
      "[": 1,
      characterClassAnyWordInverted: 1,
      characterClassAnyDecimalDigit: 1,
      characterClassAnyDecimalDigitInverted: 1,
      char: 1,
      "(": 1,
      anchorWordBoundary: 1,
      anchorNonWordBoundary: 1,
      anchorStartOfStringOnly: 1,
      anchorEndOfStringOnlyNotNewline: 1,
      anchorEndOfStringOnly: 1,
      anchorPreviousMatchEnd: 1,
      $: 1,
      backreference: 1
    },
    Expression_: {
      "|": 2,
      $EOF: 3,
      ")": 3
    },
    Expression: {
      ".": 4,
      "[": 4,
      characterClassAnyWordInverted: 4,
      characterClassAnyDecimalDigit: 4,
      characterClassAnyDecimalDigitInverted: 4,
      char: 4,
      "(": 4,
      anchorWordBoundary: 4,
      anchorNonWordBoundary: 4,
      anchorStartOfStringOnly: 4,
      anchorEndOfStringOnlyNotNewline: 4,
      anchorEndOfStringOnly: 4,
      anchorPreviousMatchEnd: 4,
      $: 4,
      backreference: 4
    },
    SubExpression_: {
      ".": 5,
      "[": 5,
      characterClassAnyWordInverted: 5,
      characterClassAnyDecimalDigit: 5,
      characterClassAnyDecimalDigitInverted: 5,
      char: 5,
      "(": 5,
      anchorWordBoundary: 5,
      anchorNonWordBoundary: 5,
      anchorStartOfStringOnly: 5,
      anchorEndOfStringOnlyNotNewline: 5,
      anchorEndOfStringOnly: 5,
      anchorPreviousMatchEnd: 5,
      $: 5,
      backreference: 5,
      "|": 6,
      $EOF: 6,
      ")": 6
    },
    SubExpression: {
      ".": 7,
      "[": 7,
      characterClassAnyWordInverted: 7,
      characterClassAnyDecimalDigit: 7,
      characterClassAnyDecimalDigitInverted: 7,
      char: 7,
      "(": 7,
      anchorWordBoundary: 7,
      anchorNonWordBoundary: 7,
      anchorStartOfStringOnly: 7,
      anchorEndOfStringOnlyNotNewline: 7,
      anchorEndOfStringOnly: 7,
      anchorPreviousMatchEnd: 7,
      $: 7,
      backreference: 7
    },
    ExpressionItem: {
      ".": 8,
      "[": 8,
      characterClassAnyWordInverted: 8,
      characterClassAnyDecimalDigit: 8,
      characterClassAnyDecimalDigitInverted: 8,
      char: 8,
      "(": 9,
      anchorWordBoundary: 10,
      anchorNonWordBoundary: 10,
      anchorStartOfStringOnly: 10,
      anchorEndOfStringOnlyNotNewline: 10,
      anchorEndOfStringOnly: 10,
      anchorPreviousMatchEnd: 10,
      $: 10,
      backreference: 11
    },
    Group: {
      "(": 12
    },
    __Group: {
      "*": 13,
      "+": 13,
      "?": 13,
      "{": 13,
      ".": 14,
      "[": 14,
      characterClassAnyWordInverted: 14,
      characterClassAnyDecimalDigit: 14,
      characterClassAnyDecimalDigitInverted: 14,
      char: 14,
      "(": 14,
      anchorWordBoundary: 14,
      anchorNonWordBoundary: 14,
      anchorStartOfStringOnly: 14,
      anchorEndOfStringOnlyNotNewline: 14,
      anchorEndOfStringOnly: 14,
      anchorPreviousMatchEnd: 14,
      $: 14,
      backreference: 14,
      "|": 14,
      $EOF: 14,
      ")": 14
    },
    _Group: {
      ".": 15,
      "[": 15,
      characterClassAnyWordInverted: 15,
      characterClassAnyDecimalDigit: 15,
      characterClassAnyDecimalDigitInverted: 15,
      char: 15,
      "(": 15,
      anchorWordBoundary: 15,
      anchorNonWordBoundary: 15,
      anchorStartOfStringOnly: 15,
      anchorEndOfStringOnlyNotNewline: 15,
      anchorEndOfStringOnly: 15,
      anchorPreviousMatchEnd: 15,
      $: 15,
      backreference: 15,
      "?:": 16
    },
    _Match: {
      ".": 17,
      "[": 17,
      characterClassAnyWordInverted: 17,
      characterClassAnyDecimalDigit: 17,
      characterClassAnyDecimalDigitInverted: 17,
      char: 17,
      "(": 17,
      anchorWordBoundary: 17,
      anchorNonWordBoundary: 17,
      anchorStartOfStringOnly: 17,
      anchorEndOfStringOnlyNotNewline: 17,
      anchorEndOfStringOnly: 17,
      anchorPreviousMatchEnd: 17,
      $: 17,
      backreference: 17,
      "|": 17,
      $EOF: 17,
      ")": 17,
      "*": 18,
      "+": 18,
      "?": 18,
      "{": 18
    },
    Match: {
      ".": 19,
      "[": 19,
      characterClassAnyWordInverted: 19,
      characterClassAnyDecimalDigit: 19,
      characterClassAnyDecimalDigitInverted: 19,
      char: 19
    },
    MatchItem: {
      ".": 20,
      "[": 21,
      characterClassAnyWordInverted: 21,
      characterClassAnyDecimalDigit: 21,
      characterClassAnyDecimalDigitInverted: 21,
      char: 22
    },
    MatchCharacterClass: {
      "[": 23,
      characterClassAnyWordInverted: 24,
      characterClassAnyDecimalDigit: 24,
      characterClassAnyDecimalDigitInverted: 24
    },
    _CharacterGroup: {
      characterClassAnyWordInverted: 25,
      characterClassAnyDecimalDigit: 25,
      characterClassAnyDecimalDigitInverted: 25,
      char: 25,
      "^": 26
    },
    CharacterGroup: {
      "[": 27
    },
    CharacterGroupInner_: {
      characterClassAnyWordInverted: 28,
      characterClassAnyDecimalDigit: 28,
      characterClassAnyDecimalDigitInverted: 28,
      char: 28,
      "]": 29
    },
    CharacterGroupInner: {
      characterClassAnyWordInverted: 30,
      characterClassAnyDecimalDigit: 30,
      characterClassAnyDecimalDigitInverted: 30,
      char: 30
    },
    CharacterGroupItem: {
      characterClassAnyWordInverted: 31,
      characterClassAnyDecimalDigit: 31,
      characterClassAnyDecimalDigitInverted: 31,
      char: 32
    },
    CharacterClass: {
      characterClassAnyWordInverted: 33,
      characterClassAnyDecimalDigit: 34,
      characterClassAnyDecimalDigitInverted: 35
    },
    _CharacterRange: {
      "-": 36,
      characterClassAnyWordInverted: 37,
      characterClassAnyDecimalDigit: 37,
      characterClassAnyDecimalDigitInverted: 37,
      char: 37,
      "]": 37
    },
    CharacterRange: {
      char: 38
    },
    _Quantifier: {
      ".": 39,
      "[": 39,
      characterClassAnyWordInverted: 39,
      characterClassAnyDecimalDigit: 39,
      characterClassAnyDecimalDigitInverted: 39,
      char: 39,
      "(": 39,
      anchorWordBoundary: 39,
      anchorNonWordBoundary: 39,
      anchorStartOfStringOnly: 39,
      anchorEndOfStringOnlyNotNewline: 39,
      anchorEndOfStringOnly: 39,
      anchorPreviousMatchEnd: 39,
      $: 39,
      backreference: 39,
      "|": 39,
      $EOF: 39,
      ")": 39,
      "?": 40
    },
    Quantifier: {
      "*": 41,
      "+": 41,
      "?": 41,
      "{": 41
    },
    QuantifierType: {
      "*": 42,
      "+": 43,
      "?": 44,
      "{": 46
    },
    _QuantifierType: {
      "}": 45,
      ",": 49
    },
    __QuantifierType: {
      int: 47,
      "}": 48
    },
    Anchor: {
      anchorWordBoundary: 50,
      anchorNonWordBoundary: 51,
      anchorStartOfStringOnly: 52,
      anchorEndOfStringOnlyNotNewline: 53,
      anchorEndOfStringOnly: 54,
      anchorPreviousMatchEnd: 55,
      $: 56
    }
  };
  parser.parse = function parse(input, options) {
    const tokens = [];
    const recoveryTokens = [];
    const terminalNodes = [];

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
          tokens.push(token);
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
      tokens,
      recoveryTokens,
      errorNode,
      error,
      terminalNodes
    };
  };

  return parser;
})();

export default parser;
