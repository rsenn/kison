/*
    Generated by kison.
  */
var cal = (function(undefined) {
  /* Generated by kison */
  var parser = {};
  /*jslint quotmark: false*/
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
    var self = this;

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
    self.rules = [];
    self.tokensQueue = [];

    mix(self, cfg);

    /*
     Input languages
     @type {String}
     */

    self.resetInput(self.input);
  };
  Lexer.prototype = {
    resetInput: function(input) {
      mix(this, {
        input: input,
        matched: "",
        stateStack: [Lexer.STATIC.INITIAL],
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
      return this.mapSymbol(Lexer.STATIC.END_TAG);
    },
    mapHiddenSymbol: function() {
      return this.mapSymbol(Lexer.STATIC.HIDDEN_TAG);
    },
    getCurrentRules: function() {
      var self = this,
        currentState = self.stateStack[self.stateStack.length - 1],
        rules = [];
      //#JSCOVERAGE_IF
      if (self.mapState) {
        currentState = self.mapState(currentState);
      }
      each(self.rules, function(r) {
        var state = r.state || r[3];
        if (!state) {
          if (currentState === Lexer.STATIC.INITIAL) {
            rules.push(r);
          }
        } else if (inArray(currentState, state)) {
          rules.push(r);
        }
      });
      return rules;
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
      var self = this,
        DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT,
        matched = self.matched,
        match = self.match,
        input = self.input;
      matched = matched.slice(0, matched.length - match.length);
      //#JSCOVERAGE_IF 0
      var past =
          (matched.length > DEBUG_CONTEXT_LIMIT ? "..." : "") +
          matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/g, " "),
        next = match + input;
      //#JSCOVERAGE_ENDIF
      next =
        next.slice(0, DEBUG_CONTEXT_LIMIT).replace(/\n/g, " ") +
        (next.length > DEBUG_CONTEXT_LIMIT ? "..." : "");
      return past + next + "\n" + new Array(past.length + 1).join("-") + "^";
    },
    mapSymbol: function(t) {
      return this.symbolMap[t];
    },
    mapReverseSymbol: function(rs) {
      var self = this,
        symbolMap = self.symbolMap,
        i,
        reverseSymbolMap = self.reverseSymbolMap;
      if (!reverseSymbolMap && symbolMap) {
        reverseSymbolMap = self.reverseSymbolMap = {};
        for (i in symbolMap) {
          reverseSymbolMap[symbolMap[i]] = i;
        }
      }
      //#JSCOVERAGE_IF
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
      var self = this,
        input = self.input,
        i,
        rule,
        m,
        ret,
        lines,
        rules = self.getCurrentRules();

      self.match = self.text = "";

      if (!input) {
        return {
          t: self.mapEndSymbol(),
          token: Lexer.STATIC.END_TAG,
          start: self.end,
          end: self.end,
          firstLine: self.lastLine,
          firstColumn: self.lastColumn,
          lastLine: self.lastLine,
          lastColumn: self.lastColumn
        };
      }

      for (i = 0; i < rules.length; i++) {
        rule = rules[i];
        //#JSCOVERAGE_IF 0
        var regexp = rule.regexp || rule[1],
          token = rule.token || rule[0],
          action = rule.action || rule[2] || undefined;
        //#JSCOVERAGE_ENDIF
        if ((m = input.match(regexp))) {
          self.start = self.end;
          self.end += m[0].length;
          lines = m[0].match(/\n.*/g);
          if (lines) {
            self.lineNumber += lines.length;
          }
          const position = {
            start: self.start,
            end: self.end,
            firstLine: self.lastLine,
            lastLine: self.lineNumber,
            firstColumn: self.lastColumn,
            lastColumn: lines
              ? lines[lines.length - 1].length - 1
              : self.lastColumn + m[0].length
          };
          mix(self, position);
          var match;
          // for error report
          match = self.match = m[0];

          // all matches
          self.matches = m;
          // may change by user
          self.text = match;
          // matched content utils now
          self.matched += match;
          ret = action && action.call(self);
          if (ret === undefined) {
            ret = token;
          } else {
            ret = self.mapSymbol(ret);
          }
          input = input.slice(match.length);
          self.input = input;

          if (ret) {
            self.token = self.mapReverseSymbol(ret);
            if (ret === self.mapHiddenSymbol() && skipHidden) {
              return self.lex();
            }
            return {
              text: self.text,
              token: self.token,
              t: ret,
              ...position
            };
          } else {
            // ignore
            return self.lex();
          }
        }
      }
    }
  };
  Lexer.STATIC = {
    INITIAL: "I",
    DEBUG_CONTEXT_LIMIT: 20,
    END_TAG: "$EOF",
    HIDDEN_TAG: "$HIDDEN"
  };
  var lexer = new Lexer({
    rules: [
      ["b", /^\s+/, 0],
      ["c", /^[0-9]+(\.[0-9]+)?\b/, 0],
      ["d", /^\+/, 0],
      ["e", /^-/, 0],
      ["f", /^\(/, 0],
      ["g", /^\)/, 0],
      ["h", /^\*/, 0],
      ["i", /^\//, 0],
      ["j", /^\^/, 0],
      ["k", /^./, 0]
    ]
  });
  parser.lexer = lexer;
  lexer.symbolMap = {
    $EOF: "a",
    $HIDDEN: "b",
    NUMBER: "c",
    "+": "d",
    "-": "e",
    "(": "f",
    ")": "g",
    "*": "h",
    "/": "i",
    "^": "j",
    ERROR_LA: "k",
    $START: "l",
    expression: "m",
    AddtiveExpression: "n",
    multiplicativeExpression: "o",
    primaryExpression: "p"
  };
  parser.productions = [
    ["l", ["m"]],
    ["m", ["n"]],
    ["n", ["o"]],
    [
      "n",
      ["n", "d", "o"],
      function() {
        return this.$1 + this.$3;
      }
    ],
    [
      "n",
      ["n", "e", "o"],
      function() {
        return this.$1 - this.$3;
      }
    ],
    ["o", ["p"]],
    [
      "o",
      ["o", "h", "p"],
      function() {
        return this.$1 * this.$3;
      }
    ],
    [
      "o",
      ["o", "i", "p"],
      function() {
        return this.$1 / this.$3;
      }
    ],
    [
      "p",
      ["f", "m", "g"],
      function() {
        return this.$2;
      }
    ],
    [
      "p",
      ["c"],
      function() {
        return Number(this.$1);
      }
    ]
  ];
  function peekStack(stack, n) {
    n = n || 1;
    return stack[stack.length - n];
  }
  var GrammarConst = {
    SHIFT_TYPE: 1,
    REDUCE_TYPE: 2,
    ACCEPT_TYPE: 0,
    TYPE_INDEX: 0,
    PRODUCTION_INDEX: 1,
    TO_INDEX: 2
  };
  parser.table = {
    gotos: {
      "0": {
        m: 3,
        n: 4,
        o: 5,
        p: 6
      },
      "2": {
        m: 7,
        n: 4,
        o: 5,
        p: 6
      },
      "8": {
        o: 13,
        p: 6
      },
      "9": {
        o: 14,
        p: 6
      },
      "10": {
        p: 15
      },
      "11": {
        p: 16
      }
    },
    action: {
      "0": {
        c: [1, undefined, 1],
        f: [1, undefined, 2]
      },
      "1": {
        a: [2, 9],
        d: [2, 9],
        e: [2, 9],
        h: [2, 9],
        i: [2, 9],
        g: [2, 9]
      },
      "2": {
        c: [1, undefined, 1],
        f: [1, undefined, 2]
      },
      "3": {
        a: [0]
      },
      "4": {
        a: [2, 1],
        g: [2, 1],
        d: [1, undefined, 8],
        e: [1, undefined, 9]
      },
      "5": {
        a: [2, 2],
        d: [2, 2],
        e: [2, 2],
        g: [2, 2],
        h: [1, undefined, 10],
        i: [1, undefined, 11]
      },
      "6": {
        a: [2, 5],
        d: [2, 5],
        e: [2, 5],
        h: [2, 5],
        i: [2, 5],
        g: [2, 5]
      },
      "7": {
        g: [1, undefined, 12]
      },
      "8": {
        c: [1, undefined, 1],
        f: [1, undefined, 2]
      },
      "9": {
        c: [1, undefined, 1],
        f: [1, undefined, 2]
      },
      "10": {
        c: [1, undefined, 1],
        f: [1, undefined, 2]
      },
      "11": {
        c: [1, undefined, 1],
        f: [1, undefined, 2]
      },
      "12": {
        a: [2, 8],
        d: [2, 8],
        e: [2, 8],
        h: [2, 8],
        i: [2, 8],
        g: [2, 8]
      },
      "13": {
        a: [2, 3],
        d: [2, 3],
        e: [2, 3],
        g: [2, 3],
        h: [1, undefined, 10],
        i: [1, undefined, 11]
      },
      "14": {
        a: [2, 4],
        d: [2, 4],
        e: [2, 4],
        g: [2, 4],
        h: [1, undefined, 10],
        i: [1, undefined, 11]
      },
      "15": {
        a: [2, 6],
        d: [2, 6],
        e: [2, 6],
        h: [2, 6],
        i: [2, 6],
        g: [2, 6]
      },
      "16": {
        a: [2, 7],
        d: [2, 7],
        e: [2, 7],
        h: [2, 7],
        i: [2, 7],
        g: [2, 7]
      }
    }
  };
  parser.parse = function parse(input, options) {
    options = options || {};
    var { onErrorRecovery } = options;
    var filename = options.filename;
    var state, token, ret, action, $;
    var self = this;
    var lexer = self.lexer;
    var table = self.table;
    var gotos = table.gotos;
    var tableAction = table.action;
    var productions = self.productions;
    // for debug info
    var prefix = filename ? "in file: " + filename + " " : "";
    var valueStack = [];
    var stateStack = [0];
    var symbolStack = [];
    lexer.resetInput(input);
    while (1) {
      // retrieve state number from top of stack
      state = peekStack(stateStack);
      if (!token) {
        token = lexer.lex();
      }
      if (token) {
        // read action for current state and first input
        action = tableAction[state] && tableAction[state][token.t];
      } else {
        action = null;
      }

      if (!action) {
        const map = [];
        map[GrammarConst.SHIFT_TYPE] = "shift";
        map[GrammarConst.REDUCE_TYPE] = "reduce";
        map[GrammarConst.ACCEPT_TYPE] = "accept";
        var expectedInfo = [];
        var expected = {};
        //#JSCOVERAGE_IF
        if (tableAction[state]) {
          each(tableAction[state], function(v, symbolForState) {
            action = v[GrammarConst.TYPE_INDEX];
            const actionStr = map[action];
            const arr = (expected[actionStr] = expected[actionStr] || []);
            const s = self.lexer.mapReverseSymbol(symbolForState);
            arr.push(s);
            expectedInfo.push(actionStr + ":" + s);
          });
        }
        const error =
          prefix +
          "syntax error at line " +
          lexer.lineNumber +
          ":\n" +
          lexer.showDebugInfo() +
          "\n" +
          "expect " +
          expectedInfo.join(", ");
        throw new Error(error);
      }

      switch (action[GrammarConst.TYPE_INDEX]) {
        case GrammarConst.SHIFT_TYPE:
          symbolStack.push(token.t);
          valueStack.push(lexer.text);
          // push state
          stateStack.push(action[GrammarConst.TO_INDEX]);
          // allow to read more
          token = null;
          break;

        case GrammarConst.REDUCE_TYPE:
          var production = productions[action[GrammarConst.PRODUCTION_INDEX]];
          var reducedSymbol = production.symbol || production[0];
          var reducedAction = production.action || production[2];
          var reducedRhs = production.rhs || production[1];
          var len = reducedRhs.length;
          $ = peekStack(valueStack, len); // default to $ = $1
          ret = undefined;
          self.$ = $;
          for (var i = 0; i < len; i++) {
            self["$" + (len - i)] = peekStack(valueStack, i + 1);
          }
          if (reducedAction) {
            ret = reducedAction.call(self);
          }
          if (ret !== undefined) {
            $ = ret;
          } else {
            $ = self.$;
          }
          var reverseIndex = len * -1;
          stateStack.splice(reverseIndex, len);
          valueStack.splice(reverseIndex, len);
          symbolStack.splice(reverseIndex, len);
          symbolStack.push(reducedSymbol);
          valueStack.push($);
          var newState = gotos[peekStack(stateStack)][reducedSymbol];
          stateStack.push(newState);
          break;

        case GrammarConst.ACCEPT_TYPE:
          return $;
      }
    }
  };

  return parser;
})();

export default cal;
