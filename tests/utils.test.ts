import { describe, expect, it } from 'vitest';
import { toolError, toolOk } from '../src/utils.js';

describe('utils', () => {
  it('toolError should use Error.message when provided', () => {
    const result = toolError(new Error('boom'));
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('boom');
  });

  it('toolError should stringify non-Error values', () => {
    const result = toolError('string failure');
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('string failure');
  });

  it('toolOk should return JSON text content', () => {
    const result = toolOk({ ok: true });
    expect(result.content[0].text).toBe('{\n  "ok": true\n}');
  });
});
