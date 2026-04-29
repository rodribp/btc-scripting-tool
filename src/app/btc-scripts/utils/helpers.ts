import { secp256k1 } from '@noble/curves/secp256k1.js';
import { Instruction, StackItem, TxContext } from '../interfaces/models';
import { Transaction } from 'bitcoinjs-lib';
import { Opcodes } from './opcodes.constants';

export class HelperFunctions {
  public static defaultErrorMessages(typeError: string, ...args: any[]) {
    let message;
    switch (typeError) {
      case 'requiredItems':
        message = `requires at least ${args[0]} items in stack.`;
        break;
    }

    return message;
  }

  public static isValidPubkeyFormat(pubKey: StackItem): boolean {
    return (
      (pubKey.length === 33 && (pubKey[0] === 0x02 || pubKey[0] === 0x03)) ||
      (pubKey.length === 65 && pubKey[0] === 0x04)
    );
  }

  public static serializeScript(instructions: Instruction[]): Uint8Array {
    const parts: Uint8Array[] = [];

    for (const instr of instructions) {
      if (instr.opcode >= 0x01 && instr.opcode <= 0x4b) {
        parts.push(new Uint8Array([instr.opcode]));
        parts.push(instr.data!);
      } else if (instr.opcode === 0x4c) {
        parts.push(new Uint8Array([0x4c, instr.data!.length]));
        parts.push(instr.data!);
      } else if (instr.opcode === 0x4d) {
        const len = instr.data!.length;
        parts.push(new Uint8Array([0x4d, len & 0xff, (len >> 8) & 0xff]));
        parts.push(instr.data!);
      } else if (instr.opcode === 0x4e) {
        const len = instr.data!.length;
        parts.push(
          new Uint8Array([
            0x4e,
            len & 0xff,
            (len >> 8) & 0xff,
            (len >> 16) & 0xff,
            (len >> 24) & 0xff,
          ]),
        );
        parts.push(instr.data!);
      } else {
        parts.push(new Uint8Array([instr.opcode]));
      }
    }

    const totalLength = parts.reduce((sum, p) => sum + p.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  }
}

export class Op {
  public static equal(a: StackItem, b: StackItem): boolean {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }

  public static verify(topItem: StackItem): boolean {
    for (let i = 0; i < topItem.length; i++) {
      if (topItem[i] !== 0) {
        if (i === topItem.length - 1 && topItem[i] === 0x80) {
          return false;
        }
        return true;
      }
    }
    return false;
  }

  public static checkSig(
    pubKey: StackItem,
    signature: StackItem,
    txContext: TxContext,
    codeSeparatorIndex: number,
  ): boolean {
    if (signature.length === 0) {
      return false;
    }

    const sigHashType = signature[signature.length - 1];
    const derSignature = signature.slice(0, -1);

    if (derSignature.length > 0 && derSignature[0] !== 0x30) {
      return false;
    }

    if (!HelperFunctions.isValidPubkeyFormat(pubKey)) {
      return false;
    }

    const subscriptInstructions = txContext.previousScriptPubkey
      .slice(codeSeparatorIndex)
      .filter((instr) => instr.opcode !== Opcodes.OP_CODESEPARATOR);

    const compiledSubscript = HelperFunctions.serializeScript(subscriptInstructions);
    const tx = Transaction.fromBuffer(txContext.txCurrent);
    const sighash = tx.hashForSignature(txContext.vin, compiledSubscript, sigHashType);
    let isValid;
    try {
      isValid = secp256k1.verify(derSignature, sighash, pubKey, {
        prehash: false,
        format: 'der',
      });
    } catch {
      isValid = false;
    }

    return isValid;
  }
}
