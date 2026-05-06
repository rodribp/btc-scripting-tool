export type StackItem = Uint8Array;

export interface Instruction {
  opcode: number;
  name: string;
  data?: Uint8Array;
}

export interface VmState {
  readonly stack: StackItem[];
  readonly altStack: StackItem[];
  readonly script: Instruction[];
  readonly ip: number;
  readonly isComplete: boolean;
  readonly isValid: boolean;
  readonly error?: string;
  readonly lastCodeSeparatorIndex: number;
  readonly vfExec: boolean[];
}

export interface TxContext {
  txCurrent: Uint8Array;
  vin: number;
  previousScriptPubkey: Instruction[];
  amount: bigint;
}