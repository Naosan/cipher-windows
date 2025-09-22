export type JsonSchema = Record<string, any>;

/**
 * Sanitize a JSON schema so that it is compatible with OpenAI / Codex tool validation.
 * - coerces integer types to number (with integer-like multipleOf)
 * - removes `null` entries from union type arrays
 * - converts integer enums to number enums
 * - simplifies oneOf/anyOf branches when they only differ by integer/number variations
 */
export function sanitizeSchemaForOpenAITools<T extends JsonSchema | undefined>(schema: T): T {
	if (!schema) {
		return schema;
	}

	const cloned = JSON.parse(JSON.stringify(schema));

	function walk(node: any): any {
		if (!node || typeof node !== 'object') {
			return node;
		}

		if (Array.isArray(node)) {
			return node.map(walk);
		}

		const typeValue = node.type;
		if (typeof typeValue === 'string') {
			if (typeValue === 'integer') {
				node.type = 'number';
				node.multipleOf = node.multipleOf ?? 1;
			}
		} else if (Array.isArray(typeValue)) {
			const filtered = typeValue
				.map((entry: any) => (entry === 'integer' ? 'number' : entry))
				.filter((entry: any) => entry !== 'null');
			if (filtered.length === 0) {
				node.type = 'object';
			} else if (filtered.length === 1) {
				node.type = filtered[0];
			} else {
				node.type = filtered;
			}
			if (typeValue.includes('integer')) {
				node.multipleOf = node.multipleOf ?? 1;
			}
		}

		if (Array.isArray(node.enum) && node.enum.length > 0) {
			const everyInteger = node.enum.every((value: any) => Number.isInteger(value));
			if (everyInteger) {
				node.type = node.type ?? 'number';
				node.multipleOf = node.multipleOf ?? 1;
			}
		}

		for (const unionKey of ['oneOf', 'anyOf']) {
			if (Array.isArray(node[unionKey])) {
				const branches = node[unionKey].map((branch: any) => walk(branch));

				if (branches.length === 2) {
					const types = branches.map(branch => branch && branch.type);
					if (types.includes('null')) {
						const nonNullIndex = types[0] === 'null' ? 1 : types[1] === 'null' ? 0 : -1;
						if (nonNullIndex >= 0) {
							const nonNullBranch = branches[nonNullIndex];
							node.type = nonNullBranch.type;
							if (nonNullBranch.properties) {
								node.properties = nonNullBranch.properties;
							}
							delete node[unionKey];
						}
					}
				}

				try {
					const serialised = branches.map(branch => JSON.stringify(branch));
					const unique = new Set(serialised);
					if (unique.size === 1) {
						const single = branches[0];
						delete node[unionKey];
						if (single && typeof single === 'object') {
							for (const [key, value] of Object.entries(single)) {
								if (!(key in node)) {
									node[key] = value;
								}
							}
						}
					}
				} catch {
					// Ignore JSON stringify issues, keep original structure.
				}

				node[unionKey] = branches;
			}
		}

		const nestedKeys = ['properties', 'patternProperties', 'definitions', '$defs'];
		for (const key of nestedKeys) {
			if (node[key] && typeof node[key] === 'object') {
				for (const [propName, propSchema] of Object.entries(node[key])) {
					node[key][propName] = walk(propSchema);
				}
			}
		}

		if (node.items) {
			node.items = walk(node.items);
		}

		if (Array.isArray(node.allOf)) {
			node.allOf = node.allOf.map((branch: any) => walk(branch));
		}

		if (node.if) {
			node.if = walk(node.if);
		}
		if (node.then) {
			node.then = walk(node.then);
		}
		if (node.else) {
			node.else = walk(node.else);
		}

		return node;
	}

	return walk(cloned);
}
