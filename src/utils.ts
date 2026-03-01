export function toolError(error: unknown): {
  isError: true;
  content: [{ type: "text"; text: string }];
} {
  const msg = error instanceof Error ? error.message : String(error);
  return { isError: true, content: [{ type: "text" as const, text: msg }] };
}

export function toolOk(data: unknown): {
  content: [{ type: "text"; text: string }];
} {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}
