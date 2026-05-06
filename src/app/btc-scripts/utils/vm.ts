import { Opcodes } from './opcodes.constants';
import { Instruction, StackItem, TxContext, VmState } from '../interfaces/models';
import { hash160, ripemd160, hash256, sha256, sha1 } from 'bitcoinjs-lib/src/crypto';
import { HelperFunctions, Op } from './helpers';

export class BitcoinVM {
  public static initialize(script: Instruction[]): VmState {
    return {
      stack: [],
      altStack: [],
      script: script,
      ip: 0,
      isComplete: script.length === 0,
      isValid: false,
      lastCodeSeparatorIndex: 0,
      vfExec: [],
    };
  }

  public static step(currentState: VmState, txContext?: TxContext): VmState {
    if (currentState.isComplete || currentState.error) {
      return currentState;
    }

    const instruction = currentState.script[currentState.ip];

    const env = {
      stack: [...currentState.stack],
      altStack: [...currentState.altStack],
      codeSeparatorIndex: currentState.lastCodeSeparatorIndex,
      ip: currentState.ip,
      vfExec: [...currentState.vfExec],
    };
    let error: string | undefined = undefined;

    try {
      if (
        instruction.opcode === Opcodes.OP_IF ||
        instruction.opcode === Opcodes.OP_NOTIF ||
        instruction.opcode === Opcodes.OP_ELSE ||
        instruction.opcode === Opcodes.OP_ENDIF ||
        env.vfExec.length === 0 ||
        env.vfExec[env.vfExec.length - 1]
      ) {
        this.executeInstruction(instruction, env, txContext);
        console.log(env.vfExec);
      }
    } catch (e: any) {
      error = e.message;
    }

    const nextIp = currentState.ip + 1;
    const isComplete = nextIp >= currentState.script.length;
    const topItem = env.stack[env.stack.length - 1];
    const isValid =
      isComplete && !error && env.stack.length > 0 && Op.verify(topItem) && env.vfExec.length === 0;

    return {
      stack: env.stack,
      altStack: env.altStack,
      script: currentState.script,
      ip: nextIp,
      isComplete,
      isValid,
      error,
      lastCodeSeparatorIndex: env.codeSeparatorIndex,
      vfExec: env.vfExec,
    };
  }

  private static executeInstruction(
    instruction: Instruction,
    env: {
      stack: StackItem[];
      altStack: StackItem[];
      codeSeparatorIndex: number;
      ip: number;
      vfExec: boolean[];
    },
    txContext?: TxContext,
  ): void {
    const { stack, altStack, ip, vfExec } = env;

    // OP_PUSHBYTES
    if (instruction.opcode >= 0x01 && instruction.opcode <= 0x4e) {
      if (!instruction.data) {
        throw new Error(`Data payload is missing in instruction: ${instruction.name}`);
      }
      stack.push(new Uint8Array(instruction.data));
      return;
    }

    //OP_1 - OP_16
    if (instruction.opcode >= Opcodes.OP_1 && instruction.opcode <= Opcodes.OP_16) {
      stack.push(new Uint8Array([instruction.opcode - 0x50]));
      return;
    }

    switch (instruction.opcode) {
      case Opcodes.OP_CODESEPARATOR: {
        env.codeSeparatorIndex = env.ip + 1;
        break;
      }

      case Opcodes.OP_0: {
        stack.push(new Uint8Array([]));
        break;
      }

      case Opcodes.OP_1NEGATE: {
        stack.push(new Uint8Array([0x81]));
        break;
      }

      case Opcodes.OP_ADD: {
        if (stack.length < 2) {
          throw new Error(`OP_ADD ${HelperFunctions.defaultErrorMessages('requiredItems', 2)}`);
        }
        const a = stack.pop()!;
        const b = stack.pop()!;
        const result = new Uint8Array([(a[0] || 0) + (b[0] || 0)]);
        stack.push(result);
        break;
      }

      case Opcodes.OP_DUP: {
        if (stack.length < 1) {
          throw new Error(`OP_DUP ${HelperFunctions.defaultErrorMessages('requiredItems', 1)}`);
        }
        const topItem = stack[stack.length - 1];
        stack.push(new Uint8Array(topItem));
        break;
      }

      case Opcodes.OP_DROP: {
        if (stack.length < 1) {
          throw new Error(`OP_DROP ${HelperFunctions.defaultErrorMessages('requiredItems', 1)}`);
        }
        stack.pop();
        break;
      }

      case Opcodes.OP_HASH160: {
        if (stack.length < 1) {
          throw new Error(`OP_HASH160 ${HelperFunctions.defaultErrorMessages('requiredItems', 1)}`);
        }
        const a = stack.pop()!;
        const hash = hash160(a);
        stack.push(hash);
        break;
      }

      case Opcodes.OP_VERIFY: {
        if (stack.length < 1) {
          throw new Error(`OP_VERIFY ${HelperFunctions.defaultErrorMessages('requiredItems', 1)}`);
        }
        const topItem = stack.pop()!;
        if (!Op.verify(topItem)) {
          throw new Error(`Script failed OP_VERIFY`);
        }
        break;
      }

      case Opcodes.OP_EQUAL: {
        if (stack.length < 2) {
          throw new Error(`OP_EQUAL ${HelperFunctions.defaultErrorMessages('requiredItems', 2)}`);
        }
        const a = stack.pop()!;
        const b = stack.pop()!;
        const result = Op.equal(a, b);
        stack.push(new Uint8Array(result ? [1] : []));
        break;
      }

      case Opcodes.OP_EQUALVERIFY: {
        if (stack.length < 2) {
          throw new Error(
            `OP_EQUALVERIFY ${HelperFunctions.defaultErrorMessages('requiredItems', 2)}`,
          );
        }
        const a = stack.pop()!;
        const b = stack.pop()!;
        const result = Op.equal(a, b);

        if (!result) {
          throw new Error(`Script failed in OP_EQUALVERIFY`);
        }

        break;
      }

      case Opcodes.OP_CHECKSIG: {
        if (stack.length < 2) {
          throw new Error(
            `OP_CHECKSIG ${HelperFunctions.defaultErrorMessages('requiredItems', 2)}`,
          );
        }

        if (
          !txContext ||
          !txContext.amount ||
          !txContext.previousScriptPubkey ||
          !txContext.txCurrent ||
          txContext.vin === null ||
          txContext.vin === undefined
        ) {
          throw new Error(
            `OP_CHECKSIG requires a full TX Context. (txCurrent: Uint8Array, vin (index): number, previousScriptPubkey: Instruction[], amount: bigint)`,
          );
        }

        const pubKey = stack.pop()!;
        const signature = stack.pop()!;

        const result = Op.checkSig(pubKey, signature, txContext, env.codeSeparatorIndex);

        stack.push(new Uint8Array(result ? [1] : []));
        break;
      }

      case Opcodes.OP_CHECKSIGVERIFY: {
        if (stack.length < 2) {
          throw new Error(
            `OP_CHECKSIGVERIFY ${HelperFunctions.defaultErrorMessages('requiredItems', 2)}`,
          );
        }

        if (
          !txContext ||
          !txContext.amount ||
          !txContext.previousScriptPubkey ||
          !txContext.txCurrent ||
          txContext.vin === null ||
          txContext.vin === undefined
        ) {
          throw new Error(
            `OP_CHECKSIGVERIFY requires a full TX Context. (txCurrent: Uint8Array, vin (index): number, previousScriptPubkey: Instruction[], amount: bigint)`,
          );
        }

        const pubKey = stack.pop()!;
        const signature = stack.pop()!;

        const result = Op.checkSig(pubKey, signature, txContext, env.codeSeparatorIndex);

        if (!result) {
          throw new Error('Script failed in OP_CHECKSIGVERIFY');
        }
        break;
      }

      case Opcodes.OP_RIPEMD160: {
        if (stack.length < 1) {
          throw new Error(
            `OP_RIPEMD160 ${HelperFunctions.defaultErrorMessages('requiredItems', 1)}`,
          );
        }

        const a = stack.pop()!;

        stack.push(ripemd160(a));

        break;
      }

      case Opcodes.OP_SHA1: {
        if (stack.length < 1) {
          throw new Error(`OP_SHA1 ${HelperFunctions.defaultErrorMessages('requiredItems', 1)}`);
        }

        const a = stack.pop()!;

        stack.push(sha1(a));

        break;
      }

      case Opcodes.OP_SHA256: {
        if (stack.length < 1) {
          throw new Error(`OP_SHA256 ${HelperFunctions.defaultErrorMessages('requiredItems', 1)}`);
        }

        const a = stack.pop()!;

        stack.push(sha256(a));

        break;
      }

      case Opcodes.OP_HASH256: {
        if (stack.length < 1) {
          throw new Error(`OP_HASH256 ${HelperFunctions.defaultErrorMessages('requiredItems', 1)}`);
        }
        const a = stack.pop()!;

        stack.push(hash256(a));

        break;
      }

      case Opcodes.OP_NOP:
        //Does nothing
        break;

      case Opcodes.OP_IF: {
        if (stack.length < 1) {
          throw new Error(`OP_IF ${HelperFunctions.defaultErrorMessages('requiredItems', 1)}`);
        }
        const topItem = stack[stack.length - 1];
        vfExec.push(Op.verify(topItem));
        stack.pop();
        break;
      }

      case Opcodes.OP_NOTIF: {
        if (stack.length < 1) {
          throw new Error(`OP_IF ${HelperFunctions.defaultErrorMessages('requiredItems', 1)}`);
        }
        const topItem = stack[stack.length - 1];
        vfExec.push(!Op.verify(topItem));
        stack.pop();
        break;
      }

      case Opcodes.OP_ELSE: {
        if (vfExec.length === 0) {
          throw new Error(`OP_ELSE requires an OP_IF earlier`);
        }
        const flipped = !vfExec.pop();
        vfExec.push(flipped);
        break;
      }

      case Opcodes.OP_ENDIF: {
        if (vfExec.length === 0) {
          throw new Error(`OP_ENDIF requires an OP_IF earlier`);
        }
        vfExec.pop();
        break;
      }

      default:
        throw new Error(`Opcode ${instruction.name} not implemented`);
    }
  }
}
