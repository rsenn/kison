/*
  Generated by kison.
*/
var cal = (function(undefined){
/*jshint quotmark:false, loopfunc:true, indent:false, unused:false, asi:true, boss:true*/
/* Generated by kison */
var parser = {};
var GrammarConst = {
        'SHIFT_TYPE': 1,
        'REDUCE_TYPE': 2,
        'ACCEPT_TYPE': 0,
        'TYPE_INDEX': 0,
        'PRODUCTION_INDEX': 1,
        'TO_INDEX': 2
    };
function peekStack(stack, n) {
    n = n || 1;
    return stack[stack.length - n];
}    /*jslint quotmark: false*/
/*jslint quotmark: false*/
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
    var self = this;    /*
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
    mix(self, cfg);    /*
     Input languages
     @type {String}
     */
    /*
     Input languages
     @type {String}
     */
    self.resetInput(self.input);
};
Lexer.prototype = {
    'constructor': function Lexer(cfg) {
        var self = this;    /*
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
        mix(self, cfg);    /*
     Input languages
     @type {String}
     */
        /*
     Input languages
     @type {String}
     */
        self.resetInput(self.input);
    },
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
    'genShortId': function (field) {
        var base = 97,
            // a-1
            max = 122,
            // z
            interval = max - base + 1;
        field += '__gen';
        var self = this;
        if (!(field in self)) {
            self[field] = -1;
        }
        var index = self[field] = self[field] + 1;
        var ret = '';
        do {
            ret = String.fromCharCode(base + index % interval) + ret;    // 00 = 10*1+0
            // 00 = 10*1+0
            index = Math.floor(index / interval) - 1;
        } while (index >= 0);
        return ret;
    },
    'genCode': function (cfg) {
        var STATIC = Lexer.STATIC, self = this, compressSymbol = cfg.compressSymbol, compressState = cfg.compressLexerState, code = [
                '/*jslint quotmark: false*/',
                mix.toString(),
                isArray.toString(),
                each.toString(),
                inArray.toString()
            ], stateMap;
        var genPrototype = Utils.mix({}, Lexer.prototype, true, function (name, val) {
                if (name.match(/^(?:genCode|constructor|mapState|genShortId)$/)) {
                    return undefined;
                }
                return val;
            });
        if (compressSymbol) {
            self.symbolMap = {};
            self.mapSymbol(STATIC.END_TAG);
            genPrototype.mapSymbol = mapSymbolForCodeGen;
        }
        if (compressState) {
            stateMap = self.stateMap = {};
        }
        code.push('var Lexer = ' + Lexer.toString() + ';');
        code.push('Lexer.prototype= ' + serializeObject(genPrototype) + ';');
        code.push('Lexer.STATIC= ' + serializeObject(STATIC) + ';');
        var newCfg = serializeObject({ rules: self.rules }, compressState || compressSymbol ? function (v) {
                var ret;
                if (v && v.regexp) {
                    var state = v.state, action = v.action, token = v.token || 0;
                    if (token) {
                        token = self.mapSymbol(token);
                    }
                    ret = [
                        token,
                        v.regexp,
                        action || 0
                    ];
                    if (compressState && state) {
                        state = Utils.map(state, function (s) {
                            return self.mapState(s);
                        });
                    }
                    if (state) {
                        ret.push(state);
                    }
                }
                return ret;
            } : 0);
        code.push('var lexer = new Lexer(' + newCfg + ');');
        if (compressState || compressSymbol) {
            // for grammar
            /*jslint evil: true*/
            self.rules = eval('(' + newCfg + ')').rules;
            if (compressState) {
                code.push('lexer.stateMap = ' + serializeObject(stateMap) + ';');
            }
        }
        return code.join('\n');
    },
    'getCurrentRules': function () {
        var self = this, currentState = self.stateStack[self.stateStack.length - 1], rules = [];    //#JSCOVERAGE_IF
        //#JSCOVERAGE_IF
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
        matched = matched.slice(0, matched.length - match.length);    //#JSCOVERAGE_IF 0
        //#JSCOVERAGE_IF 0
        var past = (matched.length > DEBUG_CONTEXT_LIMIT ? '...' : '') + matched.slice(0 - DEBUG_CONTEXT_LIMIT).replace(/\n/g, ' '), next = match + input;    //#JSCOVERAGE_ENDIF
        //#JSCOVERAGE_ENDIF
        next = next.slice(0, DEBUG_CONTEXT_LIMIT).replace(/\n/g, ' ') + (next.length > DEBUG_CONTEXT_LIMIT ? '...' : '');
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
        }    //#JSCOVERAGE_IF
        //#JSCOVERAGE_IF
        if (reverseSymbolMap) {
            return reverseSymbolMap[rs];
        } else {
            return rs;
        }
    },
    'mapState': function (s) {
        var self = this, stateMap = self.stateMap;
        if (!stateMap) {
            return s;
        }
        return stateMap[s] || (stateMap[s] = self.genShortId('state'));
    },
    'lex': function () {
        var self = this, input = self.input, i, rule, m, ret, lines, rules = self.getCurrentRules();
        self.match = self.text = '';
        if (!input) {
            return self.mapSymbol(Lexer.STATIC.END_TAG);
        }
        for (i = 0; i < rules.length; i++) {
            rule = rules[i];    //#JSCOVERAGE_IF 0
            //#JSCOVERAGE_IF 0
            var regexp = rule.regexp || rule[1], token = rule.token || rule[0], action = rule.action || rule[2] || undefined;    //#JSCOVERAGE_ENDIF
            //#JSCOVERAGE_ENDIF
            if (m = input.match(regexp)) {
                lines = m[0].match(/\n.*/g);
                if (lines) {
                    self.lineNumber += lines.length;
                }
                mix(self, {
                    firstLine: self.lastLine,
                    lastLine: self.lineNumber,
                    firstColumn: self.lastColumn,
                    lastColumn: lines ? lines[lines.length - 1].length - 1 : self.lastColumn + m[0].length
                });
                var match;    // for error report
                // for error report
                match = self.match = m[0];    // all matches
                // all matches
                self.matches = m;    // may change by user
                // may change by user
                self.text = match;    // matched content utils now
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
                    return ret;
                } else {
                    // ignore
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
parser.parse = function parse(str) {
    str = String(str);
    if (str.length > 100) {
        return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
        return n * y;
    case 'weeks':
    case 'week':
    case 'w':
        return n * w;
    case 'days':
    case 'day':
    case 'd':
        return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
        return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
        return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
        return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
        return n;
    default:
        return undefined;
    }
};
return parser;
})();
if(typeof module !== 'undefined'){
    module.exports = cal;
}