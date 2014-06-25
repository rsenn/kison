var cal = function (undefined) {
        var parser = {}, GrammarConst = {
                'SHIFT_TYPE': 1,
                'REDUCE_TYPE': 2,
                'ACCEPT_TYPE': 0,
                'TYPE_INDEX': 0,
                'PRODUCTION_INDEX': 1,
                'TO_INDEX': 2
            };
        function mix(to, from) {
            for (var f in from) {
                to[f] = from[f];
            }
        }
        function isArray(obj) {
            return '[object Array]' === Object.prototype.toString.call(obj);
        }
        function each(object, fn, context) {
            if (object) {
                var key, val, length, i = 0;
                context = context || null;
                if (!isArray(object)) {
                    for (key in object) {
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
            self.rules = [];
            mix(self, cfg);
            self.resetInput(self.input);
        };
        Lexer.prototype = {
            'resetInput': function (input) {
                mix(this, {
                    input: input,
                    matched: '',
                    stateStack: [Lexer.STATIC.INITIAL],
                    match: '',
                    text: '',
                    firstLine: 1,
                    lineNumber: 1,
                    lastLine: 1,
                    firstColumn: 1,
                    lastColumn: 1
                });
            },
            'getCurrentRules': function () {
                var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];
                if (self.mapState) {
                    currentState = self.mapState(currentState);
                }
                each(self.rules, function (r) {
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
            'pushState': function (state) {
                this.stateStack.push(state);
            },
            'popState': function (num) {
                num = num || 1;
                var ret;
                while (num--) {
                    ret = this.stateStack.pop();
                }
                return ret;
            },
            'showDebugInfo': function () {
                var self = this, DEBUG_CONTEXT_LIMIT = Lexer.STATIC.DEBUG_CONTEXT_LIMIT, matched = self.matched, match = self.match, input = self.input;
                matched = matched.slice(0, matched.length - match.length);
                var past = (matched.length > DEBUG_CONTEXT_LIMIT ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/, ' '), next = match + input;
                next = next.slice(0, DEBUG_CONTEXT_LIMIT) + (next.length > DEBUG_CONTEXT_LIMIT ? '...' : '');
                return past + next + '\n' + new Array(past.length + 1).join('-') + '^';
            },
            'mapSymbol': function mapSymbolForCodeGen(t) {
                return this.symbolMap[t];
            },
            'mapReverseSymbol': function (rs) {
                var self = this, symbolMap = self.symbolMap, i, reverseSymbolMap = self.reverseSymbolMap;
                if (!reverseSymbolMap && symbolMap) {
                    reverseSymbolMap = self.reverseSymbolMap = {};
                    for (i in symbolMap) {
                        reverseSymbolMap[symbolMap[i]] = i;
                    }
                }
                if (reverseSymbolMap) {
                    return reverseSymbolMap[rs];
                } else {
                    return rs;
                }
            },
            'lex': function () {
                var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
                self.match = self.text = '';
                if (!input) {
                    return self.mapSymbol(Lexer.STATIC.END_TAG);
                }
                for (i = 0; i < rules.length; i++) {
                    rule = rules[i];
                    var regexp = rule.regexp || rule[1], token = rule.token || rule[0], action = rule.action || rule[2] || undefined;
                    if (m = input.match(regexp)) {
                        lines = m[0].match(/\n.*/g);
                        if (lines) {
                            self.lineNumber += lines.length;
                        }
                        mix(self, {
                            firstLine: self.lastLine,
                            lastLine: self.lineNumber + 1,
                            firstColumn: self.lastColumn,
                            lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length
                        });
                        var match;
                        match = self.match = m[0];
                        self.matches = m;
                        self.text = match;
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
                            return ret;
                        } else {
                            return self.lex();
                        }
                    }
                }
            }
        };
        Lexer.STATIC = {
            'INITIAL': 'I',
            'DEBUG_CONTEXT_LIMIT': 20,
            'END_TAG': '$EOF'
        };
        var lexer = new Lexer({
                'rules': [
                    [
                        0,
                        /^\s+/,
                        0
                    ],
                    [
                        'b',
                        /^[0-9]+(\.[0-9]+)?\b/,
                        0
                    ],
                    [
                        'c',
                        /^\+/,
                        0
                    ],
                    [
                        'd',
                        /^-/,
                        0
                    ],
                    [
                        'e',
                        /^./,
                        0
                    ]
                ]
            });
        parser.lexer = lexer;
        lexer.symbolMap = {
            '$EOF': 'a',
            'NUMBER': 'b',
            '+': 'c',
            '-': 'd',
            'ERROR_LA': 'e',
            '$START': 'f',
            'expressions': 'g',
            'e': 'h'
        };
        parser.productions = [
            [
                'f',
                ['g']
            ],
            [
                'g',
                ['h']
            ],
            [
                'h',
                [
                    'h',
                    'd',
                    'h'
                ],
                function () {
                    return this.$1 - this.$3;
                }
            ],
            [
                'h',
                [
                    'h',
                    'c',
                    'h'
                ],
                function () {
                    return this.$1 + this.$3;
                }
            ],
            [
                'h',
                ['b'],
                function () {
                    return Number(this.$1);
                }
            ]
        ];
        parser.table = {
            'gotos': {
                '0': {
                    'g': 2,
                    'h': 3
                },
                '4': { 'h': 6 },
                '5': { 'h': 7 }
            },
            'action': {
                '0': {
                    'b': [
                        1,
                        undefined,
                        1
                    ]
                },
                '1': {
                    'a': [
                        2,
                        4
                    ],
                    'c': [
                        2,
                        4
                    ],
                    'd': [
                        2,
                        4
                    ]
                },
                '2': { 'a': [0] },
                '3': {
                    'a': [
                        2,
                        1
                    ],
                    'c': [
                        1,
                        undefined,
                        4
                    ],
                    'd': [
                        1,
                        undefined,
                        5
                    ]
                },
                '4': {
                    'b': [
                        1,
                        undefined,
                        1
                    ]
                },
                '5': {
                    'b': [
                        1,
                        undefined,
                        1
                    ]
                },
                '6': {
                    'a': [
                        2,
                        3
                    ],
                    'c': [
                        1,
                        undefined,
                        4
                    ],
                    'd': [
                        1,
                        undefined,
                        5
                    ]
                },
                '7': {
                    'a': [
                        2,
                        2
                    ],
                    'c': [
                        1,
                        undefined,
                        4
                    ],
                    'd': [
                        1,
                        undefined,
                        5
                    ]
                }
            }
        };
        parser.parse = function parse(input, filename) {
            var self = this, lexer = self.lexer, state, symbol, action, table = self.table, gotos = table.gotos, tableAction = table.action, productions = self.productions, valueStack = [null], prefix = filename ? 'in file: ' + filename + ' ' : '', stack = [0];
            lexer.resetInput(input);
            while (1) {
                state = stack[stack.length - 1];
                if (!symbol) {
                    symbol = lexer.lex();
                }
                if (symbol) {
                    action = tableAction[state] && tableAction[state][symbol];
                } else {
                    action = null;
                }
                if (!action) {
                    var expected = [], error;
                    if (tableAction[state]) {
                        for (var symbolForState in tableAction[state]) {
                            expected.push(self.lexer.mapReverseSymbol(symbolForState));
                        }
                    }
                    error = prefix + 'syntax error at line ' + lexer.lineNumber + ':\n' + lexer.showDebugInfo() + '\n' + 'expect ' + expected.join(', ');
                    throw new Error(error);
                }
                switch (action[GrammarConst.TYPE_INDEX]) {
                case GrammarConst.SHIFT_TYPE:
                    stack.push(symbol);
                    valueStack.push(lexer.text);
                    stack.push(action[GrammarConst.TO_INDEX]);
                    symbol = null;
                    break;
                case GrammarConst.REDUCE_TYPE:
                    var production = productions[action[GrammarConst.PRODUCTION_INDEX]], reducedSymbol = production.symbol || production[0], reducedAction = production.action || production[2], reducedRhs = production.rhs || production[1], len = reducedRhs.length, i = 0, ret, $$ = valueStack[valueStack.length - len];
                    ret = undefined;
                    self.$$ = $$;
                    for (; i < len; i++) {
                        self['$' + (len - i)] = valueStack[valueStack.length - 1 - i];
                    }
                    if (reducedAction) {
                        ret = reducedAction.call(self);
                    }
                    if (ret !== undefined) {
                        $$ = ret;
                    } else {
                        $$ = self.$$;
                    }
                    stack = stack.slice(0, -1 * len * 2);
                    valueStack = valueStack.slice(0, -1 * len);
                    stack.push(reducedSymbol);
                    valueStack.push($$);
                    var newState = gotos[stack[stack.length - 2]][stack[stack.length - 1]];
                    stack.push(newState);
                    break;
                case GrammarConst.ACCEPT_TYPE:
                    return $$;
                }
            }
        };
        return parser;
    }();
if (typeof module !== 'undefined') {
    module.exports = cal;
}