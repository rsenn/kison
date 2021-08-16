/*
Generated By kison v0.4.19

Generate time: Mon Aug 16 2021 13:00:40 GMT+0800 (中国标准时间)
*/
var index = (function(undefined) {
  "use strict";

  function _createForOfIteratorHelperLoose(o, allowArrayLike) {
    var it =
      (typeof Symbol !== "undefined" && o[Symbol.iterator]) || o["@@iterator"];
    if (it) return (it = it.call(o)).next.bind(it);
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === "number")
    ) {
      if (it) o = it;
      var i = 0;
      return function() {
        if (i >= o.length) return { done: true };
        return { done: false, value: o[i++] };
      };
    }
    throw new TypeError(
      "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
    );
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
      return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }

  function _extends() {
    _extends =
      Object.assign ||
      function(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i];
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
        return target;
      };
    return _extends.apply(this, arguments);
  }

  var my = {
    markType: function markType(self, type, enter) {
      if (enter === void 0) {
        enter = true;
      }

      var userData = self.userData;
      userData[type] = userData[type] || 0;

      if (enter) {
        ++userData[type];
      } else if (userData.inArray) {
        --userData[type];
      }
    },
    last: function last(arr) {
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
    this.rules = [].concat(this.rules);
    this.userData = {};
    var errorRule = (this.errorRule = {
      regexp: this.matchAny,
      token: Lexer.STATIC.UNKNOWN_TOKEN
    });
    var ruleIndexMap = (this.ruleIndexMap = {
      token: 0,
      regexp: 1,
      action: 2,
      filter: 3,
      state: 4
    });
    var errorRuleCompress = (this.errorRuleCompress = []);
    errorRuleCompress[ruleIndexMap.token] = errorRule.token;
    errorRuleCompress[ruleIndexMap.regexp] = errorRule.regexp;
    this.resetInput(this.input);
    this.options = {};
  };

  Lexer.prototype = {
    matchAny: function matchAny() {
      return this.input.length ? this.input[0] : false;
    },
    resetInput: function resetInput(input) {
      mix(this, {
        tokensQueue: [],
        tokens: [],
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
    mapEndSymbol: function mapEndSymbol() {
      return this.mapSymbol(Lexer.STATIC.EOF_TOKEN);
    },
    mapHiddenSymbol: function mapHiddenSymbol() {
      return this.mapSymbol(Lexer.STATIC.HIDDEN_TOKEN);
    },
    getRuleItem: function getRuleItem(rule, itemType) {
      if (this.isCompress) {
        return rule[this.ruleIndexMap[itemType]];
      } else {
        return rule[itemType];
      }
    },
    getCurrentRules: function getCurrentRules() {
      var _this = this;

      var currentState = this.stateStack[this.stateStack.length - 1],
        rules = [];

      if (this.mapState) {
        currentState = this.mapState(currentState);
      }

      each(this.rules, function(r) {
        var filter = _this.getRuleItem(r, "filter");

        if (filter) {
          if (filter.call(_this)) {
            rules.push(r);
          }

          return;
        }

        var state = _this.getRuleItem(r, "state");

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
    peekState: function peekState(n) {
      n = n || 1;
      return this.stateStack[this.stateStack.length - n];
    },
    pushState: function pushState(state) {
      this.stateStack.push(state);
    },
    popState: function popState(num) {
      num = num || 1;
      var ret;

      while (num--) {
        ret = this.stateStack.pop();
      }

      return ret;
    },
    showDebugInfo: function showDebugInfo() {
      var DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT;
      var matched = this.matched,
        match = this.match,
        input = this.input;
      matched = matched.slice(0, matched.length - match.length);
      var past =
          (matched.length > DEBUG_CONTEXT_LIMIT ? "..." : "") +
          matched
            .slice(0 - DEBUG_CONTEXT_LIMIT)
            .split("\n")
            .join(" "),
        next = match + input; //#JSCOVERAGE_ENDIF

      next =
        next
          .slice(0, DEBUG_CONTEXT_LIMIT)
          .split("\n")
          .join(" ") + (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
      return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
    },
    mapSymbol: function mapSymbol(t) {
      return this.symbolMap[t];
    },
    mapReverseSymbol: function mapReverseSymbol(rs) {
      var symbolMap = this.symbolMap,
        reverseSymbolMap = this.reverseSymbolMap;

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
    toJSON: function toJSON() {
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
    peek: function peek() {
      var token = this._lex(true);

      this.tokensQueue.push(token);

      if (token.token === Lexer.STATIC.HIDDEN_TOKEN) {
        return this.peek();
      }

      return token;
    },
    matchRegExp: function matchRegExp(regexp) {
      if (regexp.test) {
        return this.input.match(regexp);
      }

      return regexp.call(this, this);
    },
    lex: function lex() {
      var token = this._lex();

      this.tokens.push(token);

      if (token.token === Lexer.STATIC.HIDDEN_TOKEN) {
        return this.lex();
      }

      return token;
    },
    getChar: function getChar(index) {
      if (index === void 0) {
        index = 0;
      }

      if (this.options.unicode) {
        var code = this.input.codePointAt(index);

        if (code === undefined || isNaN(code)) {
          return "";
        }

        return String.fromCodePoint(code);
      }

      return this.input.charAt(index);
    },
    getCharCode: function getCharCode(index) {
      if (index === void 0) {
        index = 0;
      }

      if (this.options.unicode) {
        return this.input.codePointAt(index);
      }

      return this.input.charCodeAt(index);
    },
    _lex: function _lex(skipQueue) {
      if (!skipQueue) {
        var tokensQueue = this.tokensQueue;

        while (tokensQueue.length) {
          var _token = tokensQueue.shift();

          return _token;
        }
      }

      var i,
        rule,
        m,
        ret,
        lines,
        rules = this.getCurrentRules();
      var input = this.input;
      var _this$options$env = this.options.env,
        env =
          _this$options$env === void 0 ? this.defaultEnv : _this$options$env;
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
        } //#JSCOVERAGE_ENDIF

        if ((m = this.matchRegExp(regexp))) {
          this.start = this.end;
          this.end += m[0].length;
          lines = m[0].split("\n");
          lines.shift();
          this.lineNumber += lines.length;
          var position = {
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
          var match; // for error report

          match = this.match = m[0]; // all matches

          this.matches = m; // may change by user

          this.text = match; // matched content utils now

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
            return _extends(
              {
                text: this.text,
                token: this.token,
                t: ret
              },
              position
            );
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
        "a",
        /^\(/,
        function() {
          var userData = this.userData;
          userData.markParen = userData.markParen || [];
          var lastItem = my.last(userData.markParen);

          if (lastItem && lastItem.index === this.start) {
            return;
          }

          userData.markParen.push({
            index: this.end,
            func: false
          });
        }
      ],
      [
        "b",
        /^\)/,
        function() {
          var userData = this.userData;
          userData.markParen = userData.markParen || [];
          userData.markParen.pop();
        }
      ],
      [
        "c",
        /^\{/,
        function() {
          // array constants
          my.markType(this, "a");
        }
      ],
      ["d", /^:/],
      ["e", /^=/],
      ["f", /^<=/],
      ["g", /^>=/],
      ["h", /^<>/],
      ["i", /^>/],
      ["j", /^</],
      ["k", /^\+/],
      ["l", /^\-/],
      ["m", /^\*/],
      ["n", /^\//],
      ["o", /^\^/],
      ["p", /^&/],
      ["q", /^%/],
      [
        "r",
        /^\}/,
        function() {
          my.markType(this, "a", false);
        }
      ],
      ["s", /^,/, undefined, undefined, ["s"]],
      [
        "t",
        /^\[#(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*)\]/,
        undefined,
        undefined,
        ["s", "I"]
      ],
      [
        "u",
        /^(?:(?:(?:\[(?:'.|[^\]'#])+\])(?:\:(?:\[(?:'.|[^\]'#])+\]))?)|(?:'.|[^\]#'])+)/,
        undefined,
        undefined,
        ["s"]
      ],
      [
        "v",
        /^\[/,
        function() {
          this.pushState("s");
        },
        undefined,
        ["s", "I"]
      ],
      ["w", /^@/, undefined, undefined, ["s"]],
      ["x", /^@/],
      [
        "y",
        /^\]/,
        function() {
          this.popState();
        },
        undefined,
        ["s"]
      ],
      [
        "z",
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
        "aa",
        /^,/,
        undefined,
        function() {
          var lastItem = my.last(this.userData.markParen);
          return !lastItem || !lastItem.func;
        }
      ],
      [
        "ab",
        {
          en: /^,/,
          de: /^;/
        }
      ],
      [
        "ac",
        /^"(?:""|[^"])*"/,
        function() {
          this.text = this.text.slice(1, -1).replace(/""/g, '"');
        }
      ],
      [
        "ad",
        /^(?:(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*)(?:\.(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*))*)(?=[(])/,
        function() {
          var userData = this.userData;
          userData.markParen = userData.markParen || [];
          userData.markParen.push({
            index: this.end,
            func: true
          });
        }
      ],
      ["ae", /^#[A-Z0-9\/]+(!|\?)? /],
      [
        "af",
        /^(?:(?:(?:'(?:''|[^'])*')|(?:(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*)(?:\:(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*))?))!)?(?:\$?[A-Za-z]+\$?[0-9]+)(?:\s*\:\s*(?:\$?[A-Za-z]+\$?[0-9]+))?#?/
      ],
      ["ag", /^(TRUE|FALSE)(?=\b)/i],
      [
        "ah",
        /^(?:(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*)(?:\.(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*))*)(?=[\[])/
      ],
      [
        "ai",
        /^(?:(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*)(?:\.(?:[_A-Za-z一-龥]+[_A-Za-z_0-9一-龥]*))*)/
      ],
      [
        "aj",
        {
          en: /^(?:0|[1-9][0-9]*)?\.(?:[0-9][0-9]*)(?:[eE][+-]?[0-9]+)?/,
          de: /^(?:0|[1-9][0-9]*)?,(?:[0-9][0-9]*)(?:[eE][+-]?[0-9]+)?/
        }
      ],
      ["aj", /^(?:0|[1-9][0-9]*)(?:[eE][+-]?[0-9]+)?/]
    ],
    isCompress: 1,
    defaultEnv: "en"
  });
  var parser = {
    productions: [
      ["ak", ["al"]],
      ["al", ["am"], undefined, "single-exp"],
      ["an", ["e", "ao", 1, "an"]],
      ["an", ["f", "ao", 1, "an"]],
      ["an", ["g", "ao", 1, "an"]],
      ["an", ["h", "ao", 1, "an"]],
      ["an", ["i", "ao", 1, "an"]],
      ["an", ["j", "ao", 1, "an"]],
      ["an", []],
      ["am", ["ao", 1, "an"], undefined, "single-exp"],
      ["ap", ["k", "aq", 1, "ap"]],
      ["ap", ["l", "aq", 1, "ap"]],
      ["ap", []],
      ["ao", ["aq", 1, "ap"], undefined, "single-exp"],
      ["ar", ["m", "as", 1, "ar"]],
      ["ar", ["n", "as", 1, "ar"]],
      ["ar", []],
      ["aq", ["as", 1, "ar"], undefined, "single-exp"],
      ["at", ["o", "au", 1, "at"]],
      ["at", []],
      ["as", ["au", 1, "at"], undefined, "single-exp"],
      ["av", ["p", "aw", 1, "av"]],
      ["av", []],
      ["au", ["aw", 1, "av"], undefined, "single-exp"],
      ["ax", ["q", 1, "ax"]],
      ["ax", []],
      ["aw", ["ay", 1, "ax"], undefined, "single-exp"],
      ["ay", ["l", "ay"], undefined, "single-exp"],
      ["ay", ["k", "ay"], undefined, "single-exp"],
      ["ay", ["x", "ay"], undefined, "single-exp"],
      ["ay", ["az"], undefined, "single-exp"],
      ["az", ["a", "am", "b"], undefined, "single-exp"],
      ["az", ["aj"], undefined, "number-exp"],
      ["az", ["ac"], undefined, "string-exp"],
      ["az", ["ag"], undefined, "string-exp"],
      ["az", ["ae"], undefined, "error-exp"],
      ["az", ["ai"], undefined, "error-exp"],
      ["az", ["ba"], undefined, "single-exp"],
      ["az", ["bb"], undefined, "single-exp"],
      ["az", ["bc"], undefined, "single-exp"],
      ["bd", ["af"]],
      ["bd", ["be"]],
      ["bf", ["bd", "bf"]],
      ["bf", ["aa", "bd", "bf"]],
      ["bf", []],
      ["ba", ["bd", "bf"]],
      ["bg", ["ac"]],
      ["bg", ["aj"]],
      ["bg", ["ag"]],
      ["bg", ["ae"]],
      ["bh", ["z", "bg", "bh"]],
      ["bh", []],
      ["bi", ["bg", "bh"]],
      ["bc", ["c", "bi", "r"]],
      ["bb", ["ad", "a", "bj", "b"]],
      ["bk", [], undefined, "single-exp"],
      ["bk", ["am"], undefined, "single-exp"],
      ["bl", ["ab", "bk", "bl"]],
      ["bl", []],
      ["bj", ["bk", "bl"]],
      ["be", ["ah", "bm"]],
      ["be", ["bm"]],
      ["bm", ["t"]],
      ["bm", ["v", "bn", "y"]],
      ["bo", ["u"]],
      ["bo", []],
      ["bp", ["w", "bo"]],
      ["bn", ["bp"]],
      ["bn", ["bq"]],
      ["br", ["u"]],
      ["br", ["t"]],
      ["bs", ["s", "br", "bs"]],
      ["bs", []],
      ["bq", ["br", "bs"]]
    ],
    productionIndexMap: {
      symbol: 0,
      rhs: 1,
      action: 2,
      label: 3
    },
    getProductionItemByType: function getProductionItemByType(p, itemType) {
      if (this.isCompress) {
        return p[this.productionIndexMap[itemType]];
      }

      return p[itemType];
    },
    getProductionSymbol: function getProductionSymbol(p) {
      return this.getProductionItemByType(p, "symbol");
    },
    getProductionRhs: function getProductionRhs(p) {
      return this.getProductionItemByType(p, "rhs");
    },
    getProductionAction: function getProductionAction(p) {
      return this.getProductionItemByType(p, "action");
    },
    getProductionLabel: function getProductionLabel(p) {
      return this.getProductionItemByType(p, "label");
    },
    isCompress: 1
  };
  parser.getProductionSymbol = parser.getProductionSymbol.bind(parser);
  parser.getProductionRhs = parser.getProductionRhs.bind(parser);
  parser.getProductionAction = parser.getProductionAction.bind(parser);
  parser.getProductionLabel = parser.getProductionLabel.bind(parser);
  parser.lexer = lexer;
  lexer.symbolMap = {
    $UNKNOWN: "$UNKNOWN",
    $HIDDEN: "$HIDDEN",
    $EOF: "$EOF",
    "(": "a",
    ")": "b",
    "{": "c",
    ":": "d",
    "=": "e",
    "<=": "f",
    ">=": "g",
    "<>": "h",
    ">": "i",
    "<": "j",
    "+": "k",
    "-": "l",
    "*": "m",
    "/": "n",
    "^": "o",
    "&": "p",
    "%": "q",
    "}": "r",
    SPECIFIER_SEPARATOR: "s",
    TABLE_ITEM_SPECIFIER: "t",
    TABLE_COLUMN_SPECIFIER: "u",
    "[": "v",
    "table@": "w",
    "@": "x",
    "]": "y",
    ARRAY_SEPARATOR: "z",
    REF_SEPARATOR: "aa",
    ARGUMENT_SEPARATOR: "ab",
    STRING: "ac",
    FUNCTION: "ad",
    ERROR: "ae",
    CELL: "af",
    LOGIC: "ag",
    TABLE_NAME: "ah",
    NAME: "ai",
    NUMBER: "aj",
    formula: "ak",
    expression: "al",
    equalExp: "am",
    "(equalExp)1_": "an",
    addExp: "ao",
    "(addExp)1_": "ap",
    mulExp: "aq",
    "(mulExp)1_": "ar",
    expoExp: "as",
    "(expoExp)1_": "at",
    concatExp: "au",
    "(concatExp)1_": "av",
    percentExp: "aw",
    "(percentExp)1_": "ax",
    "prefix-exp": "ay",
    "atom-exp": "az",
    reference: "ba",
    function: "bb",
    array: "bc",
    "reference-item": "bd",
    "structure-reference": "be",
    "(reference)1_": "bf",
    "array-element": "bg",
    "(array-list)1_": "bh",
    "array-list": "bi",
    arguments: "bj",
    argument: "bk",
    "(arguments)1_": "bl",
    "table-specifier": "bm",
    "table-specifier-inner": "bn",
    "_1(table-this-row)": "bo",
    "table-this-row": "bp",
    "table-column-specifier": "bq",
    "table-specifier-item": "br",
    "(table-column-specifier)1_": "bs"
  };
  var productionSkipEndSet = new Set([
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
    42,
    43,
    44,
    50,
    51,
    57,
    58,
    64,
    65,
    71,
    72
  ]);
  var productionEndFlag = 2;
  var productionReductionFlag = 1;

  var isProductionEndFlag = function isProductionEndFlag(t) {
    return t === productionEndFlag;
  };

  var isProductionReductionFlag = function isProductionReductionFlag(t) {
    return t === productionReductionFlag;
  };

  parser.table = {
    ak: {
      l: 0,
      k: 0,
      x: 0,
      a: 0,
      aj: 0,
      ac: 0,
      ag: 0,
      ae: 0,
      ai: 0,
      af: 0,
      ah: 0,
      t: 0,
      v: 0,
      ad: 0,
      c: 0
    },
    al: {
      l: 1,
      k: 1,
      x: 1,
      a: 1,
      aj: 1,
      ac: 1,
      ag: 1,
      ae: 1,
      ai: 1,
      af: 1,
      ah: 1,
      t: 1,
      v: 1,
      ad: 1,
      c: 1
    },
    an: {
      e: 2,
      f: 3,
      g: 4,
      h: 5,
      i: 6,
      j: 7,
      $EOF: 8,
      b: 8,
      ab: 8
    },
    am: {
      l: 9,
      k: 9,
      x: 9,
      a: 9,
      aj: 9,
      ac: 9,
      ag: 9,
      ae: 9,
      ai: 9,
      af: 9,
      ah: 9,
      t: 9,
      v: 9,
      ad: 9,
      c: 9
    },
    ap: {
      k: 10,
      l: 11,
      e: 12,
      f: 12,
      g: 12,
      h: 12,
      i: 12,
      j: 12,
      $EOF: 12,
      b: 12,
      ab: 12
    },
    ao: {
      l: 13,
      k: 13,
      x: 13,
      a: 13,
      aj: 13,
      ac: 13,
      ag: 13,
      ae: 13,
      ai: 13,
      af: 13,
      ah: 13,
      t: 13,
      v: 13,
      ad: 13,
      c: 13
    },
    ar: {
      m: 14,
      n: 15,
      k: 16,
      l: 16,
      e: 16,
      f: 16,
      g: 16,
      h: 16,
      i: 16,
      j: 16,
      $EOF: 16,
      b: 16,
      ab: 16
    },
    aq: {
      l: 17,
      k: 17,
      x: 17,
      a: 17,
      aj: 17,
      ac: 17,
      ag: 17,
      ae: 17,
      ai: 17,
      af: 17,
      ah: 17,
      t: 17,
      v: 17,
      ad: 17,
      c: 17
    },
    at: {
      o: 18,
      m: 19,
      n: 19,
      k: 19,
      l: 19,
      e: 19,
      f: 19,
      g: 19,
      h: 19,
      i: 19,
      j: 19,
      $EOF: 19,
      b: 19,
      ab: 19
    },
    as: {
      l: 20,
      k: 20,
      x: 20,
      a: 20,
      aj: 20,
      ac: 20,
      ag: 20,
      ae: 20,
      ai: 20,
      af: 20,
      ah: 20,
      t: 20,
      v: 20,
      ad: 20,
      c: 20
    },
    av: {
      p: 21,
      o: 22,
      m: 22,
      n: 22,
      k: 22,
      l: 22,
      e: 22,
      f: 22,
      g: 22,
      h: 22,
      i: 22,
      j: 22,
      $EOF: 22,
      b: 22,
      ab: 22
    },
    au: {
      l: 23,
      k: 23,
      x: 23,
      a: 23,
      aj: 23,
      ac: 23,
      ag: 23,
      ae: 23,
      ai: 23,
      af: 23,
      ah: 23,
      t: 23,
      v: 23,
      ad: 23,
      c: 23
    },
    ax: {
      q: 24,
      p: 25,
      o: 25,
      m: 25,
      n: 25,
      k: 25,
      l: 25,
      e: 25,
      f: 25,
      g: 25,
      h: 25,
      i: 25,
      j: 25,
      $EOF: 25,
      b: 25,
      ab: 25
    },
    aw: {
      l: 26,
      k: 26,
      x: 26,
      a: 26,
      aj: 26,
      ac: 26,
      ag: 26,
      ae: 26,
      ai: 26,
      af: 26,
      ah: 26,
      t: 26,
      v: 26,
      ad: 26,
      c: 26
    },
    ay: {
      l: 27,
      k: 28,
      x: 29,
      a: 30,
      aj: 30,
      ac: 30,
      ag: 30,
      ae: 30,
      ai: 30,
      af: 30,
      ah: 30,
      t: 30,
      v: 30,
      ad: 30,
      c: 30
    },
    az: {
      a: 31,
      aj: 32,
      ac: 33,
      ag: 34,
      ae: 35,
      ai: 36,
      af: 37,
      ah: 37,
      t: 37,
      v: 37,
      ad: 38,
      c: 39
    },
    bd: {
      af: 40,
      ah: 41,
      t: 41,
      v: 41
    },
    bf: {
      af: 42,
      ah: 42,
      t: 42,
      v: 42,
      aa: 43,
      q: 44,
      p: 44,
      o: 44,
      m: 44,
      n: 44,
      k: 44,
      l: 44,
      e: 44,
      f: 44,
      g: 44,
      h: 44,
      i: 44,
      j: 44,
      $EOF: 44,
      b: 44,
      ab: 44
    },
    ba: {
      af: 45,
      ah: 45,
      t: 45,
      v: 45
    },
    bg: {
      ac: 46,
      aj: 47,
      ag: 48,
      ae: 49
    },
    bh: {
      z: 50,
      r: 51
    },
    bi: {
      ac: 52,
      aj: 52,
      ag: 52,
      ae: 52
    },
    bc: {
      c: 53
    },
    bb: {
      ad: 54
    },
    bk: {
      ab: 55,
      b: 55,
      l: 56,
      k: 56,
      x: 56,
      a: 56,
      aj: 56,
      ac: 56,
      ag: 56,
      ae: 56,
      ai: 56,
      af: 56,
      ah: 56,
      t: 56,
      v: 56,
      ad: 56,
      c: 56
    },
    bl: {
      ab: 57,
      b: 58
    },
    bj: {
      l: 59,
      k: 59,
      x: 59,
      a: 59,
      aj: 59,
      ac: 59,
      ag: 59,
      ae: 59,
      ai: 59,
      af: 59,
      ah: 59,
      t: 59,
      v: 59,
      ad: 59,
      c: 59,
      ab: 59,
      b: 59
    },
    be: {
      ah: 60,
      t: 61,
      v: 61
    },
    bm: {
      t: 62,
      v: 63
    },
    bo: {
      u: 64,
      y: 65
    },
    bp: {
      w: 66
    },
    bn: {
      w: 67,
      u: 68,
      t: 68
    },
    br: {
      u: 69,
      t: 70
    },
    bs: {
      s: 71,
      y: 72
    },
    bq: {
      u: 73,
      t: 73
    }
  };

  var AstNode = /*#__PURE__*/ (function() {
    function AstNode(cfg) {
      Object.assign(this, cfg);

      if (cfg.children) {
        this.setChildren(cfg.children);
      }
    }

    var _proto = AstNode.prototype;

    _proto.addChild = function addChild(c) {
      this.addChildren([c]);
    };

    _proto.addChildren = function addChildren(cs) {
      var _this$children;

      (_this$children = this.children).push.apply(_this$children, cs);

      this.setChildren(this.children);
    };

    _proto.setChildren = function setChildren(cs) {
      if (!cs.length) {
        this.children = [];
        return;
      }

      var first = cs[0];
      var last = cs[cs.length - 1];
      this.start = first.start;
      this.end = last.end;
      this.firstLine = first.firstLine;
      this.lastLine = last.lastLine;
      this.firstColumn = first.firstColumn;
      this.lastColumn = last.lastColumn;
      this.children = cs;

      for (
        var _iterator = _createForOfIteratorHelperLoose(cs), _step;
        !(_step = _iterator()).done;

      ) {
        var c = _step.value;
        c.parent = this;
      }
    };

    _proto.toJSON = function toJSON() {
      var ret = {};

      for (
        var _i = 0, _Object$keys = Object.keys(this);
        _i < _Object$keys.length;
        _i++
      ) {
        var k = _Object$keys[_i];

        if (k !== "parent" && k !== "t") {
          ret[k] = this[k];
        }
      }

      return ret;
    };

    return AstNode;
  })();

  parser.parse = function parse(input, options) {
    var recoveryTokens = [];
    var terminalNodes = [];

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
    var error;
    var _options = options,
      onErrorRecovery = _options.onErrorRecovery,
      _options$onAction = _options.onAction,
      onAction = _options$onAction === void 0 ? noop : _options$onAction,
      _options$lexerOptions = _options.lexerOptions,
      lexerOptions =
        _options$lexerOptions === void 0 ? {} : _options$lexerOptions;
    var lexer = parser.lexer,
      table = parser.table,
      productions = parser.productions,
      getProductionSymbol = parser.getProductionSymbol,
      getProductionRhs = parser.getProductionRhs,
      getProductionLabel = parser.getProductionLabel;
    lexer.options = lexerOptions;
    var symbolStack = [getProductionSymbol(productions[0])];
    var astStack = [
      new AstNode({
        children: []
      })
    ];
    lexer.resetInput(input);
    var token;
    var next;
    var currentToken;

    function getError() {
      var expected = getExpected();
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
        var children = [];

        for (
          var _iterator2 = _createForOfIteratorHelperLoose(ast.children),
            _step2;
          !(_step2 = _iterator2()).done;

        ) {
          var c = _step2.value;

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
        var child = ast.children[0];

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
      var ast = astStack[0] && astStack[0].children && astStack[0].children[0];

      if (ast) {
        astStack[0].children.forEach(function(a) {
          return delete a.parent;
        });
      }

      if (raw) {
        return ast;
      }

      return ast && cleanAst(ast);
    }

    var topSymbol;
    var errorNode;
    var lastSymbol;

    function popSymbolStack() {
      var last = symbolStack.pop();

      if (typeof last === "string") {
        lastSymbol = last;
      }
    }

    function getExpected() {
      var s = topSymbol || lastSymbol;
      var ret = (table[s] && Object.keys(table[s])) || [];
      return ret.map(function(r) {
        return lexer.mapReverseSymbol(r);
      });
    }

    function closeAstWhenError() {
      errorNode = new AstNode(
        _extends(
          {
            error: error
          },
          error.lexer
        )
      );
      peekStack(astStack).addChild(errorNode);

      while (astStack.length !== 1) {
        var _ast = astStack.pop();

        if (_ast.symbol && isExtraSymbol(_ast)) {
          var topAst = peekStack(astStack);
          topAst.children.pop();
          topAst.addChildren(_ast.children);
        }
      }
    }

    var production;

    while (1) {
      topSymbol = peekStack(symbolStack);

      if (!topSymbol) {
        break;
      }

      while (
        isProductionEndFlag(topSymbol) ||
        isProductionReductionFlag(topSymbol)
      ) {
        var _ast2 = astStack.pop();

        if (isProductionReductionFlag(topSymbol)) {
          var stackTop = peekStack(astStack);
          var wrap = new AstNode({
            symbol: _ast2.symbol,
            children: [_ast2],
            label: _ast2.label
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
          var terminalNode = new AstNode(token);
          terminalNodes.push(terminalNode);
          var parent = peekStack(astStack);
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
            var newAst = new AstNode({
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
            var recommendedAction = {};
            var nextToken = lexer.peek(); // should delete

            if (
              topSymbol === nextToken.t ||
              getTableVal(topSymbol, nextToken.t) !== undefined
            ) {
              recommendedAction.action = "del";
            } else if (error.expected.length) {
              recommendedAction.action = "add";
            }

            var _errorNode = new AstNode(
              _extends(
                {
                  error: error
                },
                error.lexer
              )
            );

            peekStack(astStack).addChild(_errorNode);
            var recovery =
              onErrorRecovery(
                {
                  errorNode: _errorNode,
                  ast: getAst(true)
                },
                recommendedAction
              ) || {};
            var action = recovery.action;
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
              token = _extends({}, token, {
                token: recovery.token,
                text: recovery.text,
                t: lexer.mapSymbol(recovery.token)
              });
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

    var ast = getAst();
    return {
      ast: ast,
      tokens: lexer.tokens,
      recoveryTokens: recoveryTokens,
      errorNode: errorNode,
      error: error,
      terminalNodes: terminalNodes
    };
  };

  return parser;
})();

if (typeof module !== "undefined") {
  module.exports = index;
}
