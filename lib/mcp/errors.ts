/**
 * Standar Kode Error JSON-RPC 2.0 dan Kelas Eksepsi McpToolError
 * Mendukung pemetaan status HTTP dan penanganan error terpusat
 */

export const RPC = {
  PARSE: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL: -32603,
  UNAUTHORIZED: -32000,
  FORBIDDEN: -32001,
  RATE_LIMIT: -32002,
} as const;

export class McpToolError extends Error {
  code: number;
  constructor(message: string, code: number = RPC.INTERNAL) {
    super(message);
    this.name = "McpToolError";
    this.code = code;
    Object.setPrototypeOf(this, McpToolError.prototype);
  }
}
