import { YandexMusicError, type YandexMusicErrorOptions } from "./base-error.js";

export type SchemaChangeKind =
  | "unknown-field"
  | "missing-field"
  | "type-mismatch"
  | "unexpected-null";

export interface SchemaChange {
  readonly kind: SchemaChangeKind;
  readonly path: string;
  readonly expected?: string;
  readonly actual?: string;
  readonly operationId?: string;
}

export class SchemaMismatchError extends YandexMusicError {
  override readonly name: string = "SchemaMismatchError";
  readonly changes: readonly SchemaChange[];

  constructor(message: string, changes: readonly SchemaChange[], options: YandexMusicErrorOptions = {}) {
    super(message, { code: "schema_mismatch", ...options });
    this.changes = changes;
  }
}
