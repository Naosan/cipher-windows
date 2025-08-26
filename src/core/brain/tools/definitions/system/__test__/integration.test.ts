/**
 * Integration test for Bash Tool with Cipher system
 *
 * Tests the bash tool integration with the full cipher tool management system.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InternalToolManager } from '../../../manager.js';
import { getAllToolDefinitions } from '../../index.js';
import { BashSessionManager } from '../bash.js';

const isWindows = process.platform === 'win32';

describe('Bash Tool Integration', () => {
	let toolManager: InternalToolManager;
	let sessionManager: BashSessionManager;

	beforeEach(async () => {
		toolManager = new InternalToolManager();
		await toolManager.initialize();
		sessionManager = BashSessionManager.getInstance();
	});

	afterEach(async () => {
		await sessionManager.closeAllSessions();
		await toolManager.shutdown();
	});

	it('should be included in tool definitions', async () => {
		const tools = await getAllToolDefinitions();
		expect(tools['cipher_bash']).toBeDefined();
		expect(tools['cipher_bash'].category).toBe('system');
		expect(tools['cipher_bash'].name).toBe('cipher_bash');
	});

	it('should register successfully with tool manager', async () => {
		const tools = await getAllToolDefinitions();
		const bashTool = tools['cipher_bash'];

		const result = toolManager.registerTool(bashTool);
		expect(result.success).toBe(true);
		expect(result.message).not.toContain('error');
	});

	it('should execute through tool manager', async () => {
		const tools = await getAllToolDefinitions();
		const bashTool = tools['cipher_bash'];

		// Register the tool
		toolManager.registerTool(bashTool);

		// Execute through manager
                const helloCmd = isWindows
                        ? 'Write-Output "Hello from integrated test"'
                        : 'echo "Hello from integrated test"';
                const result = await toolManager.executeTool(
                        'cipher_bash',
                        { command: helloCmd },
                        { sessionId: 'integration-test', userId: 'test-user' }
                );

		expect(result.isError).toBe(false);
		expect(result.content).toContain('Hello from integrated test');
		expect(result.content).toContain('Exit Code: 0');
	});

	it('should handle persistent sessions through tool manager', async () => {
		const tools = await getAllToolDefinitions();
		const bashTool = tools['cipher_bash'];

		// Register the tool
		toolManager.registerTool(bashTool);

		// Set environment variable
                const setCmd = isWindows
                        ? '$env:INTEGRATION_TEST="success"'
                        : 'export INTEGRATION_TEST="success"';
                const result1 = await toolManager.executeTool(
                        'cipher_bash',
                        { command: setCmd, persistent: true },
                        { sessionId: 'persistent-integration', userId: 'test-user' }
                );
		expect(result1.isError).toBe(false);

		// Check if variable persists
                const getCmd = isWindows
                        ? 'Write-Output $env:INTEGRATION_TEST'
                        : 'echo $INTEGRATION_TEST';
                const result2 = await toolManager.executeTool(
                        'cipher_bash',
                        { command: getCmd, persistent: true },
                        { sessionId: 'persistent-integration', userId: 'test-user' }
                );
		expect(result2.isError).toBe(false);
		expect(result2.content).toContain('success');
	});

	it('should track execution statistics', async () => {
		const tools = await getAllToolDefinitions();
		const bashTool = tools['cipher_bash'];

		// Register the tool
		toolManager.registerTool(bashTool);

		// Execute a few commands
                const statCmd1 = isWindows ? 'Write-Output "test1"' : 'echo "test1"';
                const statCmd2 = isWindows ? 'Write-Output "test2"' : 'echo "test2"';
                await toolManager.executeTool('cipher_bash', { command: statCmd1 });
                await toolManager.executeTool('cipher_bash', { command: statCmd2 });

		// Check statistics
		const stats = toolManager.getToolStats('cipher_bash');
		expect(stats).toBeDefined();
		expect(stats!.totalExecutions).toBe(2);
		expect(stats!.successfulExecutions).toBe(2);
		expect(stats!.failedExecutions).toBe(0);
	});

	it('should be discoverable by category', async () => {
		const tools = await getAllToolDefinitions();
		const bashTool = tools['cipher_bash'];

		toolManager.registerTool(bashTool);

		const systemTools = toolManager.getToolsByCategory('system');
		expect(systemTools['cipher_bash']).toBeDefined();
	});

	it('should integrate with cipher service architecture', async () => {
		const tools = await getAllToolDefinitions();
		const bashTool = tools['cipher_bash'];

		toolManager.registerTool(bashTool);

		// Mock services (similar to what would be available in cipher)
		const mockServices = {
			embeddingManager: {
				getEmbedder: () => ({
					embed: async (_text: string) =>
						Array(128)
							.fill(0)
							.map(() => Math.random()),
				}),
			},
			vectorStoreManager: {
				getStore: () => ({
					search: async () => [],
					insert: async () => {},
				}),
			},
		};

		// Execute with services context
                const serviceCmd = isWindows
                        ? 'Write-Output "Service integration test"'
                        : 'echo "Service integration test"';
                const result = await toolManager.executeTool(
                        'cipher_bash',
                        { command: serviceCmd },
                        {
                                sessionId: 'service-test',
                                userId: 'test-user',
                                services: mockServices,
                        }
                );

		expect(result.isError).toBe(false);
		expect(result.content).toContain('Service integration test');
	});
});
