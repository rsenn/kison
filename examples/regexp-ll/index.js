/*
Generated By kison v0.4.9

Generate time: Wed Jul 21 2021 19:08:07 GMT+0800 (中国标准时间)
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
    this.rules = [].concat(this.rules);
    this.userData = {};
    var errorRule = (this.errorRule = {
      regexp: /^./,
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
  };

  Lexer.prototype = {
    resetInput: function resetInput(input) {
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
          matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/g, " "),
        next = match + input; //#JSCOVERAGE_ENDIF

      next =
        next.slice(0, DEBUG_CONTEXT_LIMIT).replace(/\n/g, " ") +
        (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
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
    peek: function peek(skipHidden) {
      var token = this.lex(skipHidden, true);

      if (this.tokensQueue.indexOf(token) === -1) {
        this.tokensQueue.push(token);
      }

      return token;
    },
    lex: function lex(skipHidden, reserveQueue) {
      if (skipHidden === undefined) {
        skipHidden = true;
      }

      var tokensQueue = this.tokensQueue;

      if (reserveQueue) {
        for (var _i = 0; _i < tokensQueue.length; _i++) {
          var _token = tokensQueue[_i];

          if (skipHidden && _token.t === this.mapHiddenSymbol()) {
            continue;
          }

          return _token;
        }
      } else {
        while (tokensQueue.length) {
          var _token2 = tokensQueue.shift();

          if (skipHidden && _token2.t === this.mapHiddenSymbol()) {
            continue;
          }

          return _token2;
        }
      }

      var i,
        rule,
        m,
        ret,
        lines,
        rules = this.getCurrentRules();
      var _this$env = this.env,
        env = _this$env === void 0 ? this.defaultEnv : _this$env,
        input = this.input;
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

        if (env && typeof regexp.test !== "function") {
          regexp = regexp[env];
        }

        if (!regexp) {
          continue;
        } //#JSCOVERAGE_ENDIF

        if ((m = input.match(regexp))) {
          this.start = this.end;
          this.end += m[0].length;
          lines = m[0].match(/\n.*/g);

          if (lines) {
            this.lineNumber += lines.length;
          }

          var position = {
            start: this.start,
            end: this.end,
            firstLine: this.lastLine,
            lastLine: this.lineNumber,
            firstColumn: this.lastColumn,
            lastColumn: lines
              ? lines[lines.length - 1].length - 1
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

            if (ret === this.mapHiddenSymbol() && skipHidden) {
              return this.lex();
            }

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
      ["a", /^\\w/],
      ["b", /^\\W/],
      ["c", /^\\d/],
      ["d", /^\\D/],
      ["e", /^\?/],
      ["f", /^\*/],
      ["g", /^\+/],
      ["h", /^\?/],
      ["i", /^\\\d+/],
      ["j", /^\\b/],
      ["k", /^\\B/],
      ["l", /^\\A/],
      ["m", /^\\z/],
      ["n", /^\\Z/],
      ["o", /^\\G/],
      ["p", /^\$/],
      ["q", /^\d+/],
      ["r", /^,/],
      ["s", /^\^/],
      ["t", /^\?:/],
      ["u", /^\(/],
      ["v", /^\)/],
      ["w", /^\{/],
      ["x", /^\}/],
      ["y", /^\[/],
      ["z", /^\]/],
      ["aa", /^\-/],
      ["ab", /^\|/],
      ["ac", /^\./],
      ["ad", /^[\x09\x0a\x0d\x20-\ud7ff\ue000-\ufffd\u10000-\u10ffff]/]
    ],
    isCompress: 1,
    defaultEnv: undefined
  });
  var parser = {
    productions: [
      ["ae", ["s", "af"]],
      ["ae", ["af"]],
      ["ag", ["ab", "ah", "ag"]],
      ["ag", []],
      ["af", ["ah", "ag"]],
      ["ai", ["aj", "ai"]],
      ["ai", []],
      ["ah", ["aj", "ai"]],
      ["aj", ["ak"]],
      ["aj", ["al"]],
      ["aj", ["am"]],
      ["aj", ["i"]],
      ["al", ["u", "an"]],
      ["ao", ["ap"]],
      ["ao", []],
      ["an", ["af", "v", "ao"]],
      ["an", ["t", "af", "v", "ao"]],
      ["aq", []],
      ["aq", ["ap"]],
      ["ak", ["ar", "aq"]],
      ["ar", ["ac"]],
      ["ar", ["as"]],
      ["ar", ["ad"]],
      ["as", ["at"]],
      ["as", ["au"]],
      ["av", ["aw", "av"]],
      ["av", []],
      ["ax", ["aw", "av"]],
      ["ay", ["ax", "z"]],
      ["ay", ["s", "ax", "z"]],
      ["at", ["y", "ay"]],
      ["aw", ["au"]],
      ["aw", ["az"]],
      ["au", ["a"]],
      ["au", ["b"]],
      ["au", ["c"]],
      ["au", ["d"]],
      ["ba", ["aa", "ad"]],
      ["ba", []],
      ["az", ["ad", "ba"]],
      ["bb", []],
      ["bb", ["bc"]],
      ["ap", ["bd", "bb"]],
      ["bc", ["e"]],
      ["bd", ["f"]],
      ["bd", ["g"]],
      ["bd", ["h"]],
      ["bd", ["be"]],
      ["bf", ["r", "q", "x"]],
      ["bf", ["x"]],
      ["bd", ["w", "q", "bf"]],
      ["am", ["j"]],
      ["am", ["k"]],
      ["am", ["l"]],
      ["am", ["m"]],
      ["am", ["n"]],
      ["am", ["o"]],
      ["am", ["p"]]
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
    characterClassAnyWord: "a",
    characterClassAnyWordInverted: "b",
    characterClassAnyDecimalDigit: "c",
    characterClassAnyDecimalDigitInverted: "d",
    lazyModifier: "e",
    zeroOrMoreQuantifier: "f",
    oneOrMoreQuantifier: "g",
    zeroOrOneQuantifier: "h",
    backreference: "i",
    anchorWordBoundary: "j",
    anchorNonWordBoundary: "k",
    anchorStartOfStringOnly: "l",
    anchorEndOfStringOnlyNotNewline: "m",
    anchorEndOfStringOnly: "n",
    anchorPreviousMatchEnd: "o",
    anchorEndOfString: "p",
    int: "q",
    ",": "r",
    "^": "s",
    "?:": "t",
    "(": "u",
    ")": "v",
    "{": "w",
    "}": "x",
    "[": "y",
    "]": "z",
    "-": "aa",
    "|": "ab",
    matchAnyCharacter: "ac",
    char: "ad",
    Regexp: "ae",
    Expression: "af",
    Expression_: "ag",
    SubExpression: "ah",
    SubExpression_: "ai",
    ExpressionItem: "aj",
    Match: "ak",
    Group: "al",
    Anchor: "am",
    _Group: "an",
    __Group: "ao",
    Quantifier: "ap",
    _Match: "aq",
    MatchItem: "ar",
    MatchCharacterClass: "as",
    CharacterGroup: "at",
    CharacterClass: "au",
    CharacterGroupInner_: "av",
    CharacterGroupItem: "aw",
    CharacterGroupInner: "ax",
    _CharacterGroup: "ay",
    CharacterRange: "az",
    _CharacterRange: "ba",
    _Quantifier: "bb",
    LazyModifier: "bc",
    QuantifierType: "bd",
    RangeQuantifier: "be",
    _QuantifierType: "bf"
  };
  var productionSkipEndSet = new Set([
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
    37,
    38,
    40,
    41,
    48,
    49
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
    ae: {
      s: 0,
      ac: 1,
      y: 1,
      a: 1,
      b: 1,
      c: 1,
      d: 1,
      ad: 1,
      u: 1,
      j: 1,
      k: 1,
      l: 1,
      m: 1,
      n: 1,
      o: 1,
      p: 1,
      i: 1
    },
    ag: {
      ab: 2,
      $EOF: 3,
      v: 3
    },
    af: {
      ac: 4,
      y: 4,
      a: 4,
      b: 4,
      c: 4,
      d: 4,
      ad: 4,
      u: 4,
      j: 4,
      k: 4,
      l: 4,
      m: 4,
      n: 4,
      o: 4,
      p: 4,
      i: 4
    },
    ai: {
      ac: 5,
      y: 5,
      a: 5,
      b: 5,
      c: 5,
      d: 5,
      ad: 5,
      u: 5,
      j: 5,
      k: 5,
      l: 5,
      m: 5,
      n: 5,
      o: 5,
      p: 5,
      i: 5,
      ab: 6,
      $EOF: 6,
      v: 6
    },
    ah: {
      ac: 7,
      y: 7,
      a: 7,
      b: 7,
      c: 7,
      d: 7,
      ad: 7,
      u: 7,
      j: 7,
      k: 7,
      l: 7,
      m: 7,
      n: 7,
      o: 7,
      p: 7,
      i: 7
    },
    aj: {
      ac: 8,
      y: 8,
      a: 8,
      b: 8,
      c: 8,
      d: 8,
      ad: 8,
      u: 9,
      j: 10,
      k: 10,
      l: 10,
      m: 10,
      n: 10,
      o: 10,
      p: 10,
      i: 11
    },
    al: {
      u: 12
    },
    ao: {
      f: 13,
      g: 13,
      h: 13,
      w: 13,
      ac: 14,
      y: 14,
      a: 14,
      b: 14,
      c: 14,
      d: 14,
      ad: 14,
      u: 14,
      j: 14,
      k: 14,
      l: 14,
      m: 14,
      n: 14,
      o: 14,
      p: 14,
      i: 14,
      ab: 14,
      $EOF: 14,
      v: 14
    },
    an: {
      ac: 15,
      y: 15,
      a: 15,
      b: 15,
      c: 15,
      d: 15,
      ad: 15,
      u: 15,
      j: 15,
      k: 15,
      l: 15,
      m: 15,
      n: 15,
      o: 15,
      p: 15,
      i: 15,
      t: 16
    },
    aq: {
      ac: 17,
      y: 17,
      a: 17,
      b: 17,
      c: 17,
      d: 17,
      ad: 17,
      u: 17,
      j: 17,
      k: 17,
      l: 17,
      m: 17,
      n: 17,
      o: 17,
      p: 17,
      i: 17,
      ab: 17,
      $EOF: 17,
      v: 17,
      f: 18,
      g: 18,
      h: 18,
      w: 18
    },
    ak: {
      ac: 19,
      y: 19,
      a: 19,
      b: 19,
      c: 19,
      d: 19,
      ad: 19
    },
    ar: {
      ac: 20,
      y: 21,
      a: 21,
      b: 21,
      c: 21,
      d: 21,
      ad: 22
    },
    as: {
      y: 23,
      a: 24,
      b: 24,
      c: 24,
      d: 24
    },
    av: {
      a: 25,
      b: 25,
      c: 25,
      d: 25,
      ad: 25,
      z: 26
    },
    ax: {
      a: 27,
      b: 27,
      c: 27,
      d: 27,
      ad: 27
    },
    ay: {
      a: 28,
      b: 28,
      c: 28,
      d: 28,
      ad: 28,
      s: 29
    },
    at: {
      y: 30
    },
    aw: {
      a: 31,
      b: 31,
      c: 31,
      d: 31,
      ad: 32
    },
    au: {
      a: 33,
      b: 34,
      c: 35,
      d: 36
    },
    ba: {
      aa: 37,
      a: 38,
      b: 38,
      c: 38,
      d: 38,
      ad: 38,
      z: 38
    },
    az: {
      ad: 39
    },
    bb: {
      ac: 40,
      y: 40,
      a: 40,
      b: 40,
      c: 40,
      d: 40,
      ad: 40,
      u: 40,
      j: 40,
      k: 40,
      l: 40,
      m: 40,
      n: 40,
      o: 40,
      p: 40,
      i: 40,
      ab: 40,
      $EOF: 40,
      v: 40,
      e: 41
    },
    ap: {
      f: 42,
      g: 42,
      h: 42,
      w: 42
    },
    bc: {
      e: 43
    },
    bd: {
      f: 44,
      g: 45,
      h: 46,
      w: 50
    },
    bf: {
      r: 48,
      x: 49
    },
    am: {
      j: 51,
      k: 52,
      l: 53,
      m: 54,
      n: 55,
      o: 56,
      p: 57
    }
  };

  parser.parse = function parse(input, options) {
    var tokens = [];
    var recoveryTokens = [];
    var terminalNodes = [];

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
          var _i2 = 0, _Object$keys = Object.keys(this);
          _i2 < _Object$keys.length;
          _i2++
        ) {
          var k = _Object$keys[_i2];

          if (k !== "parent" && k !== "t") {
            ret[k] = this[k];
          }
        }

        return ret;
      };

      return AstNode;
    })();

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
      lexerEnv = _options.lexerEnv;
    var lexer = this.lexer,
      table = this.table,
      productions = this.productions,
      getProductionSymbol = this.getProductionSymbol,
      getProductionRhs = this.getProductionRhs,
      getProductionLabel = this.getProductionLabel;
    lexer.env = lexerEnv;
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
          tokens.push(token);
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
      tokens: tokens,
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
