/*
Generated By kison v0.5.5

Generate time: Tue Oct 12 2021 11:50:44 GMT+0800 (中国标准时间)
*/
var $parser = (function (undefined) {
  var AstNode = class AstNode {
    parent = null;
    symbol = undefined;
    label = undefined;
    type = undefined;

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
        if (k !== 'parent' && k !== 't') {
          ret[k] = this[k];
        }
      }
      return ret;
    }
  };
  var filterRhs = function (rhs) {
    return rhs.filter((r) => typeof r === 'string');
  };
  var isExtraAstNode = function (ast) {
    return ast.children && !ast.children.length;
  };
  var peekStack = function (stack, n) {
    n = n || 1;
    return stack[stack.length - n];
  };
  var getOriginalSymbol = function (s) {
    let uncompressed = lexer.mapReverseSymbol(s);
    return parser.prioritySymbolMap[uncompressed] || uncompressed;
  };
  var closeAstWhenError = function (error, astStack) {
    const errorNode = new AstNode({
      type: 'token',
      error,
      ...error.lexer,
    });
    peekStack(astStack).addChild(errorNode);
    while (astStack.length !== 1) {
      const ast = astStack.pop();
      if (ast.symbol && isExtraAstNode(ast)) {
        const topAst = peekStack(astStack);
        topAst.children.pop();
        topAst.addChildren(ast.children);
      }
    }
    return errorNode;
  };
  var pushRecoveryTokens = function (recoveryTokens, token) {
    const { EOF_TOKEN } = Lexer.STATIC;
    let eof;
    if (recoveryTokens[recoveryTokens.length - 1]?.token === EOF_TOKEN) {
      eof = recoveryTokens.pop();
    }
    recoveryTokens.push(token);
    if (eof && token.token !== EOF_TOKEN) {
      recoveryTokens.push(eof);
    }
  };
  var getParseError = function (getExpected) {
    const expected = getExpected();
    const tips = [];
    if (expected.length) {
      tips.push("'" + expected.join("', '") + "' expected.");
    }
    tips.push("current token: '" + lexer.getCurrentToken().token + "'.");
    const tip = tips.join('\n');
    return {
      errorMessage: [
        'syntax error at line ' +
          lexer.lineNumber +
          ':\n' +
          lexer.showDebugInfo(),
        ...tips,
      ].join('\n'),
      tip,
    };
  };
  var cleanAst = function (ast, transformNode) {
    if (!transformNode) {
      return ast;
    }
    if (ast.children) {
      let children;
      let childrenChanged;
      while (true) {
        let changed = false;
        let index = 0;
        children = [];
        for (const c of ast.children) {
          const node = transformNode({
            node: c,
            index,
            parent: ast,
            defaultTransformNode: defaultTransformAstNode,
          });
          if (Array.isArray(node)) {
            children.push(...node);
          } else if (node) {
            children.push(node);
          }
          changed = changed || node !== c;
          index++;
        }
        if (!changed) {
          break;
        } else {
          ast.setChildren(children);
          childrenChanged = true;
        }
      }
      if (childrenChanged && ast.parent) {
        cleanAst(ast.parent, transformNode);
      } else {
        for (const c of children) {
          cleanAst(c, transformNode);
        }
      }
    }
    return ast;
  };
  var getAstRootNode = function (astStack, transformNode, raw) {
    let ast = astStack[0];
    ast = ast?.children?.[0];
    ast = ast?.children?.[0];
    if (ast) {
      ast.parent = null;
    }
    if (raw) {
      return ast;
    }
    return ast && cleanAst(ast, transformNode);
  };
  var checkProductionLabelIsSame = function (node, parent) {
    if (node.label || parent.label) {
      if (node.label === parent.label) {
        return node.children;
      }
      return node;
    }
    return node.children;
  };
  var defaultTransformAstNode = function ({ node, parent }) {
    if (node.token || node.error || node.symbol !== parent.symbol) {
      return node;
    }
    if (parent.children.length === 1) {
      // do not check label
      // replace label!
      parent.label = node.label;
      return node.children;
    }
    if (node.children.length > 1) {
      return node;
    }
    // drill down to token
    if (node.children[0]?.token) {
      // do not check label
      // parent.label = node.label;
      return node.children;
    }
    return checkProductionLabelIsSame(node, parent);
  };
  var isAddAstNodeFlag = function (t) {
    return t === productionAddAstNodeFlag;
  };
  var isProductionEndFlag = function (t) {
    return t === productionEndFlag;
  };
  var isOneOrMoreSymbol = function (s) {
    return typeof s === 'string' && s.length > 1 && s.endsWith('+');
  };
  var isOptionalSymbol = function (s) {
    return typeof s === 'string' && s.length > 1 && s.endsWith('?');
  };
  var normalizeSymbol = function (s) {
    return isOptionalSymbol(s) || isZeroOrMoreSymbol(s) || isOneOrMoreSymbol(s)
      ? s.slice(0, -1)
      : s;
  };
  var isZeroOrMoreSymbol = function (s) {
    return typeof s === 'string' && s.length > 1 && s.endsWith('*');
  };
  var rootSmUnit = undefined;
  var productionSkipAstNodeSet = undefined;
  var symbolStack = [{}];
  var productionsBySymbol = {};
  var cachedStateMatchMap = undefined;
  var productionAddAstNodeFlag = 1;
  var productionEndFlag = 2;
  var Lexer = function (cfg) {
    this.nextTokens = [];
    if (Lexer.supportSticky === undefined) {
      try {
        Lexer.supportSticky = typeof /(?:)/.sticky == 'boolean';
      } catch (e) {
        Lexer.supportSticky = false;
      }
    }

    const ruleIndexMap = (this.ruleIndexMap = {
      token: 0,
      regexp: 1,
      action: 2,
      filter: 3,
      state: 4,
    });
    const STATIC = Lexer.STATIC;
    this.tokenSet = new Set([
      STATIC.EOF_TOKEN,
      STATIC.UNKNOWN_TOKEN,
      STATIC.HIDDEN_TOKEN,
    ]);
    this.rules = [];
    this.defaultEnv = undefined;
    Object.assign(this, cfg);
    this.rules = this.rules.concat();

    this.regexpIndex = this.isCompress ? this.ruleIndexMap.regexp : 'regexp';
    this.getRuleItem = this.isCompress
      ? this.getRuleItemCompress
      : this.getRuleItemNoCompress;

    this.transformRules();
    this.userData = {};
    const errorRule = (this.errorRule = {
      regexp: this.matchAny,
      token: Lexer.STATIC.UNKNOWN_TOKEN,
    });
    for (const rule of this.rules) {
      const token = this.getRuleItem(rule, 'token');
      if (token) {
        this.tokenSet.add(token);
      }
    }
    if (this.isCompress) {
      const errorRuleCompress = (this.errorRule = []);
      errorRuleCompress[ruleIndexMap.token] = errorRule.token;
      errorRuleCompress[ruleIndexMap.regexp] = errorRule.regexp;
    }
    this.resetInput(this.input);
    this.options = {};
  };
  Lexer.prototype = {
    transformRegExp: function (obj, p, disableSticky) {
      const pattern = obj[p];
      if (pattern.test) {
        let source = pattern.source;
        if (source.startsWith('^')) {
          source = source.slice(1);
        }
        var flags = Lexer.supportSticky && !disableSticky ? 'gy' : 'g';
        if (pattern.multiline) flags += 'm';
        if (pattern.ignoreCase) flags += 'i';
        if (pattern.unicode) flags += 'u';
        obj[p] = new RegExp(source, flags);
      } else if (typeof pattern === 'object') {
        for (const k of Object.keys(pattern)) {
          this.transformRegExp(pattern, k);
        }
      }
    },
    hasToken: function (t) {
      return this.tokenSet.has(t);
    },
    transformRules: function () {
      if (Lexer.supportSticky) {
        const { regexpIndex } = this;
        for (const r of this.rules) {
          this.transformRegExp(r, regexpIndex);
        }
      }
    },
    matchAny: function () {
      return this.end < this.input.length ? this.input.charAt(this.end) : false;
    },
    addRule: function (rule) {
      this.rules.push(rule);
      const token = this.getRuleItem(rule, 'token');
      if (token) {
        this.tokenSet.add(token);
      }
    },
    resetInput: function (input) {
      this.token = undefined;
      this.tokensQueue = [];
      this.nextTokens = [];
      this.tokens = [];
      this.userData = {};
      this.input = input;
      this.matched = '';
      this.stateStack = [Lexer.STATIC.INITIAL_STATE];
      this.match = '';
      this.text = '';
      this.firstLine = 1;
      this.lineNumber = 1;
      this.lastLine = 1;
      this.start = 0;
      this.end = 0;
      this.firstColumn = 1;
      this.lastColumn = 1;
    },
    getRuleItemNoCompress: function (rule, itemType) {
      return rule[itemType];
    },
    getRuleItemCompress: function (rule, itemType) {
      return rule[this.ruleIndexMap[itemType]];
    },
    getCurrentRules: function () {
      var currentState = this.stateStack[this.stateStack.length - 1],
        rules = [];
      for (const r of this.rules) {
        var filter = this.getRuleItem(r, 'filter');
        if (filter) {
          if (filter.call(this)) {
            rules.push(r);
          }
          continue;
        }
        var state = this.getRuleItem(r, 'state');
        if (!state) {
          if (currentState === Lexer.STATIC.INITIAL_STATE) {
            rules.push(r);
          }
        } else if (state.indexOf(currentState) !== -1) {
          rules.push(r);
        }
      }
      rules.push(this.errorRule);
      return rules;
    },
    peekState: function (n) {
      n = n || 1;
      return this.mapReverseState(this.stateStack[this.stateStack.length - n]);
    },
    pushState: function (state) {
      this.stateStack.push(this.mapState(state));
    },
    popState: function (num) {
      num = num || 1;
      var ret;
      while (num--) {
        ret = this.stateStack.pop();
      }
      return ret && this.mapReverseState(ret);
    },
    showDebugInfo: function () {
      var { DEBUG_CONTEXT_LIMIT } = Lexer.STATIC;
      var { matched, match, input } = this;

      matched = matched.slice(0, matched.length - match.length);
      var past =
          (matched.length > DEBUG_CONTEXT_LIMIT ? '...' : '') +
          matched
            .slice(0 - DEBUG_CONTEXT_LIMIT)
            .split('\n')
            .join(' '),
        next = match + input.slice(this.end);
      //#JSCOVERAGE_ENDIF
      next =
        next.slice(0, DEBUG_CONTEXT_LIMIT).split('\n').join(' ') +
        (next.length > DEBUG_CONTEXT_LIMIT ? '...' : '');
      return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
    },
    mapSymbol: function (t) {
      return this.symbolMap[t] || t;
    },
    mapReverseSymbol: function (rs) {
      var { symbolMap, reverseSymbolMap } = this;
      if (!reverseSymbolMap && symbolMap) {
        reverseSymbolMap = this.reverseSymbolMap = {};
        for (var i of Object.keys(symbolMap)) {
          reverseSymbolMap[symbolMap[i]] = i;
        }
      }
      const nrs = normalizeSymbol(rs);
      if (nrs === rs) {
        return (reverseSymbolMap && reverseSymbolMap[rs]) || rs;
      } else {
        return (
          ((reverseSymbolMap && reverseSymbolMap[nrs]) || nrs) + rs.slice(-1)
        );
      }
    },
    mapState: function (t) {
      return this.stateMap[t] || t;
    },
    mapReverseState: function (rs) {
      var { stateMap, reverseStateMap } = this;
      if (!reverseStateMap && stateMap) {
        reverseStateMap = this.reverseStateMap = {};
        for (var i of Object.keys(stateMap)) {
          reverseStateMap[stateMap[i]] = i;
        }
      }
      return (reverseStateMap && reverseStateMap[rs]) || rs;
    },
    toJSON: function () {
      const currentToken = this.getCurrentToken();
      return {
        text: currentToken.text,
        firstLine: currentToken.firstLine,
        firstColumn: currentToken.firstColumn,
        lastLine: currentToken.lastLine,
        lastColumn: currentToken.lastColumn,
        token: currentToken.token,
        start: currentToken.start,
        end: currentToken.end,
      };
    },
    stash: function () {
      this.stashIndex = this.tokens.length;
    },
    stashPop: function () {
      this.nextTokens = [
        ...this.tokens.slice(this.stashIndex),
        ...this.nextTokens,
      ];
      this.tokens.length = this.stashIndex;
    },
    matchRegExp: function (regexp) {
      if (regexp.test) {
        regexp.lastIndex = this.end;
        const ret = regexp.exec(this.input);
        if (ret && ret.index !== this.end) {
          return null;
        }
        return ret;
      }
      return regexp.call(this, this);
    },
    pushToken: function (token) {
      const tokens = this.tokens;
      if (tokens[tokens.length - 1]?.token === Lexer.STATIC.EOF_TOKEN) {
        tokens.pop();
      }
      tokens.push(token);
    },
    lex: function () {
      const { EOF_TOKEN, HIDDEN_TOKEN } = Lexer.STATIC;

      const token = this.nextToken();
      const tokens = this.tokens;
      const lastToken = tokens[tokens.length - 1];
      if (
        lastToken &&
        token.token === EOF_TOKEN &&
        lastToken.token === EOF_TOKEN
      ) {
        return token;
      }
      this.tokens.push(token);
      if (token.token === HIDDEN_TOKEN || !token.token) {
        return this.lex();
      }
      return token;
    },
    getCurrentToken: function () {
      if (this.tokens[this.tokens.length - 1]) {
        return this.tokens[this.tokens.length - 1];
      }
      return this.lex();
    },
    getLastToken: function () {
      return this.tokens[this.tokens.length - 2] || this.getCurrentToken();
    },
    nextChar: function (index = 0) {
      return this.getChar(this.end + index);
    },
    nextCharCode: function (index = 0) {
      return this.getCharCode(this.end + index);
    },
    nextStartsWith: function (search) {
      let { input, end } = this;
      const l = search.length;
      for (let i = 0; i < l; i++) {
        if (input.charAt(end++) !== search.charAt(i)) {
          return false;
        }
      }
      return true;
    },
    nextCharAt: function (index) {
      return this.input.charAt(this.end + index);
    },
    nextLength: function () {
      return this.input.length - this.end;
    },
    getChar: function (index = 0) {
      if (this.options.unicode) {
        const code = this.input.codePointAt(index);
        if (code === undefined || isNaN(code)) {
          return '';
        }
        return String.fromCodePoint(code);
      }
      return this.input.charAt(index);
    },
    getCharCode: function (index = 0) {
      if (this.options.unicode) {
        return this.input.codePointAt(index);
      }
      return this.input.charCodeAt(index);
    },
    getTokensLength: function () {
      return this.tokens.length;
    },
    nextToken: function () {
      if (this.nextTokens.length) {
        return this.nextTokens.shift();
      }
      var i,
        rule,
        m,
        ret,
        lines,
        rules = this.getCurrentRules();

      var { input } = this;

      var { env = this.defaultEnv } = this.options;

      this.match = this.text = '';

      if (this.end >= input.length) {
        this.token = Lexer.STATIC.EOF_TOKEN;
        this.start = this.end;
        this.firstLine = this.lastLine;
        this.firstColumn = this.lastColumn;
        return {
          text: '',
          t: this.mapSymbol(this.token),
          token: this.token,
          start: this.start,
          end: this.end,
          firstLine: this.firstLine,
          firstColumn: this.firstColumn,
          lastLine: this.lastLine,
          lastColumn: this.lastColumn,
        };
      }

      for (i = 0; i < rules.length; i++) {
        rule = rules[i];
        var regexp = this.getRuleItem(rule, 'regexp'),
          token = this.getRuleItem(rule, 'token'),
          action = this.getRuleItem(rule, 'action');

        if (
          typeof regexp !== 'function' &&
          regexp &&
          env &&
          typeof regexp.test !== 'function'
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
          lines = m[0].split('\n');
          lines.shift();
          this.lineNumber += lines.length;
          const position = {
            start: this.start,
            end: this.end,
            firstLine: this.lastLine,
            lastLine: this.lineNumber,
            firstColumn: this.lastColumn,
            lastColumn: lines.length
              ? lines[lines.length - 1].length + 1
              : this.lastColumn + m[0].length,
          };

          Object.assign(this, position);

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

          if (ret) {
            this.token = this.mapReverseSymbol(ret);
            return {
              text: this.text,
              token: this.token,
              t: ret,
              ...position,
            };
          } else {
            // ignore
            return this.nextToken();
          }
        }
      }
    },
  };
  Lexer.STATIC = {
    INITIAL_STATE: 'I',
    DEBUG_CONTEXT_LIMIT: 20,
    EOF_TOKEN: '$EOF',
    UNKNOWN_TOKEN: '$UNKNOWN',
    HIDDEN_TOKEN: '$HIDDEN',
  };
  var lexer = new Lexer({
    rules: [
      ['a', /\s+/g],
      ['b', /[0-9]+(\.[0-9]+)?\b/g],
      ['c', /\^/g],
      ['d', /\-/g],
      ['e', /\*/g],
      ['f', /\//g],
      ['g', /\+/g],
      ['h', /\(/g],
      ['i', /\)/g],
    ],
    isCompress: 1,
    defaultEnv: undefined,
  });
  lexer.stateMap = {
    I: 'I',
  };
  function lex(input, options = {}) {
    lexer.options = options;
    lexer.resetInput(input);
    const { state } = options;
    if (state) {
      if (state.userData) {
        lexer.userData = state.userData;
      }
      if (state.stateStack) {
        lexer.stateStack = state.stateStack;
      }
    }
    while (lexer.lex().token !== Lexer.STATIC.EOF_TOKEN);
    return {
      state: {
        userData: lexer.userData,
        stateStack: lexer.stateStack,
      },
      tokens: lexer.tokens,
    };
  }
  var parser = {
    productions: [
      ['j', ['k']],
      ['k', ['l']],
      [
        'k',
        ['k', 'c', 'k'],
        function () {
          return {
            v: Math.pow(this.$1.v, this.$3.v),
            l: this.$1,
            r: this.$3,
            op: '^',
          };
        },
      ],
      [
        'k',
        ['k', 'd', 'k'],
        function () {
          return { v: this.$1.v - this.$3.v, l: this.$1, r: this.$3, op: '-' };
        },
      ],
      [
        'k',
        ['k', 'e', 'k'],
        function () {
          return { v: this.$1.v * this.$3.v, l: this.$1, r: this.$3, op: '*' };
        },
      ],
      [
        'k',
        ['k', 'f', 'k'],
        function () {
          return { v: this.$1.v / this.$3.v, l: this.$1, r: this.$3, op: '/' };
        },
      ],
      [
        'k',
        ['d', 'k'],
        function () {
          return { v: -this.$2.v, op: 'UMINUS' };
        },
      ],
      [
        'k',
        ['k', 'g', 'k'],
        function () {
          return { v: this.$1.v + this.$3.v, l: this.$1, r: this.$3, op: '+' };
        },
      ],
      [
        'l',
        ['h', 'k', 'i'],
        function () {
          return this.$2;
        },
      ],
      [
        'l',
        ['b'],
        function () {
          return { v: Number(this.$1) };
        },
      ],
    ],
    productionIndexMap: {
      symbol: 0,
      rhs: 1,
      action: 2,
      label: 3,
    },
    getProductionItemByType: function (p, itemType) {
      if (this.isCompress) {
        return p[this.productionIndexMap[itemType]];
      }
      return p[itemType];
    },
    getProductionSymbol: function (p) {
      return this.getProductionItemByType(p, 'symbol');
    },
    getProductionRhs: function (p) {
      return this.getProductionItemByType(p, 'rhs');
    },
    getProductionAction: function (p) {
      return this.getProductionItemByType(p, 'action');
    },
    getProductionLabel: function (p) {
      return this.getProductionItemByType(p, 'label');
    },
    isCompress: 1,
  };
  parser.getProductionSymbol = parser.getProductionSymbol.bind(parser);
  parser.getProductionRhs = parser.getProductionRhs.bind(parser);
  parser.getProductionAction = parser.getProductionAction.bind(parser);
  parser.getProductionLabel = parser.getProductionLabel.bind(parser);
  parser.lexer = lexer;
  parser.lex = lex;
  parser.prioritySymbolMap = {};
  function peekStack(stack, n) {
    n = n || 1;
    return stack[stack.length - n];
  }
  var ActionTypeMap = ['accept', 'shift', 'reduce'];
  var GrammarConst = {
    SHIFT_TYPE: 1,
    REDUCE_TYPE: 2,
    ACCEPT_TYPE: 0,
    TYPE_INDEX: 0,
    VALUE_INDEX: 1,
  };
  parser.table = {
    gotos: {
      0: {
        k: 4,
        l: 5,
      },
      2: {
        k: 6,
        l: 5,
      },
      3: {
        k: 7,
        l: 5,
      },
      8: {
        k: 14,
        l: 5,
      },
      9: {
        k: 15,
        l: 5,
      },
      10: {
        k: 16,
        l: 5,
      },
      11: {
        k: 17,
        l: 5,
      },
      12: {
        k: 18,
        l: 5,
      },
    },
    action: {
      0: {
        b: [1, 1],
        d: [1, 2],
        h: [1, 3],
      },
      1: {
        m: [2, 9],
        e: [2, 9],
        g: [2, 9],
        d: [2, 9],
        f: [2, 9],
        c: [2, 9],
        i: [2, 9],
      },
      2: {
        b: [1, 1],
        d: [1, 2],
        h: [1, 3],
      },
      3: {
        b: [1, 1],
        d: [1, 2],
        h: [1, 3],
      },
      4: {
        m: [0],
        c: [1, 8],
        d: [1, 9],
        e: [1, 10],
        f: [1, 11],
        g: [1, 12],
      },
      5: {
        m: [2, 1],
        e: [2, 1],
        g: [2, 1],
        d: [2, 1],
        f: [2, 1],
        c: [2, 1],
        i: [2, 1],
      },
      6: {
        m: [2, 6],
        e: [2, 6],
        g: [2, 6],
        d: [2, 6],
        f: [2, 6],
        c: [2, 6],
        i: [2, 6],
      },
      7: {
        c: [1, 8],
        d: [1, 9],
        e: [1, 10],
        f: [1, 11],
        g: [1, 12],
        i: [1, 13],
      },
      8: {
        b: [1, 1],
        d: [1, 2],
        h: [1, 3],
      },
      9: {
        b: [1, 1],
        d: [1, 2],
        h: [1, 3],
      },
      10: {
        b: [1, 1],
        d: [1, 2],
        h: [1, 3],
      },
      11: {
        b: [1, 1],
        d: [1, 2],
        h: [1, 3],
      },
      12: {
        b: [1, 1],
        d: [1, 2],
        h: [1, 3],
      },
      13: {
        m: [2, 8],
        e: [2, 8],
        g: [2, 8],
        d: [2, 8],
        f: [2, 8],
        c: [2, 8],
        i: [2, 8],
      },
      14: {
        m: [2, 2],
        e: [2, 2],
        g: [2, 2],
        d: [2, 2],
        f: [2, 2],
        c: [1, 8],
        i: [2, 2],
      },
      15: {
        m: [2, 3],
        e: [1, 10],
        g: [2, 3],
        d: [2, 3],
        f: [1, 11],
        c: [1, 8],
        i: [2, 3],
      },
      16: {
        m: [2, 4],
        e: [2, 4],
        g: [2, 4],
        d: [2, 4],
        f: [2, 4],
        c: [1, 8],
        i: [2, 4],
      },
      17: {
        m: [2, 5],
        e: [2, 5],
        g: [2, 5],
        d: [2, 5],
        f: [2, 5],
        c: [1, 8],
        i: [2, 5],
      },
      18: {
        m: [2, 7],
        e: [1, 10],
        g: [2, 7],
        d: [2, 7],
        f: [1, 11],
        c: [1, 8],
        i: [2, 7],
      },
    },
  };
  parser.parse = function parse(input, options) {
    options = options || {};
    var { filename } = options;
    var state, token, ret, action, $$;
    var {
      getProductionSymbol,
      getProductionRhs,
      getProductionAction,
      lexer,
      table,
      productions,
    } = parser;
    var { gotos, action: tableAction } = table;
    // for debug info
    var prefix = filename ? 'in file: ' + filename + ' ' : '';
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
        var expectedInfo = [];
        var expected = {};
        if (tableAction[state]) {
          const map = tableAction[state];
          for (const symbolForState of Object.keys(map)) {
            const v = map[symbolForState];
            action = v[GrammarConst.TYPE_INDEX];
            const actionStr = ActionTypeMap[action];
            const arr = (expected[actionStr] = expected[actionStr] || []);
            const s = parser.lexer.mapReverseSymbol(symbolForState);
            arr.push(s);
            expectedInfo.push(actionStr + ':' + s);
          }
        }
        const error =
          prefix +
          'syntax error at line ' +
          lexer.lineNumber +
          ':\n' +
          lexer.showDebugInfo() +
          '\n' +
          'expect ' +
          expectedInfo.join(', ');
        throw new Error(error);
      }

      switch (action[GrammarConst.TYPE_INDEX]) {
        case GrammarConst.SHIFT_TYPE:
          symbolStack.push(token.t);
          valueStack.push(lexer.text);
          // push state
          stateStack.push(action[GrammarConst.VALUE_INDEX]);
          // allow to read more
          token = null;
          break;

        case GrammarConst.REDUCE_TYPE:
          var production = productions[action[GrammarConst.VALUE_INDEX]];
          var reducedSymbol = getProductionSymbol(production);
          var reducedAction = getProductionAction(production);
          var reducedRhs = getProductionRhs(production);
          var len = reducedRhs.length;
          $$ = peekStack(valueStack, len); // default to $$ = $1
          ret = undefined;
          this.$$ = $$;
          for (var i = 0; i < len; i++) {
            this['$' + (len - i)] = peekStack(valueStack, i + 1);
          }
          if (reducedAction) {
            ret = reducedAction.call(this);
          }
          if (ret !== undefined) {
            $$ = ret;
          } else {
            $$ = this.$$;
          }
          var reverseIndex = len * -1;
          stateStack.splice(reverseIndex, len);
          valueStack.splice(reverseIndex, len);
          symbolStack.splice(reverseIndex, len);
          symbolStack.push(reducedSymbol);
          valueStack.push($$);
          var newState = gotos[peekStack(stateStack)][reducedSymbol];
          stateStack.push(newState);
          break;

        case GrammarConst.ACCEPT_TYPE:
          return $$;
      }
    }
  };
  lexer.symbolMap = {
    $HIDDEN: 'a',
    NUMBER: 'b',
    '^': 'c',
    '-': 'd',
    '*': 'e',
    '/': 'f',
    '+': 'g',
    '(': 'h',
    ')': 'i',
    $START: 'j',
    exp: 'k',
    primaryExpression: 'l',
    $EOF: 'm',
  };
  return parser;
})();

if (typeof module !== 'undefined') {
  module.exports = $parser;
}
