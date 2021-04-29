#!/usr/bin/env node

/**
 * Generate parser function using LALR algorithm.
 * @author yiminghe@gmail.com
 */
var esprima = require('esprima');
var escodegen = require('escodegen');
var program = require('commander');
program
    .option('-g, --grammar <grammar>', 'Set kison grammar file')
    .option('-n, --name [name]', 'Set file name')
    .option('-w, --watch', 'Watch grammar file change')
    // defaults bool true
    .option('--no-compressSymbol', 'Set compress symbol')
    .option('--compressLexerState', 'Set compress lexer state')
    .parse(scriptArgs ? ['qjs', ...scriptArgs] : process.argv);

var options = program.options;

options.forEach(function (o) {
    var name = o.name();
    if (o.required && !(name in program)) {
        program.optionMissingArgument(o);
    }
});

var Utils = require('../lib/utils'),
    KISON = require('../lib/'),
    fs = require('fs'),
    path = require('path'),
    grammar = path.resolve(program.grammar),
    encoding = 'utf-8';

var kisonCfg = {
    compressLexerState: program.compressLexerState,
    compressSymbol: program.compressSymbol
};

var grammarBaseName = program.name ? program.name : path.basename(grammar, '-grammar.kison');
var modulePath = path.resolve(grammar, '../' + grammarBaseName + '.js');

var codeTemplate = [
    '/*' ,
    '  Generated by kison.' ,
    '*/' ,
    'var {name} = (function(undefined){' ,
    '/*jshint quotmark:false, loopfunc:true, indent:false, unused:false, asi:true, boss:true*/',
    '{code}',
    'return parser;',
    '})();' ,
    'if(typeof module !== \'undefined\'){' ,
    '    module.exports = {name};' ,
    '}'].join('\n');

function myJsBeautify(str) {
    try {
        return escodegen.generate(esprima.parse(str,{
            attachComment: true
        }), {
            comment: true
        });
    } catch (e) {
        console.log('syntax error: ');
        console.log(str);
        throw e;
    }
}

function genParser() {
    var grammarContent = fs.readFileSync(grammar, encoding);

    console.info('start generate grammar module: ' + modulePath + '\n');
    var start = Date.now();
    /*jshint evil:true*/
    var code = new KISON.Grammar(eval(grammarContent)).genCode(kisonCfg);

    var moduleCode = Utils.substitute(codeTemplate, {
            code: myJsBeautify(code),
            name: grammarBaseName
        });

    fs.writeFileSync(modulePath, moduleCode, encoding);

    console.info('generate grammar module: ' + modulePath + ' at ' + (new Date().toLocaleString()));
    console.info('duration: ' + (Date.now() - start) + 'ms');
}

var bufferCompile = Utils.buffer(genParser);

if (program.watch) {
    fs.watch(grammar, bufferCompile);
    genParser();
} else {
    bufferCompile();
}
