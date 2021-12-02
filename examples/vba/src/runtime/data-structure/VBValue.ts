import type { VBClass } from './VBClass';
import type { VBArray } from './VBArray';
import { Ast_ExitStmt_Node } from '../../parser';

export class VBByte {
  type: 'byte' = 'byte';
  constructor(public readonly value: number = 0) {}
}

export class VBDouble {
  type: 'double' = 'double';
  constructor(public readonly value: number = 0) {}
}

export class VBSingle {
  type: 'single' = 'single';
  constructor(public readonly value: number = 0) {}
}

export class VBInteger {
  type: 'integer' = 'integer';
  readonly value: number = 0;
  constructor(value: number = 0) {
    this.value = value | 0;
  }
}

export class VBLongLong {
  type: 'longlong' = 'longlong';
  constructor(public readonly value: number = 0) {}
}

export const VBLongPtr = VBLongLong;

export class VBLong {
  type: 'long' = 'long';
  constructor(public readonly value: number = 0) {}
}

export class VBCurrency {
  type: 'currency' = 'currency';
  constructor(public readonly value: number = 0) {}
}

export class VBDate {
  type: 'date' = 'date';
  constructor(public readonly value: number = 0) {}
}

export class VBDecimal {
  type: 'decimal' = 'decimal';
  constructor(public readonly value: number = 0) {}
}

export class VBString {
  type: 'string' = 'string';
  constructor(public readonly value: string = '') {}
}

export class VBNull {
  type: 'null' = 'null';
  readonly value = null;
}

export class VBEmpty {
  type: 'Empty' = 'Empty';
  readonly value = undefined;
}

export class VBBoolean {
  type: 'boolean' = 'boolean';
  constructor(public readonly value: boolean = false) {}
}

export interface Subscript {
  lower?: number;
  upper: number;
}

export class VBNothing {
  type: 'Nothing' = 'Nothing';
  readonly value: undefined;
}

export class VBMissingArgument {
  type: 'MissingArgument' = 'MissingArgument';
  readonly value: undefined;
}

export type VBBasicType =
  | VBByte
  | VBCurrency
  | VBDate
  | VBDecimal
  | VBInteger
  | VBDouble
  | VBLong
  | VBLongLong
  | VBSingle
  | VBNull
  | VBBoolean
  | VBString
  | VBNothing
  | VBMissingArgument
  | VBEmpty;

export const VBBasicTypeClasses = {
  string: VBString,
  single: VBSingle,
  integer: VBInteger,
  boolean: VBBoolean,
  byte: VBByte,
  currency: VBCurrency,
  date: VBDate,
  decimal: VBDecimal,
  double: VBDouble,
  long: VBLong,
  longLong: VBLongLong,
  variant: VBEmpty,
};

Object.keys(VBBasicTypeClasses).forEach((k) => {
  (VBBasicTypeClasses as any)[k.toLowerCase()] = (VBBasicTypeClasses as any)[k];
});

export type VBBasicTypeKey = keyof typeof VBBasicTypeClasses;

export type VBValue = VBBasicType | VBArray | VBClass;

export const VB_NULL = new VBNull();
export const VB_NOTHING = new VBNothing();
export const VB_EMPTY = new VBEmpty();
export const VB_MISSING_ARGUMENT = new VBMissingArgument();
export const VB_TRUE = new VBBoolean(true);
export const VB_FALSE = new VBBoolean(false);

export interface AsTypeClauseInfo {
  type?: VBBasicTypeKey;
  isArray: boolean;
  isNew?: boolean;
  classType?: string[];
  className?: string;
}

export const getDEFAULT_AS_TYPE: () => AsTypeClauseInfo = () => ({
  type: 'variant',
  isArray: false,
});

export type ExitToken = {
  type: 'Exit';
  subType: Ast_ExitStmt_Node['children'][0]['token'];
};

export const VB_EXIT_SUB: ExitToken = {
  type: 'Exit',
  subType: 'EXIT_SUB',
};
export const VB_EXIT_FOR: ExitToken = {
  type: 'Exit',
  subType: 'EXIT_FOR',
};
export const VB_EXIT_FUNCTION: ExitToken = {
  type: 'Exit',
  subType: 'EXIT_FUNCTION',
};
export const VB_EXIT_PROPERTY: ExitToken = {
  type: 'Exit',
  subType: 'EXIT_PROPERTY',
};
export const VB_EXIT_DO: ExitToken = {
  type: 'Exit',
  subType: 'EXIT_DO',
};
export const VB_EXIT_END: ExitToken = {
  type: 'Exit',
  subType: 'END',
};

export type PromiseOrNot<T> = T | Promise<T>;

export type PromiseOrNotFn<T> = () => PromiseOrNot<T>;

export function getExitToken(node: Ast_ExitStmt_Node) {
  const c = node.children[0];
  if (c.token === 'END') {
    return VB_EXIT_END;
  }
  if (c.token === 'EXIT_FUNCTION') {
    return VB_EXIT_FUNCTION;
  }
  if (c.token === 'EXIT_SUB') {
    return VB_EXIT_SUB;
  }
  if (c.token === 'EXIT_PROPERTY') {
    return VB_EXIT_PROPERTY;
  }
  if (c.token === 'EXIT_FOR') {
    return VB_EXIT_FOR;
  }
  if (c.token === 'EXIT_DO') {
    return VB_EXIT_DO;
  }
  throw new Error('unexpected exit!');
}
