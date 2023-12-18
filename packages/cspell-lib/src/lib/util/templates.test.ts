import { describe, expect, test } from 'vitest';

import { envToTemplateVars, replaceTemplate } from './templates.js';

describe('replaceTemplate', () => {
    test('should replace template variables with values', () => {
        const template = 'Hello, ${name}! You are ${age} years old.';
        const replacements = {
            name: 'John',
            age: '30',
        };
        const result = replaceTemplate(template, replacements);
        expect(result).toBe('Hello, John! You are 30 years old.');
    });

    test('should replace template variables with empty string if value is undefined', () => {
        const template = 'Hello, ${name}! You are ${age} years old.';
        const replacements = {
            name: 'John',
            age: undefined,
        };
        const result = replaceTemplate(template, replacements);
        expect(result).toBe('Hello, John! You are  years old.');
    });

    test('should replace template variables with empty string if value is null', () => {
        const template = 'Hello, ${name}! You are ${age} years old.';
        const replacements = {
            name: 'John',
            age: undefined,
        };
        const result = replaceTemplate(template, replacements);
        expect(result).toBe('Hello, John! You are  years old.');
    });

    test('should replace template variables with empty string if value is missing', () => {
        const template = 'Hello, ${name}! You are ${age} years old.';
        const replacements = {
            name: 'John',
        };
        const result = replaceTemplate(template, replacements);
        expect(result).toBe('Hello, John! You are ${age} years old.');
    });

    test('should replace template variables', () => {
        const template = 'Hello, ${name}! You are ${age} years old.';
        const replacements = {
            name: 'John',
            age: '30',
        };
        const result = replaceTemplate(template, replacements);
        expect(result).toBe('Hello, John! You are 30 years old.');
    });

    test('should replace template variables with a string', () => {
        const template = 'Hello, ${name}! You are ${age} years old.';
        const data = {
            name: 'John',
            age: 30,
        };
        const replacements: { name: string } = data;
        const result = replaceTemplate(template, replacements);
        expect(result).toBe('Hello, John! You are 30 years old.');
    });

    test('should resolve a filename with environment variables', () => {
        const filename = '${env:HOME}/${env:PROJECTS}/cspell/file.txt';
        const result = replaceTemplate(filename, envToTemplateVars({ HOME: '/user', PROJECTS: 'projects' }));
        expect(result).toBe('/user/projects/cspell/file.txt');
    });
});

describe('envToTemplateVars', () => {
    test('should convert environment variables to template variables', () => {
        const result = envToTemplateVars({ HOME: '/user', PROJECTS: 'projects' });
        expect(result).toEqual({
            'env:HOME': '/user',
            'env:PROJECTS': 'projects',
        });
    });
});
