# Trie Blob

A compact binary format for storing Tries.

## Format

All entries are 32 bits. Offsets stored in the format must be multiplied \* 4 to get the byte offset.

Big

### Header

| Offset | length  | Value                        | Description                                        |
| -----: | ------- | ---------------------------- | -------------------------------------------------- |
|      0 | 8 bytes | `TrieBlob`                   | To mark it as a Trie Blob                          |
|      8 | 4 bytes | `0x01020304` or `0x04030201` | Endian mark - `0x010203` == Little Endian          |
|     12 | 4 bytes | `0xVVVVMMPP`                 | `VVVV` - Major version, `MM` - Minor, `PP` - Patch |
|     16 | 4 bytes | ?                            | Byte offset to Trie Root                           |

### Trie Data

Entry

|      Offset | Mask         | Description       |
| ----------: | ------------ | ----------------- |
|           0 | `0x0000007F` | Child Count       |
|           0 | `0x00010000` | End of word flag  |
| `n * 4 + 4` | `0xFFFFFFFF` | Sorted Child Refs |

Child Ref

| Mask         | Description |
| ------------ | ----------- |
| `0xFF000000` | Char Byte   |
| `0x007FFFFF` |             |

<!--- cspell:ignore VVVVMMPP --->
