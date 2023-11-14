import type { BufferEncoding, TextEncoding } from '../models/BufferEncoding.js';
export type { BufferEncoding, TextEncoding } from '../models/BufferEncoding.js';

type TextEncodingExtra = 'utf-16be' | 'utf-16le' | 'utf16be' | 'utf16le';

export type BufferEncodingExt = BufferEncoding | TextEncodingExtra;
export type TextEncodingExt = TextEncoding | TextEncodingExtra;
