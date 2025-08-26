/**
 * Tests for Bash Command Tool
 *
 * Tests both one-off command execution and persistent session functionality.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { bashTool, BashSessionManager, getDefaultShell } from '../bash.js';
import type { InternalToolContext } from '../../../types.js';

const isWindows = process.platform === 'win32';

describe('Bash Tool', () => {
	let sessionManager: BashSessionManager;

	beforeEach(() => {
		sessionManager = BashSessionManager.getInstance();
	});

	afterEach(async () => {
		// Clean up all sessions after each test
		await sessionManager.closeAllSessions();
	});

	describe('Tool Definition', () => {
		it('should have correct tool definition structure', () => {
			expect(bashTool.name).toBe('cipher_bash');
			expect(bashTool.category).toBe('system');
			expect(bashTool.internal).toBe(true);
			expect(bashTool.agentAccessible).toBe(true);
			expect(bashTool.description).toContain('bash commands');
			expect(bashTool.parameters.type).toBe('object');
			expect(bashTool.parameters.required).toContain('command');
		});

		it('should have handler function', () => {
			expect(typeof bashTool.handler).toBe('function');
		});
	});

	describe('Command Execution', () => {
		it('should execute simple command successfully', async () => {
			const context: InternalToolContext = {
				toolName: 'bash',
				startTime: Date.now(),
				sessionId: 'test-session',
				userId: 'test-user',
				metadata: {},
			};

                        const cmd = isWindows
                                ? 'Write-Output "Hello World"'
                                : 'echo "Hello World"';
                        const result = await bashTool.handler({ command: cmd }, context);

			expect(result.isError).toBe(false);
			expect(result.content).toContain('Hello World');
			expect(result.content).toContain('Exit Code: 0');
		});

		it('should handle command with non-zero exit code', async () => {
			const context: InternalToolContext = {
				toolName: 'bash',
				startTime: Date.now(),
				sessionId: 'test-session',
				userId: 'test-user',
				metadata: {},
			};

                        const result = await bashTool.handler({ command: 'exit 1' }, context);

			expect(result.isError).toBe(true);
			expect(result.content).toContain('Exit Code: 1');
		});

		it('should respect timeout parameter', async () => {
			const context: InternalToolContext = {
				toolName: 'bash',
				startTime: Date.now(),
				sessionId: 'test-session',
				userId: 'test-user',
				metadata: {},
			};

			// This should timeout quickly
                        const sleepCmd = isWindows ? 'Start-Sleep -Seconds 5' : 'sleep 5';
                        const result = await bashTool.handler({ command: sleepCmd, timeout: 1000 }, context);

			expect(result.isError).toBe(true);
			expect(result.content).toContain('timeout');
		});

		it('should handle working directory parameter', async () => {
			const context: InternalToolContext = {
				toolName: 'bash',
				startTime: Date.now(),
				sessionId: 'test-session',
				userId: 'test-user',
				metadata: {},
			};

                        const dir = isWindows ? 'C:\\' : '/tmp';
                        const pwdCmd = isWindows ? 'Get-Location' : 'pwd';
                        const result = await bashTool.handler({ command: pwdCmd, workingDir: dir }, context);

                        expect(result.isError).toBe(false);
                        expect(result.content).toContain(dir);
		});
	});

	describe('Persistent Sessions', () => {
		it('should maintain state between commands in persistent session', async () => {
			const context: InternalToolContext = {
				toolName: 'bash',
				startTime: Date.now(),
				sessionId: 'persistent-test',
				userId: 'test-user',
				metadata: {},
			};

			// Set a variable in first command
                        const setCmd = isWindows
                                ? '$env:TEST_VAR="hello"'
                                : 'export TEST_VAR="hello"';
                        const result1 = await bashTool.handler(
                                { command: setCmd, persistent: true },
                                context
                        );
			expect(result1.isError).toBe(false);

			// Check if variable persists in second command
                        const getCmd = isWindows
                                ? 'Write-Output $env:TEST_VAR'
                                : 'echo $TEST_VAR';
                        const result2 = await bashTool.handler(
                                { command: getCmd, persistent: true },
                                context
                        );
			expect(result2.isError).toBe(false);
			expect(result2.content).toContain('hello');
		});

		it('should handle custom session ID', async () => {
			const context: InternalToolContext = {
				toolName: 'bash',
				startTime: Date.now(),
				sessionId: 'default-session',
				userId: 'test-user',
				metadata: {},
			};

			// Use custom session ID
                        const echoCmd = isWindows
                                ? 'Write-Output "custom session"'
                                : 'echo "custom session"';
                        const result = await bashTool.handler(
                                { command: echoCmd, persistent: true, sessionId: 'custom-session' },
                                context
                        );

			expect(result.isError).toBe(false);
			expect(result.content).toContain('custom session');
		});
	});

	describe('Error Handling', () => {
		it('should handle missing command parameter', async () => {
			const context: InternalToolContext = {
				toolName: 'bash',
				startTime: Date.now(),
				sessionId: 'test-session',
				userId: 'test-user',
				metadata: {},
			};

			const result = await bashTool.handler({}, context);

			expect(result.isError).toBe(true);
			expect(result.content).toContain('Command is required');
		});

		it('should handle invalid command parameter type', async () => {
			const context: InternalToolContext = {
				toolName: 'bash',
				startTime: Date.now(),
				sessionId: 'test-session',
				userId: 'test-user',
				metadata: {},
			};

			const result = await bashTool.handler({ command: 123 }, context);

			expect(result.isError).toBe(true);
			expect(result.content).toContain('must be a string');
		});
	});

	describe('Session Manager', () => {
		it('should create and manage sessions', async () => {
			const session1 = await sessionManager.getSession('session1');
			const session2 = await sessionManager.getSession('session2');

			expect(session1).toBeDefined();
			expect(session2).toBeDefined();
			expect(session1).not.toBe(session2);

			expect(session1.isActive()).toBe(true);
			expect(session2.isActive()).toBe(true);
		});

		it('should reuse existing active sessions', async () => {
			const session1 = await sessionManager.getSession('reuse-test');
			const session2 = await sessionManager.getSession('reuse-test');

			// Should be the same instance
			expect(session1).toBe(session2);
		});

		it('should close specific sessions', async () => {
			const session = await sessionManager.getSession('close-test');
			expect(session.isActive()).toBe(true);

			await sessionManager.closeSession('close-test');
			expect(session.isActive()).toBe(false);
		});

        it('should close all sessions', async () => {
                const session1 = await sessionManager.getSession('close-all-1');
                const session2 = await sessionManager.getSession('close-all-2');

			expect(session1.isActive()).toBe(true);
			expect(session2.isActive()).toBe(true);

			await sessionManager.closeAllSessions();

			expect(session1.isActive()).toBe(false);
                expect(session2.isActive()).toBe(false);
        });
        });

        describe('Windows Shell Selection', () => {
                it('uses PowerShell by default on win32', () => {
                        const originalPlatform = process.platform;
                        const originalComSpec = process.env.ComSpec;
                        Object.defineProperty(process, 'platform', { value: 'win32' });
                        delete process.env.ComSpec;

                        expect(getDefaultShell()).toBe('powershell.exe');

                        Object.defineProperty(process, 'platform', { value: originalPlatform });
                        if (originalComSpec) {
                                process.env.ComSpec = originalComSpec;
                        }
                });
        });
});
