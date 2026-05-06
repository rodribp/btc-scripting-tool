import { effect, Injectable, signal } from '@angular/core';
import { OpcodeControl } from '../utils/opcodes.constants';
import { Instruction, TxContext } from '../interfaces/models';
import { ScriptParser } from '../utils/script-parser';

export interface PlacedBlock {
  id: string;
  opcode: OpcodeControl;
  userValues: Record<string, string>;
  color: string;
}

const loadFromLocalStorage = (): PlacedBlock[] => {
  const blocksHistory = localStorage.getItem('blocksHistory') ?? '[]';
  return JSON.parse(blocksHistory);
}

@Injectable({ providedIn: 'root' })
export class ScriptBuilderService {
  blocks = signal<PlacedBlock[]>([]);

  constructor() {
    this.blocks.set(loadFromLocalStorage());
  }

  addBlock(opcode: OpcodeControl, color: string): void {
    this.blocks.update((blocks) => [
      ...blocks,
      { id: crypto.randomUUID(), opcode, userValues: {}, color },
    ]);
  }

  removeBlock(id: string): void {
    this.blocks.update((blocks) => blocks.filter((b) => b.id !== id));
  }

  updateBlockValue(id: string, key: string, value: string): void {
    this.blocks.update((blocks) =>
      blocks.map((b) =>
        b.id === id ? { ...b, userValues: { ...b.userValues, [key]: value } } : b,
      ),
    );
  }

  saveBlocksToLocalStorage = effect(() => {
    localStorage.setItem('blocksHistory', JSON.stringify(this.blocks()));
  })  
  
  clear() {
    this.blocks.set([]);
  }

  cloneBlock(id: string): void {
    this.blocks.update((blocks) => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return blocks;
      const clone: PlacedBlock = {
        ...blocks[index],
        id: crypto.randomUUID(),
        userValues: { ...blocks[index].userValues },
      };
      const updated = [...blocks];
      updated.splice(index + 1, 0, clone);
      return updated;
    });
  }

  reorder(from: number, to: number): void {
    this.blocks.update((blocks) => {
      const updated = [...blocks];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }

  compile(): { script: Instruction[]; txContext?: TxContext } {
    const script: Instruction[] = [];
    let txContext: TxContext | undefined;

    for (const { opcode, userValues } of this.blocks()) {
      if (opcode.name === 'OP_2 - OP_16') {
        const value = parseInt(userValues['op2to16Option'] ?? '2', 10);
        script.push({ opcode: 0x50 + value, name: `OP_${value}` });
        continue;
      }

      if (opcode.name === 'OP_PUSHBYTES') {
        const hex = userValues['pushbytesValue'] ?? '';
        const data = ScriptParser.hexToBytes(hex);
        const len = data.length;
        const opcodeNum = len <= 75 ? len : len <= 255 ? 0x4c : len <= 65535 ? 0x4d : 0x4e;
        script.push({ opcode: opcodeNum, name: `OP_PUSHBYTES_${len}`, data });
        continue;
      }

      if (
        opcode.name === 'OP_PUSHDATA1' ||
        opcode.name === 'OP_PUSHDATA2' ||
        opcode.name === 'OP_PUSHDATA4'
      ) {
        const key = opcode.userEntries![0].key;
        const data = ScriptParser.hexToBytes(userValues[key] ?? '');
        script.push({ opcode: opcode.number!, name: opcode.name, data });
        continue;
      }

      if (opcode.name === 'OP_CHECKSIG' || opcode.name === 'OP_CHECKSIGVERIFY') {
        txContext = {
          txCurrent: ScriptParser.hexToBytes(userValues['hexTx'] ?? ''),
          vin: parseInt(userValues['vinIndex'] ?? '0', 10),
          previousScriptPubkey: ScriptParser.parse(userValues['prevScriptPubKey'] ?? ''),
          amount: BigInt(userValues['amount'] ?? '0'),
        };
        script.push({ opcode: opcode.number!, name: opcode.name });
        continue;
      }

      script.push({ opcode: opcode.number!, name: opcode.name });
    }

    return { script, txContext };
  }
}
