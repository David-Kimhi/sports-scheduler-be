export function buildFilter(fieldPaths: string, obj: any): object {
  const filter: Record<string, any> = {};

  for (const path of fieldPaths.split(',')) {
    const trimmedPath = path.trim();
    const parts = trimmedPath.split('.');
    let value = obj;

    for (const part of parts) {
      if (value && part in value) {
        value = value[part];
      } else {
        throw new Error(`Field "${trimmedPath}" not found in document.`);
      }
    }

    filter[trimmedPath] = value;
  }

  return filter;
}
