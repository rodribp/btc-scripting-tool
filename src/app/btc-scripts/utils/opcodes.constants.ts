export enum Opcodes {
  // --- Constants --- ✅
  OP_0 = 0x00,
  OP_FALSE = 0x00,
  OP_1 = 0x51,
  OP_TRUE = 0x51,
  OP_2 = 0x52,
  OP_3 = 0x53,
  OP_4 = 0x54,
  OP_5 = 0x55,
  OP_6 = 0x56,
  OP_7 = 0x57,
  OP_8 = 0x58,
  OP_9 = 0x59,
  OP_10 = 0x5a,
  OP_11 = 0x5b,
  OP_12 = 0x5c,
  OP_13 = 0x5d,
  OP_14 = 0x5e,
  OP_15 = 0x5f,
  OP_16 = 0x60,

  // --- Push Data --- ✅
  OP_PUSHDATA1 = 0x4c,
  OP_PUSHDATA2 = 0x4d,
  OP_PUSHDATA4 = 0x4e,
  OP_1NEGATE = 0x4f,

  // --- Flow Control ---
  OP_NOP = 0x61,
  OP_IF = 0x63,
  OP_NOTIF = 0x64,
  OP_ELSE = 0x67,
  OP_ENDIF = 0x68,
  OP_VERIFY = 0x69,
  OP_RETURN = 0x6a,

  // --- Stack Manipulation ---
  OP_TOALTSTACK = 0x6b,
  OP_FROMALTSTACK = 0x6c,
  OP_IFDUP = 0x73,
  OP_DEPTH = 0x74,
  OP_DROP = 0x75, //✅
  OP_DUP = 0x76, //✅
  OP_NIP = 0x77,
  OP_OVER = 0x78,
  OP_PICK = 0x79,
  OP_ROLL = 0x7a,
  OP_ROT = 0x7b,
  OP_SWAP = 0x7c,
  OP_TUCK = 0x7d,

  // --- Splice (Many of these are disabled in standard Bitcoin) ---
  OP_CAT = 0x7e, // 🚫 disabled
  OP_SUBSTR = 0x7f, // 🚫 disabled
  OP_LEFT = 0x80, // 🚫 disabled
  OP_RIGHT = 0x81, // 🚫 disabled
  OP_SIZE = 0x82,

  // --- Bitwise Logic --- ✅
  OP_INVERT = 0x83, // 🚫 disabled
  OP_AND = 0x84, // 🚫 disabled
  OP_OR = 0x85, // 🚫 disabled
  OP_XOR = 0x86, // 🚫 disabled
  OP_EQUAL = 0x87, //✅
  OP_EQUALVERIFY = 0x88, //✅

  // --- Arithmetic ---
  OP_1ADD = 0x8b,
  OP_1SUB = 0x8c,
  OP_2MUL = 0x8d, // 🚫 disabled
  OP_2DIV = 0x8e, // 🚫 disabled
  OP_NEGATE = 0x8f,
  OP_ABS = 0x90,
  OP_NOT = 0x91,
  OP_0NOTEQUAL = 0x92,
  OP_ADD = 0x93, //✅
  OP_SUB = 0x94,
  OP_MUL = 0x95, // 🚫 disabled
  OP_DIV = 0x96, // 🚫 disabled
  OP_MOD = 0x97, // 🚫 disabled
  OP_LSHIFT = 0x98, // 🚫 disabled
  OP_RSHIFT = 0x99, // 🚫 disabled
  OP_BOOLAND = 0x9a,
  OP_BOOLOR = 0x9b,
  OP_NUMEQUAL = 0x9c,
  OP_NUMEQUALVERIFY = 0x9d,
  OP_NUMNOTEQUAL = 0x9e,
  OP_LESSTHAN = 0x9f,
  OP_GREATERTHAN = 0xa0,
  OP_LESSTHANOREQUAL = 0xa1,
  OP_GREATERTHANOREQUAL = 0xa2,
  OP_MIN = 0xa3,
  OP_MAX = 0xa4,
  OP_WITHIN = 0xa5,

  // --- Hashing & Signatures ---
  OP_RIPEMD160 = 0xa6, //✅
  OP_SHA1 = 0xa7, //✅
  OP_SHA256 = 0xa8, //✅
  OP_HASH160 = 0xa9, //✅
  OP_HASH256 = 0xaa, //✅
  OP_CODESEPARATOR = 0xab, //✅
  OP_CHECKSIG = 0xac, //✅
  OP_CHECKSIGVERIFY = 0xad, //✅ Not sure if it works, to be tested yet.
  OP_CHECKMULTISIG = 0xae,
  OP_CHECKMULTISIGVERIFY = 0xaf,

  // --- Expansion & Upgrades ---
  OP_NOP1 = 0xb0,
  OP_CHECKLOCKTIMEVERIFY = 0xb1, // OP_NOP2 redefined in BIP65
  OP_CHECKSEQUENCEVERIFY = 0xb2, // OP_NOP3 redefined in BIP112
  OP_NOP4 = 0xb3,
  OP_NOP5 = 0xb4,
  OP_NOP6 = 0xb5,
  OP_NOP7 = 0xb6,
  OP_NOP8 = 0xb7,
  OP_NOP9 = 0xb8,
  OP_NOP10 = 0xb9,
}

export interface UserEntry {
  key: string;
  label: string;
  type: 'hex' | 'number' | 'bigint' | 'text';
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface OpcodeControl {
  number?: number;
  name: string;
  alias?: string;
  active: boolean;
  userEntries?: UserEntry[];
}

export interface OpcodeSection {
  section: string;
  opcodes: OpcodeControl[];
}

export const opcodesController: OpcodeSection[] = [
  {
    section: 'Constants and data push',
    opcodes: [
      { number: Opcodes.OP_0, name: 'OP_0', alias: 'OP_FALSE', active: true },
      { number: Opcodes.OP_1, name: 'OP_1', alias: 'OP_TRUE', active: true },
      {
        name: 'OP_2 - OP_16',
        active: true,
        userEntries: [
          {
            key: 'op2to16Option',
            label: '2 - 16',
            type: 'number',
            min: 2,
            max: 16,
          },
        ],
      },
      {
        name: 'OP_PUSHBYTES',
        active: true,
        userEntries: [
          {
            key: 'pushbytesValue',
            label: 'Hex',
            type: 'hex',
          },
        ],
      },
      {
        number: Opcodes.OP_PUSHDATA1,
        name: 'OP_PUSHDATA1',
        active: true,
        userEntries: [
          {
            key: 'pushdata1Value',
            label: 'Hex',
            type: 'hex',
          },
        ],
      },
      {
        number: Opcodes.OP_PUSHDATA2,
        name: 'OP_PUSHDATA2',
        active: true,
        userEntries: [
          {
            key: 'pushdata2Value',
            label: 'Hex',
            type: 'hex',
          },
        ],
      },
      {
        number: Opcodes.OP_PUSHDATA4,
        name: 'OP_PUSHDATA4',
        active: true,
        userEntries: [
          {
            key: 'pushdata4Value',
            label: 'Hex',
            type: 'hex',
          },
        ],
      },
      { number: Opcodes.OP_1NEGATE, name: 'OP_1NEGATE', active: false },
    ],
  },
  {
    section: 'Flow control',
    opcodes: [
      { number: Opcodes.OP_NOP, name: 'OP_NOP', active: false },
      { number: Opcodes.OP_IF, name: 'OP_IF', active: false },
      { number: Opcodes.OP_NOTIF, name: 'OP_NOTIF', active: false },
      { number: Opcodes.OP_ELSE, name: 'OP_ELSE', active: false },
      { number: Opcodes.OP_ENDIF, name: 'OP_ENDIF', active: false },
      { number: Opcodes.OP_VERIFY, name: 'OP_VERIFY', active: true },
      { number: Opcodes.OP_RETURN, name: 'OP_RETURN', active: false },
    ],
  },
  {
    section: 'Stack manipulation',
    opcodes: [
      { number: Opcodes.OP_TOALTSTACK, name: 'OP_TOALTSTACK', active: false },
      { number: Opcodes.OP_FROMALTSTACK, name: 'OP_FROMALTSTACK', active: false },
      { number: Opcodes.OP_IFDUP, name: 'OP_IFDUP', active: false },
      { number: Opcodes.OP_DEPTH, name: 'OP_DEPTH', active: false },
      { number: Opcodes.OP_DROP, name: 'OP_DROP', active: true },
      { number: Opcodes.OP_DUP, name: 'OP_DUP', active: true },
      { number: Opcodes.OP_NIP, name: 'OP_NIP', active: false },
      { number: Opcodes.OP_OVER, name: 'OP_OVER', active: false },
      { number: Opcodes.OP_PICK, name: 'OP_PICK', active: false },
      { number: Opcodes.OP_ROLL, name: 'OP_ROLL', active: false },
      { number: Opcodes.OP_ROT, name: 'OP_ROT', active: false },
      { number: Opcodes.OP_SWAP, name: 'OP_SWAP', active: false },
      { number: Opcodes.OP_TUCK, name: 'OP_TUCK', active: false },
    ],
  },
  {
    section: 'Splice',
    opcodes: [
      { number: Opcodes.OP_CAT, name: 'OP_CAT', active: false },
      { number: Opcodes.OP_SUBSTR, name: 'OP_SUBSTR', active: false },
      { number: Opcodes.OP_LEFT, name: 'OP_LEFT', active: false },
      { number: Opcodes.OP_RIGHT, name: 'OP_RIGHT', active: false },
      { number: Opcodes.OP_SIZE, name: 'OP_SIZE', active: false },
    ],
  },
  {
    section: 'Bitwise logic',
    opcodes: [
      { number: Opcodes.OP_INVERT, name: 'OP_INVERT', active: false },
      { number: Opcodes.OP_AND, name: 'OP_AND', active: false },
      { number: Opcodes.OP_OR, name: 'OP_OR', active: false },
      { number: Opcodes.OP_XOR, name: 'OP_XOR', active: false },
      { number: Opcodes.OP_EQUAL, name: 'OP_EQUAL', active: true },
      { number: Opcodes.OP_EQUALVERIFY, name: 'OP_EQUALVERIFY', active: true },
    ],
  },
  {
    section: 'Arithmetic',
    opcodes: [
      { number: Opcodes.OP_1ADD, name: 'OP_1ADD', active: false },
      { number: Opcodes.OP_1SUB, name: 'OP_1SUB', active: false },
      { number: Opcodes.OP_2MUL, name: 'OP_2MUL', active: false },
      { number: Opcodes.OP_2DIV, name: 'OP_2DIV', active: false },
      { number: Opcodes.OP_NEGATE, name: 'OP_NEGATE', active: false },
      { number: Opcodes.OP_ABS, name: 'OP_ABS', active: false },
      { number: Opcodes.OP_NOT, name: 'OP_NOT', active: false },
      { number: Opcodes.OP_0NOTEQUAL, name: 'OP_0NOTEQUAL', active: false },
      { number: Opcodes.OP_ADD, name: 'OP_ADD', active: true },
      { number: Opcodes.OP_SUB, name: 'OP_SUB', active: false },
      { number: Opcodes.OP_MUL, name: 'OP_MUL', active: false },
      { number: Opcodes.OP_DIV, name: 'OP_DIV', active: false },
      { number: Opcodes.OP_MOD, name: 'OP_MOD', active: false },
      { number: Opcodes.OP_LSHIFT, name: 'OP_LSHIFT', active: false },
      { number: Opcodes.OP_RSHIFT, name: 'OP_RSHIFT', active: false },
      { number: Opcodes.OP_BOOLAND, name: 'OP_BOOLAND', active: false },
      { number: Opcodes.OP_BOOLOR, name: 'OP_BOOLOR', active: false },
      { number: Opcodes.OP_NUMEQUAL, name: 'OP_NUMEQUAL', active: false },
      { number: Opcodes.OP_NUMEQUALVERIFY, name: 'OP_NUMEQUALVERIFY', active: false },
      { number: Opcodes.OP_NUMNOTEQUAL, name: 'OP_NUMNOTEQUAL', active: false },
      { number: Opcodes.OP_LESSTHAN, name: 'OP_LESSTHAN', active: false },
      { number: Opcodes.OP_GREATERTHAN, name: 'OP_GREATERTHAN', active: false },
      { number: Opcodes.OP_LESSTHANOREQUAL, name: 'OP_LESSTHANOREQUAL', active: false },
      { number: Opcodes.OP_GREATERTHANOREQUAL, name: 'OP_GREATERTHANOREQUAL', active: false },
      { number: Opcodes.OP_MIN, name: 'OP_MIN', active: false },
      { number: Opcodes.OP_MAX, name: 'OP_MAX', active: false },
      { number: Opcodes.OP_WITHIN, name: 'OP_WITHIN', active: false },
    ],
  },
  {
    section: 'Hashing and signatures',
    opcodes: [
      { number: Opcodes.OP_RIPEMD160, name: 'OP_RIPEMD160', active: true },
      { number: Opcodes.OP_SHA1, name: 'OP_SHA1', active: true },
      { number: Opcodes.OP_SHA256, name: 'OP_SHA256', active: true },
      { number: Opcodes.OP_HASH160, name: 'OP_HASH160', active: true },
      { number: Opcodes.OP_HASH256, name: 'OP_HASH256', active: true },
      { number: Opcodes.OP_CODESEPARATOR, name: 'OP_CODESEPARATOR', active: true },
      {
        number: Opcodes.OP_CHECKSIG,
        name: 'OP_CHECKSIG',
        active: true,
        userEntries: [
          {
            key: 'hexTx',
            label: 'Tx hex',
            type: 'hex',
          },
          {
            key: 'prevScriptPubKey',
            label: 'Previous script PubKey',
            type: 'text',
          },
          {
            key: 'amount',
            label: 'Input amount (satoshis)',
            type: 'number',
          },
          {
            key: 'vinIndex',
            label: 'Index of the input',
            type: 'number',
          },
        ],
      },
      {
        number: Opcodes.OP_CHECKSIGVERIFY,
        name: 'OP_CHECKSIGVERIFY',
        active: true,
        userEntries: [
          {
            key: 'hexTx',
            label: 'Tx hex',
            type: 'hex',
          },
          {
            key: 'prevScriptPubKey',
            label: 'Previous script PubKey',
            type: 'text',
          },
          {
            key: 'amount',
            label: 'Input amount (satoshis)',
            type: 'bigint',
          },
          {
            key: 'vinIndex',
            label: 'Index of the input',
            type: 'number',
          },
        ],
      },
      { number: Opcodes.OP_CHECKMULTISIG, name: 'OP_CHECKMULTISIG', active: false },
      { number: Opcodes.OP_CHECKMULTISIGVERIFY, name: 'OP_CHECKMULTISIGVERIFY', active: false },
    ],
  },
  {
    section: 'Expansion and upgrades',
    opcodes: [
      { number: Opcodes.OP_NOP1, name: 'OP_NOP1', active: false },
      { number: Opcodes.OP_CHECKLOCKTIMEVERIFY, name: 'OP_CHECKLOCKTIMEVERIFY', active: false },
      { number: Opcodes.OP_CHECKSEQUENCEVERIFY, name: 'OP_CHECKSEQUENCEVERIFY', active: false },
      { number: Opcodes.OP_NOP4, name: 'OP_NOP4', active: false },
      { number: Opcodes.OP_NOP5, name: 'OP_NOP5', active: false },
      { number: Opcodes.OP_NOP6, name: 'OP_NOP6', active: false },
      { number: Opcodes.OP_NOP7, name: 'OP_NOP7', active: false },
      { number: Opcodes.OP_NOP8, name: 'OP_NOP8', active: false },
      { number: Opcodes.OP_NOP9, name: 'OP_NOP9', active: false },
      { number: Opcodes.OP_NOP10, name: 'OP_NOP10', active: false },
    ],
  },
];
