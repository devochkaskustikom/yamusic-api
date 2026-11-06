import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

type Primitive =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "null"
  | "array"
  | "object";

interface Schema {
  readonly $ref?: string;
  readonly type?: Primitive | readonly Primitive[];
  readonly enum?: readonly (string | number | boolean)[];
  readonly properties?: Readonly<Record<string, Schema>>;
  readonly required?: readonly string[];
  readonly items?: Schema;
  readonly oneOf?: readonly Schema[];
  readonly additionalProperties?: boolean | Schema;
}

interface Parameter {
  readonly name: string;
  readonly in: "path" | "query" | "header" | "cookie";
  readonly required?: boolean;
  readonly schema?: Schema;
}

interface Response {
  readonly content?: Readonly<Record<string, { readonly schema?: Schema }>>;
}

interface Operation {
  readonly operationId: string;
  readonly tags?: readonly string[];
  readonly summary?: string;
  readonly parameters?: readonly Parameter[];
  readonly requestBody?: {
    readonly required?: boolean;
    readonly content?: Readonly<Record<string, { readonly schema?: Schema }>>;
  };
  readonly responses?: Readonly<Record<string, Response>>;
  readonly "x-ym-idempotent"?: boolean;
  readonly "x-ym-status"?: string;
}

interface Spec {
  readonly paths: Readonly<
    Record<string, Readonly<Record<string, Operation | readonly Parameter[] | undefined>>>
  >;
  readonly components: { readonly schemas: Readonly<Record<string, Schema>> };
}

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
const STATUSES = ["stable", "experimental", "restricted", "deprecated", "unavailable"] as const;

const repoRoot = join(import.meta.dirname, "..", "..", "..");
const specPath = join(repoRoot, "spec", "ym-api.yaml");
const outDir = join(repoRoot, "packages", "yamusic-api", "src", "generated");

const banner = [
  "// AUTO-GENERATED FROM spec/ym-api.yaml BY packages/codegen.",
  "// Manual edits are overwritten by `pnpm codegen`. Edit the spec instead.",
  "",
].join("\n");

function refName(ref: string): string {
  const tail = ref.split("/").pop();
  if (!tail) throw new Error(`Malformed $ref: ${ref}`);
  return tail.replaceAll("~1", "/").replaceAll("~0", "~");
}

function wrapUnionMember(type: string): string {
  return type.includes(" | ") ? `(${type})` : type;
}

function emitObjectLiteral(schema: Schema): string {
  const required = new Set(schema.required ?? []);
  const fields = Object.entries(schema.properties ?? {}).map(([key, value]) => {
    const optional = required.has(key) ? "" : "?";
    return `${JSON.stringify(key)}${optional}: ${emitType(value)}`;
  });
  if (fields.length === 0) return "Record<string, unknown>";
  return `{ ${fields.join("; ")} }`;
}

function emitType(schema: Schema | undefined): string {
  if (!schema) return "unknown";
  if (schema.$ref) return refName(schema.$ref);

  if (schema.oneOf && schema.oneOf.length > 0) {
    return schema.oneOf.map(emitType).map(wrapUnionMember).join(" | ");
  }

  if (Array.isArray(schema.type)) {
    return schema.type
      .map((item) => (item === "integer" ? "number" : item))
      .map(wrapUnionMember)
      .join(" | ");
  }

  if (schema.enum && schema.enum.length > 0) {
    return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  }

  switch (schema.type) {
    case "string":
    case "boolean":
    case "null":
      return schema.type;
    case "integer":
    case "number":
      return "number";
    case "array": {
      if (!schema.items) return "unknown[]";
      return `${wrapUnionMember(emitType(schema.items))}[]`;
    }
    case "object":
    case undefined: {
      if (schema.properties) return emitObjectLiteral(schema);
      if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        return `Record<string, ${emitType(schema.additionalProperties)}>`;
      }
      return "Record<string, unknown>";
    }
    default:
      return "unknown";
  }
}

function emitDto(schemas: Readonly<Record<string, Schema>>): string {
  const blocks: string[] = [];
  for (const [name, schema] of Object.entries(schemas)) {
    if (schema.type === "object" && !schema.oneOf) {
      const required = new Set(schema.required ?? []);
      const fields = Object.entries(schema.properties ?? {}).map(([key, value]) => {
        const optional = required.has(key) ? "" : "?";
        return `  ${JSON.stringify(key)}${optional}: ${emitType(value)};`;
      });
      blocks.push(`export interface ${name} {\n${fields.join("\n")}\n}`);
    } else {
      blocks.push(`export type ${name} = ${emitType(schema)};`);
    }
  }
  return `${banner}${blocks.join("\n\n")}\n`;
}

function toShape(schema: Schema | undefined): unknown {
  if (!schema) return { kind: "unknown" };
  if (schema.$ref) return { kind: "ref", name: refName(schema.$ref) };
  if (schema.oneOf && schema.oneOf.length > 0) {
    return { kind: "union", variants: schema.oneOf.map(toShape) };
  }
  if (Array.isArray(schema.type)) {
    const types = schema.type.map((item) => (item === "integer" ? "number" : item));
    return { kind: "primitive", types };
  }
  if (schema.enum && schema.enum.length > 0) {
    return { kind: "primitive", types: ["string"] };
  }
  switch (schema.type) {
    case "string":
    case "boolean":
    case "null":
      return { kind: "primitive", types: [schema.type] };
    case "integer":
    case "number":
      return { kind: "primitive", types: ["number"] };
    case "array":
      return { kind: "array", items: toShape(schema.items) };
    case "object":
    case undefined: {
      if (!schema.properties) return { kind: "unknown" };
      const fields: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        fields[key] = toShape(value);
      }
      return { kind: "object", required: schema.required ?? [], fields };
    }
    default:
      return { kind: "unknown" };
  }
}

function emitShapes(schemas: Readonly<Record<string, Schema>>): string {
  const shapes: Record<string, unknown> = {};
  for (const [name, schema] of Object.entries(schemas)) {
    shapes[name] = toShape(schema);
  }
  return [
    banner,
    'import type { ShapeNode } from "../schema/types.js";',
    "",
    `export const shapes: Readonly<Record<string, ShapeNode>> = ${JSON.stringify(shapes, null, 2)};`,
    "",
  ].join("\n");
}

interface CollectedOperation {
  readonly id: string;
  readonly method: Uppercase<(typeof HTTP_METHODS)[number]>;
  readonly path: string;
  readonly tag: string;
  readonly idempotent: boolean;
  readonly status: (typeof STATUSES)[number];
  readonly pathParams: readonly Parameter[];
  readonly queryParams: readonly Parameter[];
  readonly requestBodySchema: Schema | undefined;
  readonly responseSchema: Schema | undefined;
}

function collectOperations(spec: Spec): CollectedOperation[] {
  const collected: CollectedOperation[] = [];
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const candidate = pathItem[method];
      if (!candidate || Array.isArray(candidate)) continue;
      const operation = candidate as Operation;
      if (!operation.operationId) {
        throw new Error(`Operation without operationId: ${method.toUpperCase()} ${path}`);
      }
      const parameters = operation.parameters ?? [];
      const status = operation["x-ym-status"] ?? "experimental";
      if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
        throw new Error(`Unknown x-ym-status "${status}" on ${operation.operationId}`);
      }
      const requestBodySchema =
        operation.requestBody?.content?.["application/json"]?.schema;
      const responseSchema =
        operation.responses?.["200"]?.content?.["application/json"]?.schema;
      collected.push({
        id: operation.operationId,
        method: method.toUpperCase() as CollectedOperation["method"],
        path,
        tag: operation.tags?.[0] ?? "misc",
        idempotent: operation["x-ym-idempotent"] ?? method === "get",
        status: status as (typeof STATUSES)[number],
        pathParams: parameters.filter((parameter) => parameter.in === "path"),
        queryParams: parameters.filter((parameter) => parameter.in === "query"),
        requestBodySchema,
        responseSchema,
      });
    }
  }
  return collected;
}

function emitParamsType(params: readonly Parameter[]): string {
  if (params.length === 0) return "Record<string, never>";
  const fields = params.map((parameter) => {
    const optional = parameter.required ? "" : "?";
    return `${JSON.stringify(parameter.name)}${optional}: ${emitType(parameter.schema)}${parameter.required ? "" : " | undefined"}`;
  });
  return `{ ${fields.join("; ")} }`;
}

function emitOperations(operations: readonly CollectedOperation[]): string {
  const usedDtos = new Set<string>();
  const responseEntries = operations.map((operation) => {
    const schema = operation.responseSchema;
    const type = schema ? emitType(schema) : "unknown";
    for (const name of Object.values(specSchemaNames)) {
      if (new RegExp(`\\b${name}\\b`).test(type)) usedDtos.add(name);
    }
    return `  ${JSON.stringify(operation.id)}: ${type};`;
  });

  const bodyEntries = operations
    .filter((operation) => operation.requestBodySchema !== undefined)
    .map((operation) => {
      const type = emitType(operation.requestBodySchema);
      for (const name of Object.values(specSchemaNames)) {
        if (new RegExp(`\\b${name}\\b`).test(type)) usedDtos.add(name);
      }
      return `  ${JSON.stringify(operation.id)}: ${type};`;
    });

  const bodyMapBlock =
    bodyEntries.length > 0
      ? ["export interface OperationBodyMap {", bodyEntries.join("\n"), "}"].join("\n")
      : "export type OperationBodyMap = Record<string, never>;";

  const descriptorEntries = operations.map((operation) => {
    const descriptor = {
      method: operation.method,
      path: operation.path,
      tag: operation.tag,
      idempotent: operation.idempotent,
      status: operation.status,
      pathParams: operation.pathParams.map((parameter) => parameter.name),
      queryParams: operation.queryParams.map((parameter) => parameter.name),
      requestBodySchema: operation.requestBodySchema?.$ref
        ? refName(operation.requestBodySchema.$ref)
        : null,
      responseSchema: operation.responseSchema?.$ref
        ? refName(operation.responseSchema.$ref)
        : null,
    };
    return `  ${JSON.stringify(operation.id)}: ${JSON.stringify(descriptor, null, 2)} as const,`;
  });

  const pathParamEntries = operations
    .filter((operation) => operation.pathParams.length > 0)
    .map(
      (operation) =>
        `  ${JSON.stringify(operation.id)}: ${emitParamsType(operation.pathParams)};`,
    );

  const queryParamEntries = operations
    .filter((operation) => operation.queryParams.length > 0)
    .map(
      (operation) =>
        `  ${JSON.stringify(operation.id)}: ${emitParamsType(operation.queryParams)};`,
    );

  const imports =
    usedDtos.size > 0
      ? `import type {\n${[...usedDtos].sort().map((name) => `  ${name},`).join("\n")}\n} from "./dto.js";\n\n`
      : "";

  return [
    banner,
    imports,
    'export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";',
    "",
    'export type EndpointStatus = "stable" | "experimental" | "restricted" | "deprecated" | "unavailable";',
    "",
    "export interface OperationDescriptorSpec {",
    "  readonly method: HttpMethod;",
    "  readonly path: string;",
    "  readonly tag: string;",
    "  readonly idempotent: boolean;",
    "  readonly status: EndpointStatus;",
    "  readonly pathParams: readonly string[];",
    "  readonly queryParams: readonly string[];",
    "  readonly requestBodySchema: string | null;",
    "  readonly responseSchema: string | null;",
    "}",
    "",
    "export const operations = {",
    descriptorEntries.join("\n"),
    "} as const satisfies Record<string, OperationDescriptorSpec>;",
    "",
    "export type OperationId = keyof typeof operations;",
    "",
    "export interface OperationResponseMap {",
    responseEntries.join("\n"),
    "}",
    "",
    "export type OperationResponse<T extends OperationId> = OperationResponseMap[T];",
    "",
    "export interface OperationPathParamsMap {",
    pathParamEntries.join("\n"),
    "}",
    "",
    "export interface OperationQueryParamsMap {",
    queryParamEntries.join("\n"),
    "}",
    "",
    "export type OperationPathParams<T extends keyof OperationPathParamsMap> = OperationPathParamsMap[T];",
    "",
    "export type OperationQueryParams<T extends keyof OperationQueryParamsMap> = OperationQueryParamsMap[T];",
    "",
    bodyMapBlock,
    "",
    "export type OperationBody<T extends OperationId> = T extends keyof OperationBodyMap ? OperationBodyMap[T] : never;",
    "",
  ].join("\n");
}

function emitEndpoints(operations: readonly CollectedOperation[]): string {
  const byTag = new Map<string, CollectedOperation[]>();
  for (const operation of operations) {
    const bucket = byTag.get(operation.tag) ?? [];
    bucket.push(operation);
    byTag.set(operation.tag, bucket);
  }

  const lines = [
    "# Статус эндпоинтов",
    "",
    "Файл генерируется из `spec/ym-api.yaml`. Правки вручную перезаписываются.",
    "",
    "| Статус | Значение |",
    "| --- | --- |",
    "| `stable` | Проверен на живом API владельцем пакета |",
    "| `experimental` | Реализован, но проверен не на всех аккаунтах |",
    "| `restricted` | Требует определённых прав или подписки |",
    "| `deprecated` | Устарел |",
    "| `unavailable` | Сервер больше не предоставляет возможность |",
    "",
  ];

  for (const [tag, bucket] of byTag) {
    lines.push(`## ${tag}`, "", "| Операция | Запрос | Повторяемая | Статус |", "| --- | --- | --- | --- |");
    for (const operation of bucket) {
      lines.push(
        `| \`${operation.id}\` | \`${operation.method} ${operation.path}\` | ${operation.idempotent ? "да" : "нет"} | \`${operation.status}\` |`,
      );
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

const spec = parse(await readFile(specPath, "utf8")) as Spec;const schemas = spec.components.schemas;
const specSchemaNames = Object.keys(schemas);
const operations = collectOperations(spec);

const uniqueIds = new Set<string>();
for (const operation of operations) {
  if (uniqueIds.has(operation.id)) {
    throw new Error(`Duplicate operationId: ${operation.id}`);
  }
  uniqueIds.add(operation.id);
}

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "dto.ts"), emitDto(schemas), "utf8");
await writeFile(join(outDir, "operations.ts"), emitOperations(operations), "utf8");
await writeFile(join(outDir, "shapes.ts"), emitShapes(schemas), "utf8");
await writeFile(
  join(outDir, "index.ts"),
  `${banner}export * from "./dto.js";\nexport * from "./operations.js";\nexport { shapes } from "./shapes.js";\n`,
  "utf8",
);

const docsDir = join(repoRoot, "packages", "yamusic-api", "docs");
await mkdir(docsDir, { recursive: true });
await writeFile(join(docsDir, "endpoints.md"), emitEndpoints(operations), "utf8");

process.stdout.write(
  `Generated ${specSchemaNames.length} schemas and ${operations.length} operations into ${outDir}\n`,
);
