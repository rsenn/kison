node ../../../bin/kison --no-compressSymbol  --bnf=./cal.bnf --es -g cal-grammar.js 

node  ../../../node_modules/@yiminghe/rr/rr -out:./cal.xhtml ./cal.bnf

