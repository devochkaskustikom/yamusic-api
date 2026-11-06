import type { SchemaChange } from "../errors/index.js";
import { shapes as defaultShapes } from "../generated/shapes.js";
import type { ShapeNode } from "./types.js";

const MAX_DEPTH = 12;
const MAX_CHANGES = 50;

export interface DriftOptions {
  readonly shapes?: Readonly<Record<string, ShapeNode>>;
  readonly maxChanges?: number;
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function matchesPrimitive(value: unknown, types: readonly string[]): boolean {
  for (const type of types) {
    if (type === "null" && value === null) return true;
    if (type === "string" && typeof value === "string") return true;
    if (type === "number" && typeof value === "number") return true;
    if (type === "boolean" && typeof value === "boolean") return true;
  }
  return false;
}

function walk(
  actual: unknown,
  node: ShapeNode,
  path: string,
  registry: Readonly<Record<string, ShapeNode>>,
  changes: SchemaChange[],
  limit: number,
  depth: number,
): void {
  if (changes.length >= limit || depth > MAX_DEPTH) return;

  switch (node.kind) {
    case "unknown":
      return;

    case "ref": {
      const target = registry[node.name];
      if (!target) return;
      walk(actual, target, path, registry, changes, limit, depth + 1);
      return;
    }

    case "primitive": {
      if (!matchesPrimitive(actual, node.types)) {
        changes.push({
          kind: actual === null ? "unexpected-null" : "type-mismatch",
          path,
          expected: node.types.join(" | "),
          actual: describe(actual),
        });
      }
      return;
    }

    case "array": {
      if (!Array.isArray(actual)) {
        changes.push({
          kind: "type-mismatch",
          path,
          expected: "array",
          actual: describe(actual),
        });
        return;
      }
      actual.forEach((item, index) => {
        walk(item, node.items, `${path}[${index}]`, registry, changes, limit, depth + 1);
      });
      return;
    }

    case "object": {
      if (typeof actual !== "object" || actual === null || Array.isArray(actual)) {
        changes.push({
          kind: "type-mismatch",
          path,
          expected: "object",
          actual: describe(actual),
        });
        return;
      }

      const record = actual as Readonly<Record<string, unknown>>;

      for (const key of Object.keys(record)) {
        if (!(key in node.fields)) {
          changes.push({ kind: "unknown-field", path: `${path}.${key}`, actual: describe(record[key]) });
        }
      }

      for (const [key, child] of Object.entries(node.fields)) {
        if (!(key in record)) {
          if (node.required.includes(key)) {
            changes.push({ kind: "missing-field", path: `${path}.${key}`, expected: "required" });
          }
          continue;
        }
        walk(record[key], child, `${path}.${key}`, registry, changes, limit, depth + 1);
      }
      return;
    }

    case "union": {
      for (const variant of node.variants) {
        const attempt: SchemaChange[] = [];
        walk(actual, variant, path, registry, attempt, limit, depth + 1);
        if (attempt.length === 0) return;
      }
      changes.push({
        kind: "type-mismatch",
        path,
        expected: "один из вариантов",
        actual: describe(actual),
      });
    }
  }
}

export function detectSchemaChanges(
  data: unknown,
  schemaName: string,
  options: DriftOptions = {},
): SchemaChange[] {
  const registry = options.shapes ?? defaultShapes;
  const root = registry[schemaName];
  if (!root) return [];

  const changes: SchemaChange[] = [];
  walk(data, root, "$", registry, changes, options.maxChanges ?? MAX_CHANGES, 0);
  return changes;
}
