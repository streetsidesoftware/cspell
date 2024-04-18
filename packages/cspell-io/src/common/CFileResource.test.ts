import { describe, expect, test } from 'vitest';

import { CFileResource, fromFileResource } from './CFileResource.js';

describe('CFileResource', () => {
    describe('from', () => {
        test('should create a CFileResource from a FileResource', () => {
            // Arrange
            const fileResource = {
                url: new URL('https://example.com/file.txt'),
                content: 'Hello, world!',
                encoding: 'utf8',
            } as const;

            // Act
            const cFileResource = CFileResource.from(fileResource);

            // Assert
            expect(cFileResource.url).toEqual(fileResource.url);
            expect(cFileResource.content).toEqual(fileResource.content);
            expect(cFileResource.encoding).toEqual(fileResource.encoding);
            expect(cFileResource.baseFilename).toBe('file.txt');
            expect(cFileResource.gz).toBeFalsy();
        });

        test('should create a CFileResource from a FileResource and content', () => {
            // Arrange
            const fileResource = {
                url: new URL('https://example.com/file.txt'),
                content: 'Hello, world!',
                encoding: 'utf8',
            } as const;

            const content = 'Welcome to a new day!';

            // Act
            const cFileResource1 = CFileResource.from(fileResource);
            const cFileResource2 = CFileResource.from(cFileResource1, content);
            const cFileResource3 = CFileResource.from(cFileResource1);

            // Assert
            expect(cFileResource1).not.toBe(cFileResource2);
            expect(cFileResource1).toBe(cFileResource3);
            expect(cFileResource2.url).toEqual(fileResource.url);
            expect(cFileResource2.content).toEqual(content);
            expect(cFileResource2.encoding).toEqual(fileResource.encoding);
            expect(cFileResource2.baseFilename).toBe('file.txt');
            expect(cFileResource2.gz).toBeFalsy();
        });

        test('should create a CFileResource from a FileReference and content', () => {
            // Arrange
            const fileReference = {
                url: new URL('https://example.com/file.txt'),
            };
            const content = 'Hello, world!';

            // Act
            const cFileResource = CFileResource.from(fileReference, content);

            // Assert
            expect(cFileResource.url).toBe(fileReference.url);
            expect(cFileResource.content).toEqual(content);
            expect(cFileResource.encoding).toBeUndefined();
            expect(cFileResource.baseFilename).toBe('file.txt');
            expect(cFileResource.gz).toBe(false);
        });

        test('should create a CFileResource from a URL, content, and optional parameters', () => {
            // Arrange
            const url = new URL('https://example.com/file.txt');
            const content = 'Hello, world!';
            const encoding = 'utf8';
            const baseFilename = 'file.txt';
            const gz = true;

            // Act
            const cFileResource = CFileResource.from(url, content, encoding, baseFilename, gz);

            // Assert
            expect(cFileResource.url).toEqual(url);
            expect(cFileResource.content).toEqual(content);
            expect(cFileResource.encoding).toEqual(encoding);
            expect(cFileResource.baseFilename).toBe('file.txt');
            expect(cFileResource.gz).toEqual(gz);
        });
    });

    describe('fromFileResource', () => {
        test('should create a CFileResource from a FileResource', () => {
            // Arrange

            const content = 'Hello, world!';

            const fileResource = {
                url: new URL('https://example.com/file.txt'),
                content: Buffer.from(content),
                encoding: 'utf8',
            } as const;

            // Act
            const cFileResource = fromFileResource(fileResource);

            // Assert
            expect(cFileResource.url).toEqual(fileResource.url);
            expect(cFileResource.content).toEqual(fileResource.content);
            expect(cFileResource.getText()).toEqual(content);
            expect(cFileResource.encoding).toEqual(fileResource.encoding);
            expect(cFileResource.baseFilename).toBe('file.txt');
            expect(cFileResource.gz).toBeFalsy();
        });
    });
});
