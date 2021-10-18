type AstNode = AstSymbolNode | AstTokenNode;

// replace start
type AstSymbolNode = Formula_Node|Exp_Node|ReferenceItem_Node|Reference_Node|ArrayElement_Node|Array_Node|FunctionExp_Node|ArgumentsList_Node|StructureReference_Node|TableSpecifier_Node|TableThisRow_Node|TableSpecifierInner_Node|TableSpecifierItem_Node|TableColumnSpecifier_Node;
type AstTokenNode = $EOF_Node|$UNKNOWN_Node|TOKEN_0_Node|TOKEN_1_Node|TOKEN_2_Node|TOKEN_3_Node|TOKEN_4_Node|TOKEN_5_Node|TOKEN_6_Node|TOKEN_7_Node|TOKEN_8_Node|TOKEN_9_Node|TOKEN_10_Node|TOKEN_11_Node|TOKEN_12_Node|TOKEN_13_Node|TOKEN_14_Node|TOKEN_15_Node|NUMBER_Node|STRING_Node|LOGIC_Node|ERROR_Node|CELL_Node|NAME_Node|REF_UNION_OPERATOR_Node|REF_RANGE_OPERATOR_Node|TOKEN_16_Node|TOKEN_17_Node|FUNCTION_Node|TABLE_NAME_Node|TABLE_ITEM_SPECIFIER_Node|TOKEN_18_Node|TOKEN_19_Node|TABLE_AT_Node|TABLE_COLUMN_SPECIFIER_Node|ARRAY_SEPARATOR_Node|ARGUMENT_SEPARATOR_Node|SPECIFIER_SEPARATOR_Node;
type LiteralToken = "$HIDDEN"|"SPECIFIER_SEPARATOR"|"TABLE_ITEM_SPECIFIER"|"TABLE_AT"|"TABLE_COLUMN_SPECIFIER"|"ARRAY_SEPARATOR"|"REF_UNION_OPERATOR"|"REF_RANGE_OPERATOR"|"ARGUMENT_SEPARATOR"|"STRING"|"FUNCTION"|"TABLE_NAME"|"ERROR"|"CELL"|"LOGIC"|"NAME"|"NUMBER"|"NUMBER"|"$EOF"|"$UNKOWN"|"="|"<="|">="|"<>"|">"|"<"|"&"|"+"|"-"|"*"|"/"|"^"|"@"|"%"|"("|")"|"{"|"}"|"["|"]";
type AstRootNode = Formula_Node;
// replace end

type AstErrorNode = AstTokenNode & {
  error: ParseError;
}

interface Position {
  start: number;
  end: number;
  firstLine: number;
  lastLine: number;
  firstColumn: number;
  lastColumn: number;
}

interface BaseSymbolNode extends Position {
  type: 'symbol';
  symbol: string;
  parent?: AstSymbolNode;
  label: string;
  children: AstNode[];
}

interface BaseTokenNode extends Position {
  type: 'token';
  token: string;
  t: string;
  text: string;
  parent: AstSymbolNode;
}

type TransformNode = (arg: {
  index: number;
  node: AstNode;
  parent: AstSymbolNode;
  defaultTransformNode: TransformNode;
}) => AstNode | null;

interface Token extends Position {
  text: string;
  t: string;
  recovery?: string;
  token: LiteralToken;
}

interface ParseError {
  errorMessage: string;
  expected: LiteralToken[];
  lexer: Token;
  recovery?: Boolean;
  symbol: AstSymbolNode['symbol'];
  tip: string;
}

interface LexerOptions<T = any> {
  env?: string;
  state?: {
    userData?: T,
    stateStack?: string[];
  }
}

interface ParserOptions {
  lexerOptions?: LexerOptions;
  transformNode?: TransformNode | false;
  onErrorRecovery?: (args: {
    parseTree: AstNode;
    errorNode: AstErrorNode;
  }, recommendedAction: {
    action?: 'del' | 'add'
  }) => void;
}

interface ParseResult {
  ast: AstRootNode;
  error?: ParseError;
  errorNode?: AstErrorNode;
  recoveryTokens: Token[];
  terminalNodes: AstTokenNode[];
  tokens: Token[];
}

interface LexResult<T = any> {
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

export type {
  ParseResult, LexResult, ParserOptions,
  TransformNode,
  AstErrorNode,
  AstRootNode,
  ParseError,
  Position,
  LiteralToken,
  LexerOptions, AstTokenNode, Token, AstNode, AstSymbolNode
}

interface Formula_Node extends BaseSymbolNode {
        symbol:"formula";
        
        children:[Exp_Node];
        
      }
interface Exp_Node_0 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_0_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_3 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_1_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_4 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_2_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_5 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_3_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_6 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_4_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_7 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_5_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_8 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_6_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_9 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_7_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_10 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_8_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_11 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_9_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_12 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_10_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_13 extends BaseSymbolNode {
        symbol:"exp";
        label:"binaryExp";
        children:[Exp_Node,TOKEN_11_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_14 extends BaseSymbolNode {
        symbol:"exp";
        label:"prefixExp";
        children:[TOKEN_7_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_15 extends BaseSymbolNode {
        symbol:"exp";
        label:"prefixExp";
        children:[TOKEN_8_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_16 extends BaseSymbolNode {
        symbol:"exp";
        label:"clipExp";
        children:[TOKEN_12_Node,Exp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_17 extends BaseSymbolNode {
        symbol:"exp";
        label:"percentageExp";
        children:[Exp_Node,TOKEN_13_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_18 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[TOKEN_14_Node,Exp_Node,TOKEN_15_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_19 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[NUMBER_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_20 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[STRING_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_21 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[LOGIC_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_22 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[ERROR_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_23 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[Reference_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_31 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[FunctionExp_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
interface Exp_Node_32 extends BaseSymbolNode {
        symbol:"exp";
        
        children:[Array_Node];
        parent:Formula_Node | Exp_Node | ArgumentsList_Node | ArgumentsList_Node;
      }
type Exp_Node = Exp_Node_0 | Exp_Node_3 | Exp_Node_4 | Exp_Node_5 | Exp_Node_6 | Exp_Node_7 | Exp_Node_8 | Exp_Node_9 | Exp_Node_10 | Exp_Node_11 | Exp_Node_12 | Exp_Node_13 | Exp_Node_14 | Exp_Node_15 | Exp_Node_16 | Exp_Node_17 | Exp_Node_18 | Exp_Node_19 | Exp_Node_20 | Exp_Node_21 | Exp_Node_22 | Exp_Node_23 | Exp_Node_31 | Exp_Node_32;
interface ReferenceItem_Node_0 extends BaseSymbolNode {
        symbol:"referenceItem";
        
        children:[CELL_Node];
        parent:Reference_Node_30;
      }
interface ReferenceItem_Node_25 extends BaseSymbolNode {
        symbol:"referenceItem";
        
        children:[NAME_Node];
        parent:Reference_Node_30;
      }
interface ReferenceItem_Node_26 extends BaseSymbolNode {
        symbol:"referenceItem";
        
        children:[StructureReference_Node];
        parent:Reference_Node_30;
      }
type ReferenceItem_Node = ReferenceItem_Node_0 | ReferenceItem_Node_25 | ReferenceItem_Node_26;
interface Reference_Node_0 extends BaseSymbolNode {
        symbol:"reference";
        label:"unionReference";
        children:[Reference_Node,REF_UNION_OPERATOR_Node,Reference_Node];
        parent:Exp_Node_23 | Reference_Node;
      }
interface Reference_Node_28 extends BaseSymbolNode {
        symbol:"reference";
        label:"intersectionReference";
        children:[Reference_Node,Reference_Node];
        parent:Exp_Node_23 | Reference_Node;
      }
interface Reference_Node_29 extends BaseSymbolNode {
        symbol:"reference";
        label:"rangeReference";
        children:[Reference_Node,REF_RANGE_OPERATOR_Node,Reference_Node];
        parent:Exp_Node_23 | Reference_Node;
      }
interface Reference_Node_30 extends BaseSymbolNode {
        symbol:"reference";
        
        children:[ReferenceItem_Node];
        parent:Exp_Node_23 | Reference_Node;
      }
type Reference_Node = Reference_Node_0 | Reference_Node_28 | Reference_Node_29 | Reference_Node_30;
interface ArrayElement_Node_0 extends BaseSymbolNode {
        symbol:"arrayElement";
        
        children:[STRING_Node];
        parent:Array_Node | Array_Node;
      }
interface ArrayElement_Node_34 extends BaseSymbolNode {
        symbol:"arrayElement";
        
        children:[NUMBER_Node];
        parent:Array_Node | Array_Node;
      }
interface ArrayElement_Node_35 extends BaseSymbolNode {
        symbol:"arrayElement";
        
        children:[LOGIC_Node];
        parent:Array_Node | Array_Node;
      }
interface ArrayElement_Node_36 extends BaseSymbolNode {
        symbol:"arrayElement";
        
        children:[ERROR_Node];
        parent:Array_Node | Array_Node;
      }
type ArrayElement_Node = ArrayElement_Node_0 | ArrayElement_Node_34 | ArrayElement_Node_35 | ArrayElement_Node_36;
interface Array_Node extends BaseSymbolNode {
        symbol:"array";
        
        children:Array<TOKEN_16_Node | ArrayElement_Node | ArrayElement_Node | ARRAY_SEPARATOR_Node | TOKEN_17_Node>;
        parent:Exp_Node_32;
      }
interface FunctionExp_Node extends BaseSymbolNode {
        symbol:"functionExp";
        
        children:[FUNCTION_Node,TOKEN_14_Node,ArgumentsList_Node,TOKEN_15_Node];
        parent:Exp_Node_31;
      }
interface ArgumentsList_Node_0 extends BaseSymbolNode {
        symbol:"argumentsList";
        
        children:Array<Exp_Node | ARGUMENT_SEPARATOR_Node | Exp_Node>;
        parent:FunctionExp_Node;
      }
interface ArgumentsList_Node_44 extends BaseSymbolNode {
        symbol:"argumentsList";
        
        children:Array<ARGUMENT_SEPARATOR_Node | Exp_Node>;
        parent:FunctionExp_Node;
      }
type ArgumentsList_Node = ArgumentsList_Node_0 | ArgumentsList_Node_44;
interface StructureReference_Node_0 extends BaseSymbolNode {
        symbol:"structureReference";
        
        children:[TABLE_NAME_Node,TableSpecifier_Node];
        parent:ReferenceItem_Node_26;
      }
interface StructureReference_Node_46 extends BaseSymbolNode {
        symbol:"structureReference";
        
        children:[TableSpecifier_Node];
        parent:ReferenceItem_Node_26;
      }
type StructureReference_Node = StructureReference_Node_0 | StructureReference_Node_46;
interface TableSpecifier_Node_0 extends BaseSymbolNode {
        symbol:"tableSpecifier";
        
        children:[TABLE_ITEM_SPECIFIER_Node];
        parent:StructureReference_Node;
      }
interface TableSpecifier_Node_48 extends BaseSymbolNode {
        symbol:"tableSpecifier";
        
        children:[TOKEN_18_Node,TableSpecifierInner_Node,TOKEN_19_Node];
        parent:StructureReference_Node;
      }
type TableSpecifier_Node = TableSpecifier_Node_0 | TableSpecifier_Node_48;
interface TableThisRow_Node_0 extends BaseSymbolNode {
        symbol:"tableThisRow";
        
        children:[TABLE_AT_Node];
        parent:TableSpecifierInner_Node;
      }
interface TableThisRow_Node_50 extends BaseSymbolNode {
        symbol:"tableThisRow";
        
        children:[TABLE_AT_Node,TABLE_COLUMN_SPECIFIER_Node];
        parent:TableSpecifierInner_Node;
      }
type TableThisRow_Node = TableThisRow_Node_0 | TableThisRow_Node_50;
interface TableSpecifierInner_Node_0 extends BaseSymbolNode {
        symbol:"tableSpecifierInner";
        
        children:[TableThisRow_Node];
        parent:TableSpecifier_Node_48;
      }
interface TableSpecifierInner_Node_52 extends BaseSymbolNode {
        symbol:"tableSpecifierInner";
        
        children:[TableColumnSpecifier_Node];
        parent:TableSpecifier_Node_48;
      }
type TableSpecifierInner_Node = TableSpecifierInner_Node_0 | TableSpecifierInner_Node_52;
interface TableSpecifierItem_Node_0 extends BaseSymbolNode {
        symbol:"tableSpecifierItem";
        
        children:[TABLE_COLUMN_SPECIFIER_Node];
        parent:TableColumnSpecifier_Node | TableColumnSpecifier_Node;
      }
interface TableSpecifierItem_Node_54 extends BaseSymbolNode {
        symbol:"tableSpecifierItem";
        
        children:[TABLE_ITEM_SPECIFIER_Node];
        parent:TableColumnSpecifier_Node | TableColumnSpecifier_Node;
      }
type TableSpecifierItem_Node = TableSpecifierItem_Node_0 | TableSpecifierItem_Node_54;
interface TableColumnSpecifier_Node extends BaseSymbolNode {
        symbol:"tableColumnSpecifier";
        
        children:Array<TableSpecifierItem_Node | TableSpecifierItem_Node | SPECIFIER_SEPARATOR_Node>;
        parent:TableSpecifierInner_Node_52;
      }
interface $EOF_Node extends BaseTokenNode {
        token:"$EOF";
        parent:AstSymbolNode;
      }
interface $UNKNOWN_Node extends BaseTokenNode {
        token:"$UNKNOWN";
        parent:AstSymbolNode;
      }
interface TOKEN_0_Node extends BaseTokenNode {
            token:"=";
            parent:Exp_Node;
          }
interface TOKEN_1_Node extends BaseTokenNode {
            token:"<=";
            parent:Exp_Node_3;
          }
interface TOKEN_2_Node extends BaseTokenNode {
            token:">=";
            parent:Exp_Node_4;
          }
interface TOKEN_3_Node extends BaseTokenNode {
            token:"<>";
            parent:Exp_Node_5;
          }
interface TOKEN_4_Node extends BaseTokenNode {
            token:">";
            parent:Exp_Node_6;
          }
interface TOKEN_5_Node extends BaseTokenNode {
            token:"<";
            parent:Exp_Node_7;
          }
interface TOKEN_6_Node extends BaseTokenNode {
            token:"&";
            parent:Exp_Node_8;
          }
interface TOKEN_7_Node extends BaseTokenNode {
            token:"+";
            parent:Exp_Node_9 | Exp_Node_14;
          }
interface TOKEN_8_Node extends BaseTokenNode {
            token:"-";
            parent:Exp_Node_10 | Exp_Node_15;
          }
interface TOKEN_9_Node extends BaseTokenNode {
            token:"*";
            parent:Exp_Node_11;
          }
interface TOKEN_10_Node extends BaseTokenNode {
            token:"/";
            parent:Exp_Node_12;
          }
interface TOKEN_11_Node extends BaseTokenNode {
            token:"^";
            parent:Exp_Node_13;
          }
interface TOKEN_12_Node extends BaseTokenNode {
            token:"@";
            parent:Exp_Node_16;
          }
interface TOKEN_13_Node extends BaseTokenNode {
            token:"%";
            parent:Exp_Node_17;
          }
interface TOKEN_14_Node extends BaseTokenNode {
            token:"(";
            parent:Exp_Node_18 | FunctionExp_Node;
          }
interface TOKEN_15_Node extends BaseTokenNode {
            token:")";
            parent:Exp_Node_18 | FunctionExp_Node;
          }
interface NUMBER_Node extends BaseTokenNode {
            token:"NUMBER";
            parent:Exp_Node_19 | ArrayElement_Node_34;
          }
interface STRING_Node extends BaseTokenNode {
            token:"STRING";
            parent:Exp_Node_20 | ArrayElement_Node;
          }
interface LOGIC_Node extends BaseTokenNode {
            token:"LOGIC";
            parent:Exp_Node_21 | ArrayElement_Node_35;
          }
interface ERROR_Node extends BaseTokenNode {
            token:"ERROR";
            parent:Exp_Node_22 | ArrayElement_Node_36;
          }
interface CELL_Node extends BaseTokenNode {
            token:"CELL";
            parent:ReferenceItem_Node;
          }
interface NAME_Node extends BaseTokenNode {
            token:"NAME";
            parent:ReferenceItem_Node_25;
          }
interface REF_UNION_OPERATOR_Node extends BaseTokenNode {
            token:"REF_UNION_OPERATOR";
            parent:Reference_Node;
          }
interface REF_RANGE_OPERATOR_Node extends BaseTokenNode {
            token:"REF_RANGE_OPERATOR";
            parent:Reference_Node_29;
          }
interface TOKEN_16_Node extends BaseTokenNode {
            token:"{";
            parent:Array_Node;
          }
interface TOKEN_17_Node extends BaseTokenNode {
            token:"}";
            parent:Array_Node;
          }
interface FUNCTION_Node extends BaseTokenNode {
            token:"FUNCTION";
            parent:FunctionExp_Node;
          }
interface TABLE_NAME_Node extends BaseTokenNode {
            token:"TABLE_NAME";
            parent:StructureReference_Node;
          }
interface TABLE_ITEM_SPECIFIER_Node extends BaseTokenNode {
            token:"TABLE_ITEM_SPECIFIER";
            parent:TableSpecifier_Node | TableSpecifierItem_Node_54;
          }
interface TOKEN_18_Node extends BaseTokenNode {
            token:"[";
            parent:TableSpecifier_Node_48;
          }
interface TOKEN_19_Node extends BaseTokenNode {
            token:"]";
            parent:TableSpecifier_Node_48;
          }
interface TABLE_AT_Node extends BaseTokenNode {
            token:"TABLE_AT";
            parent:TableThisRow_Node;
          }
interface TABLE_COLUMN_SPECIFIER_Node extends BaseTokenNode {
            token:"TABLE_COLUMN_SPECIFIER";
            parent:TableThisRow_Node_50 | TableSpecifierItem_Node;
          }
interface ARRAY_SEPARATOR_Node extends BaseTokenNode {
            token:"ARRAY_SEPARATOR";
            parent:Array_Node;
          }
interface ARGUMENT_SEPARATOR_Node extends BaseTokenNode {
            token:"ARGUMENT_SEPARATOR";
            parent:ArgumentsList_Node;
          }
interface SPECIFIER_SEPARATOR_Node extends BaseTokenNode {
            token:"SPECIFIER_SEPARATOR";
            parent:TableColumnSpecifier_Node;
          }
export type { Formula_Node,Exp_Node,ReferenceItem_Node,Reference_Node,ArrayElement_Node,Array_Node,FunctionExp_Node,ArgumentsList_Node,StructureReference_Node,TableSpecifier_Node,TableThisRow_Node,TableSpecifierInner_Node,TableSpecifierItem_Node,TableColumnSpecifier_Node,$EOF_Node,$UNKNOWN_Node,TOKEN_0_Node,TOKEN_1_Node,TOKEN_2_Node,TOKEN_3_Node,TOKEN_4_Node,TOKEN_5_Node,TOKEN_6_Node,TOKEN_7_Node,TOKEN_8_Node,TOKEN_9_Node,TOKEN_10_Node,TOKEN_11_Node,TOKEN_12_Node,TOKEN_13_Node,TOKEN_14_Node,TOKEN_15_Node,NUMBER_Node,STRING_Node,LOGIC_Node,ERROR_Node,CELL_Node,NAME_Node,REF_UNION_OPERATOR_Node,REF_RANGE_OPERATOR_Node,TOKEN_16_Node,TOKEN_17_Node,FUNCTION_Node,TABLE_NAME_Node,TABLE_ITEM_SPECIFIER_Node,TOKEN_18_Node,TOKEN_19_Node,TABLE_AT_Node,TABLE_COLUMN_SPECIFIER_Node,ARRAY_SEPARATOR_Node,ARGUMENT_SEPARATOR_Node,SPECIFIER_SEPARATOR_Node }