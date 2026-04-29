import { Instruction } from '../interfaces/models';
import { Opcodes } from './opcodes.constants';

export class ScriptParser {
  public static parse(scriptText: string): Instruction[] {
    if (!scriptText || scriptText.trim() === '') {
      return [];
    }
    const tokens = scriptText.trim().split(/\s+/);
    const instructions: Instruction[] = [];

    for (const token of tokens) {
      if (token in Opcodes && isNaN(Number(token))) {
        const opcodeNum = Opcodes[token as keyof typeof Opcodes];

        instructions.push({
          opcode: opcodeNum,
          name: token
        });
        continue;
      } 
      
      if (this.isHexString(token)) {
        const dataBytes = this.hexToBytes(token);
        const byteLength = dataBytes.length;
        let opcodeNum: number;

        if (byteLength >= 1 && byteLength <= 75) {
            opcodeNum = byteLength;
        } else if (byteLength <= 255) {
            opcodeNum = 0x4c;
        } else if (byteLength <= 65535) {
            opcodeNum = 0x4d;
        } else {
            opcodeNum = 0x4e;
        }

        instructions.push({
            opcode: opcodeNum,
            name: `OP_PUSHBYTES_${byteLength}`, 
            data: dataBytes
        });
        continue;
      }
      
      throw new Error(`Syntax error: Opcode or hex value not valid: '${token}'`);
    }

    return instructions;
  }

  private static isHexString(str: string): boolean {
    return /^[0-9a-fA-F]+$/.test(str) && str.length % 2 === 0;
  }

  public static hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }
}