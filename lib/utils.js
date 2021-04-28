/**
 * @ignore
 * utils for kison.
 * @author yiminghe@gmail.com
 */
var doubleReg = /"/g, single = /'/g, escapeString;

/**
 * utils for kison
 * @class Kison.Utils
 * @singleton
 */
module.exports = Object.assign({
    escapeString: escapeString = function (str, quote) {
        var regexp = single;
        if (quote === '"') {
            regexp = doubleReg;
        } else {
            quote = '\'';
        }
        return str.replace(/\\/g, '\\\\')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(regexp, '\\' + quote);
    },

    serializeObject: function serializeObject(obj, excludeReg) {
        var r;

        if (excludeReg &&
            (typeof excludeReg === 'function') &&
            (r = excludeReg(obj)) === false) {
            return false;
        }

        if (r !== undefined) {
            obj = r;
        }

        var ret = [];

        if (typeof obj === 'string') {
            return '\'' + escapeString(obj) + '\'';
        } else if (typeof obj === 'number') {
            return obj + '';
        } else if (util.isRegExp(obj)) {
            return '/' +
                obj.source + '/' +
                (obj.global ? 'g' : '') +
                (obj.ignoreCase ? 'i' : '') +
                (obj.multiline ? 'm' : '');
        } else if (util.isArray(obj)) {
            ret.push('[');
            var sub = [];
            util.each(obj, function (v) {
                var t = serializeObject(v, excludeReg);
                if (t !== false) {
                    sub.push(t);
                }
            });
            ret.push(sub.join(', '));
            ret.push(']');
            return ret.join('');
        } else if (typeof obj === 'object') {
            ret = [];
            ret[0] = '{';
            var start = 1;
            for (var i in obj) {
                var v = obj[i];
                if (excludeReg && util.isRegExp(excludeReg) && i.match(excludeReg)) {
                    continue;
                }
                var t = serializeObject(v, excludeReg);
                if (t === false) {
                    continue;
                }
                /*jshint quotmark:false*/
                var key = "'" + escapeString(i) + "'";
                ret.push((start ? '' : ',') + key + ': ' + t);
                start = 0;
            }
            ret.push('}');
            return ret.join('\n');
        } else {
            return obj + '';
        }
    }
}, { escapeString, serializeObject, makeArray, later, instanceOf, isRegExp, each, buffer, merge, indexOf, keys, substitute, mix: Object.assign});

var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g,
    EMPTY = '';

function escapeString(str, quote) {
    var regexp = single;
    if (quote === '"') {
        regexp = doubleReg;
    } else {
        quote = "'";
    }
    return str
        .replace(/\\/g, '\\\\')
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t')
        .replace(regexp, '\\' + quote);
}

function serializeObject(obj, excludeReg) {
    var r;

    if (excludeReg && typeof excludeReg === 'function' && (r = excludeReg(obj)) === false) {
        return false;
    }

    if (r !== undefined) {
        obj = r;
    }

    var ret = [];

    if (typeof obj === 'string') {
        return "'" + escapeString(obj) + "'";
    } else if (typeof obj === 'number') {
        return obj + '';
    } else if (isRegExp(obj)) {
        return '/' + obj.source + '/' + (obj.global ? 'g' : '') + (obj.ignoreCase ? 'i' : '') + (obj.multiline ? 'm' : '');
    } else if (Array.isArray(obj)) {
        ret.push('[');
        var sub = [];
        each(obj, function (v) {
            var t = serializeObject(v, excludeReg);
            if (t !== false) {
                sub.push(t);
            }
        });
        ret.push(sub.join(', '));
        ret.push(']');
        return ret.join('');
    } else if (typeof obj === 'object') {
        ret = [];
        ret[0] = '{';
        var start = 1;
        for (var i in obj) {
            var v = obj[i];
            if (excludeReg && isRegExp(excludeReg) && i.match(excludeReg)) {
                continue;
            }
            var t = serializeObject(v, excludeReg);
            if (t === false) {
                continue;
            }
            /*jshint quotmark:false*/
            var key = "'" + escapeString(i) + "'";
            ret.push((start ? '' : ',') + key + ': ' + t);
            start = 0;
        }
        ret.push('}');
        return ret.join('\n');
    } else {
        return obj + '';
    }
}

function makeArray(o) {
    if (o == null) {
        return [];
    }
    if (Array.isArray(o)) {
        return o;
    }
    var lengthType = typeof o.length,
        oType = typeof o;
    // The strings and functions also have 'length'
    if (
        lengthType !== 'number' ||
        // select element
        // https://github.com/kissyteam/kissy/issues/537
        typeof o.nodeName === 'string' ||
        // window
        /*jshint eqeqeq:false*/
        (o != null && o == o.window) ||
        oType === 'string' ||
        // https://github.com/ariya/phantomjs/issues/11478
        (oType === 'function' && !('item' in o && lengthType === 'number'))
    ) {
        return [o];
    }
    var ret = [];
    for (var i = 0, l = o.length; i < l; i++) {
        ret[i] = o[i];
    }
    return ret;
}

function later(fn, when, periodic, context, data) {
    when = when || 0;
    var m = fn,
        d = makeArray(data),
        f,
        r;

    if (typeof fn === 'string') {
        m = context[fn];
    }

    f = function () {
        m.apply(context, d);
    };

    r = periodic ? setInterval(f, when) : setTimeout(f, when);

    return {
        id: r,
        interval: periodic,
        cancel: function () {
            if (this.interval) {
                clearInterval(r);
            } else {
                clearTimeout(r);
            }
        }
    };
}

function instanceOf(obj, ctor) {
    return typeof obj == 'object' && obj != null && obj instanceof ctor;
}

function isRegExp(regexp) {
    return instanceOf(regexp, RegExp);
}

function each(object, fn, context) {
    if (object) {
        var key,
            val,
            keys,
            i = 0,
            length = object && object.length,
            isObj = length === undefined || toString.call(object) === '[object Function]';
        context = context || null;
        if (isObj) {
            keys = Object.keys(object);
            for (; i < keys.length; i++) {
                key = keys[i];
                if (fn.call(context, object[key], key, object) === false) {
                    break;
                }
            }
        } else {
            for (val = object[0]; i < length; val = object[++i]) {
                if (fn.call(context, val, i, object) === false) {
                    break;
                }
            }
        }
    }
    return object;
}

function buffer(fn, ms, context) {
    ms = ms || 150;

    if (ms === -1) {
        return function () {
            fn.apply(context || this, arguments);
        };
    }
    var bufferTimer = null;

    function f() {
        f.stop();
        bufferTimer = later(fn, ms, 0, context || this, arguments);
    }

    f.stop = function () {
        if (bufferTimer) {
            bufferTimer.cancel();
            bufferTimer = 0;
        }
    };

    return f;
}

function merge(varArgs) {
    varArgs = makeArray(arguments);
    var o = {},
        i,
        l = varArgs.length;
    for (i = 0; i < l; i++) {
        Object.assign(o, varArgs[i]);
    }
    return o;
}

function indexOf(item, arr, fromIndex) {
    return Array.prototype.indexOf.call(arr, item, fromIndex);
}

function keys(obj) {
    return Object.keys(obj);
}

function substitute(str, o, regexp) {
    if (typeof str !== 'string' || !o) {
        return str;
    }

    return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
        if (match.charAt(0) === '\\') {
            return match.slice(1);
        }
        return o[name] === undefined ? EMPTY : o[name];
    });
}
