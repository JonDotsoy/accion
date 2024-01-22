export interface Job {
  id: string;
  status: "success" | "failed" | "pending" | "progressing";
  name: string;
  duration?: number;
  needs?: string[];
}
