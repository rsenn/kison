// TODO: improve Tuple type
type Optional<T> = T | undefined;
type OneOrMore<T> = T extends Array<infer U> ? [...T, ...U[]] : [T, ...T[]];
type ZeroOrMore<T> = T extends Array<infer U> ? U[] : T[];

export type AstNode = AstSymbolNode | AstTokenNode;

// replace start
export type AstSymbolNode = Exp_Node;
export type AstTokenNode = $EOF_Node|$UNKNOWN_Node|TOKEN_0_Node|TOKEN_1_Node|TOKEN_2_Node|TOKEN_3_Node|TOKEN_4_Node|TOKEN_5_Node|TOKEN_6_Node|NUMBER_Node;
export type LiteralToken = "$HIDDEN"|"NUMBER"|"$EOF"|"$UNKNOWN"|"("|")"|"+"|"-"|"*"|"/"|"^";
export type AstRootNode = Exp_Node;
// replace end

export type AstErrorNode = AstTokenNode & {
  error: ParseError;
}

export interface Position {
  start: number;
  end: number;
  firstLine: number;
  lastLine: number;
  firstColumn: number;
  lastColumn: number;
}

interface BaseSymbolNode extends Position {
  type: 'symbol';
  symbol: '';
  parent?: AstSymbolNode;
  label: '';
  children: AstNode[];
}

interface BaseTokenNode extends Position {
  type: 'token';
  token: '';
  t: string;
  text: string;
  parent: AstSymbolNode;
}

export type TransformNode = (arg: {
  index: number;
  node: AstNode;
  parent: AstSymbolNode;
  defaultTransformNode: TransformNode;
}) => AstNode | null;

export interface Token extends Position {
  text: string;
  t: string;
  recovery?: string;
  token: LiteralToken;
}

export interface ParseError {
  errorMessage: string;
  expected: LiteralToken[];
  lexer: Token;
  recovery?: Boolean;
  symbol: AstSymbolNode['symbol'];
  tip: string;
}

export interface LexerOptions<T = any> {
  env?: string;
  state?: {
    userData?: T,
    stateStack?: string[];
  }
}

export interface ParserOptions {
  lexerOptions?: LexerOptions;
  transformNode?: TransformNode | false;
  onErrorRecovery?: (args: {
    parseTree: AstNode;
    errorNode: AstErrorNode;
  }, recommendedAction: {
    action?: 'del' | 'add'
  }) => void;
}

export interface ParseResult {
  ast: AstRootNode;
  error?: ParseError;
  errorNode?: AstErrorNode;
  recoveryTokens: Token[];
  terminalNodes: AstTokenNode[];
  tokens: Token[];
}

export interface LexResult<T = any> {
  tokens: Token[];
  state: {
    userData: T,
    stateStack: string[];
  }
}

declare function parse(input: string, options?: ParserOptions): ParseResult;

declare function lex<T = any>(input: string, options?: LexerOptions<T>): LexResult<T>;

declare const parser: { parse: typeof parse, lex: typeof lex };

export default parser;

export interface $EOF_Node extends BaseTokenNode {
      token:"$EOF";
      parent:AstSymbolNode;
    }
export interface $UNKNOWN_Node extends BaseTokenNode {
      token:"$UNKNOWN";
      parent:AstSymbolNode;
    }
export interface TOKEN_0_Node extends BaseTokenNode {
            token:"(";
            parent:Exp_Node_0;
          }
export interface TOKEN_1_Node extends BaseTokenNode {
            token:")";
            parent:Exp_Node_0;
          }
interface Exp_Node_0 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[TOKEN_0_Node,Exp_Node,TOKEN_1_Node];
        parent:Exp_Node_0 | Exp_Node_1 | Exp_Node_2 | Exp_Node_3 | Exp_Node_4 | Exp_Node_5 | Exp_Node_6;
      }
export interface TOKEN_2_Node extends BaseTokenNode {
            token:"+";
            parent:Exp_Node_1;
          }
interface Exp_Node_1 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[Exp_Node,TOKEN_2_Node,Exp_Node];
        parent:Exp_Node_0 | Exp_Node_1 | Exp_Node_2 | Exp_Node_3 | Exp_Node_4 | Exp_Node_5 | Exp_Node_6;
      }
export interface TOKEN_3_Node extends BaseTokenNode {
            token:"-";
            parent:Exp_Node_2 | Exp_Node_5;
          }
interface Exp_Node_2 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[Exp_Node,TOKEN_3_Node,Exp_Node];
        parent:Exp_Node_0 | Exp_Node_1 | Exp_Node_2 | Exp_Node_3 | Exp_Node_4 | Exp_Node_5 | Exp_Node_6;
      }
export interface TOKEN_4_Node extends BaseTokenNode {
            token:"*";
            parent:Exp_Node_3;
          }
interface Exp_Node_3 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[Exp_Node,TOKEN_4_Node,Exp_Node];
        parent:Exp_Node_0 | Exp_Node_1 | Exp_Node_2 | Exp_Node_3 | Exp_Node_4 | Exp_Node_5 | Exp_Node_6;
      }
export interface TOKEN_5_Node extends BaseTokenNode {
            token:"/";
            parent:Exp_Node_4;
          }
interface Exp_Node_4 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[Exp_Node,TOKEN_5_Node,Exp_Node];
        parent:Exp_Node_0 | Exp_Node_1 | Exp_Node_2 | Exp_Node_3 | Exp_Node_4 | Exp_Node_5 | Exp_Node_6;
      }
interface Exp_Node_5 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[TOKEN_3_Node,Exp_Node];
        parent:Exp_Node_0 | Exp_Node_1 | Exp_Node_2 | Exp_Node_3 | Exp_Node_4 | Exp_Node_5 | Exp_Node_6;
      }
export interface TOKEN_6_Node extends BaseTokenNode {
            token:"^";
            parent:Exp_Node_6;
          }
interface Exp_Node_6 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[Exp_Node,TOKEN_6_Node,Exp_Node];
        parent:Exp_Node_0 | Exp_Node_1 | Exp_Node_2 | Exp_Node_3 | Exp_Node_4 | Exp_Node_5 | Exp_Node_6;
      }
export interface NUMBER_Node extends BaseTokenNode {
            token:"NUMBER";
            parent:Exp_Node_7;
          }
interface Exp_Node_7 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[NUMBER_Node];
        parent:Exp_Node_0 | Exp_Node_1 | Exp_Node_2 | Exp_Node_3 | Exp_Node_4 | Exp_Node_5 | Exp_Node_6;
      }
export type Exp_Node = Exp_Node_0 | Exp_Node_1 | Exp_Node_2 | Exp_Node_3 | Exp_Node_4 | Exp_Node_5 | Exp_Node_6 | Exp_Node_7;
export type AstNodeTypeMap = { ast: AstNode;
exp: Exp_Node;
$EOF: $EOF_Node;
$UNKNOWN: $UNKNOWN_Node;
TOKEN_0: TOKEN_0_Node;
TOKEN_1: TOKEN_1_Node;
TOKEN_2: TOKEN_2_Node;
TOKEN_3: TOKEN_3_Node;
TOKEN_4: TOKEN_4_Node;
TOKEN_5: TOKEN_5_Node;
TOKEN_6: TOKEN_6_Node;
NUMBER: NUMBER_Node;
};