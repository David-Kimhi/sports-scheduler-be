export function safeSerialize(value: unknown, maxLen = 2000): string {
  const seen = new WeakSet<object>();

  const json = JSON.stringify(
    value,
    (_key, v) => {
      // Primitives
      if (v === null || typeof v !== "object") {
        if (typeof v === "bigint") return `${v.toString()}n`;
        if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
        return v;
      }

      // Objects
      if (seen.has(v as object)) {
        const ctor = (v as any)?.constructor?.name || "Object";
        return `[Circular ${ctor}]`;
      }
      seen.add(v as object);

      // Dates
      if (v instanceof Date) return v.toISOString();

      // Arrays (cap)
      if (Array.isArray(v)) {
        const copy = v.slice(0, 25); // preview up to 25 items
        if (v.length > 25) copy.push(`…(+${v.length - 25} more)`);
        return copy;
      }

      // Known heavy / unsafe objects
      const ctor = (v as any)?.constructor?.name;
      if (ctor === "MongoClient" || ctor === "Db" || ctor === "Collection") {
        return `[${ctor}]`;
      }

      return v;
    },
    2
  );

  // Cap the length to avoid huge logs
  if (json.length > maxLen) {
    return json.slice(0, maxLen) + "…(truncated)";
  }
  return json;
}
