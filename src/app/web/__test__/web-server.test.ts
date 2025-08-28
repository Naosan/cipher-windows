import { describe, it, expect } from 'vitest';
import path from 'path';
import { isCompiledPath } from '../web-server.js';

describe('isCompiledPath', () => {
        it('detects compiled path on Unix', () => {
                const filePath = '/usr/src/app/dist/src/app/web/web-server.js';
                expect(isCompiledPath(filePath, path.posix)).toBe(true);
        });

        it('detects compiled path on Windows', () => {
                const filePath = 'C:\\project\\dist\\src\\app\\web\\web-server.js';
                expect(isCompiledPath(filePath, path.win32)).toBe(true);
        });

        it('detects source path on Unix', () => {
                const filePath = '/usr/src/app/src/app/web/web-server.ts';
                expect(isCompiledPath(filePath, path.posix)).toBe(false);
        });

        it('detects source path on Windows', () => {
                const filePath = 'C:\\project\\src\\app\\web\\web-server.ts';
                expect(isCompiledPath(filePath, path.win32)).toBe(false);
        });
});
