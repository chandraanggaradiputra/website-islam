/**
 * Tipe Data untuk MCP Server DevOps & GitHub Relay Banten Mengaji
 * Strict TypeScript tanpa tipe `any`
 */

export interface McpDispatchTaskArgs {
  task_id: string;
  title: string;
  instructions: string;
  branch?: string;
  target_path?: string;
}

export interface McpDispatchTaskResult {
  success: boolean;
  task_id: string;
  title: string;
  branch: string;
  target_path: string;
  commit_sha: string;
  commit_url: string;
  content_sha: string;
  message: string;
}

export interface McpCreateIssueArgs {
  title: string;
  body: string;
}

export interface McpCreateIssueResult {
  success: boolean;
  issue_number: number;
  title: string;
  issue_url: string;
  state: string;
}

export interface McpListIssuesArgs {
  state?: "open" | "closed" | "all";
  limit?: number;
}

export interface McpIssueItem {
  number: number;
  title: string;
  url: string;
  state: string;
  created_at: string;
  author: string;
}

export interface McpListIssuesResult {
  success: boolean;
  count: number;
  issues: McpIssueItem[];
}

export interface McpReadRepoFileArgs {
  path: string;
  branch?: string;
}

export interface McpReadRepoFileResult {
  success: boolean;
  path: string;
  branch: string;
  size: number;
  sha: string;
  content: string;
}
