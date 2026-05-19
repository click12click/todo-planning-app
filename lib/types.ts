export type TaskStatus = "todo" | "doing" | "done";
export type Priority = "high" | "medium" | "low";

export interface Goal {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface WeeklyObjective {
  id: string;
  title: string;
  goalId: string | null;
}

export interface WeeklyPlan {
  weekStart: string;
  objectives: WeeklyObjective[];
  memo: string;
  retrospective: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  status: TaskStatus;
  order: number;
  weeklyObjectiveId: string | null;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  githubId: number;
  username: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}
