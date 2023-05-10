# Trie Blob

A compact binary format for storing Tries.

## Format

All entries are 32 bits. Offsets are byte offsets from the beginning of the data blob.

### Header

| Offset | length  | Value                        | Description                                      |
| -----: | ------- | ---------------------------- | ------------------------------------------------ |
|      0 | 8 bytes | `TrieBlob`                   | To mark it as a Trie Blob                        |
|      8 | 4 bytes | `0x01020304` or `0x04030201` | Endian mark - `0x010203` == Little Endian        |
|     12 | 4 bytes | `VV.MM.PP`                   | `VV` - Major version, `MM` - Minor, `PP` - Patch |
|     16 | 4 bytes | Offset set of Nodes          | Byte offset to Trie Root                         |
|     20 | 4 bytes | -                            | Number of Node entries                           |
|     24 | 4 bytes | Offset of character map      | `\n` separated string of characters              |
|     28 | 4 bytes | -                            | Length in bytes of char map                      |

```ts
const HEADER_OFFSET = 0;
const HEADER_OFFSET_SIG = HEADER_OFFSET;
const HEADER_OFFSET_ENDIAN = HEADER_OFFSET_SIG + 8;
const HEADER_OFFSET_VERSION = HEADER_OFFSET_ENDIAN + 4;
const HEADER_OFFSET_NODES = HEADER_OFFSET_VERSION + 4;
const HEADER_OFFSET_NODES_LEN = HEADER_OFFSET_NODES + 4;
const HEADER_OFFSET_CHAR_INDEX = HEADER_OFFSET_NODES_LEN + 4;
const HEADER_OFFSET_CHAR_INDEX_LEN = HEADER_OFFSET_CHAR_INDEX + 4;
```

### Trie Node Data

Entry

|      Offset | Mask         | Description       |
| ----------: | ------------ | ----------------- |
|           0 | `0x0000007F` | Child Count       |
|           0 | `0x00000100` | End of word flag  |
| `n * 4 + 4` | `0xFFFFFFFF` | Sorted Child Refs |

Child Ref

| Child node index | Char Index   |
| ---------------- | ------------ |
| `0x7FFFFF00`     | `0x000000FF` |
