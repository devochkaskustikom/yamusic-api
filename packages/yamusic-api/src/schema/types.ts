export type PrimitiveType = "string" | "number" | "boolean" | "null";

export type ShapeNode =
  | { readonly kind: "unknown" }
  | { readonly kind: "primitive"; readonly types: readonly PrimitiveType[] }
  | { readonly kind: "array"; readonly items: ShapeNode }
  | {
      readonly kind: "object";
      readonly required: readonly string[];
      readonly fields: Readonly<Record<string, ShapeNode>>;
    }
  | { readonly kind: "union"; readonly variants: readonly ShapeNode[] }
  | { readonly kind: "ref"; readonly name: string };
