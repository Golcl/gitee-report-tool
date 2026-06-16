/** Gitee 用户信息 */
export interface GiteeUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio: string;
  email: string;
}

/** Gitee 仓库信息 */
export interface GiteeRepo {
  id: number;
  full_name: string;
  name: string;
  path: string;
  description: string;
  html_url: string;
  private: boolean;
  updated_at: string;
  namespace?: {
    path: string;
  };
}

/** Gitee 提交记录 */
export interface GiteeCommit {
  sha: string;
  html_url: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

/** 时间范围类型 */
export type RangeType = "week" | "month" | "year" | "custom";

/** 时间范围 */
export interface TimeRange {
  type: RangeType;
  start: string;
  end: string;
}

/** 提交分类类型 */
export type CommitType =
  | "feat"
  | "fix"
  | "chore"
  | "refactor"
  | "docs"
  | "style"
  | "test"
  | "merge"
  | "other";

/** 提交分类信息 */
export interface CommitTypeInfo {
  type: CommitType;
  label: string;
  icon: string;
}

/** 报告项 */
export interface ReportItem {
  repo: string;
  repoUrl: string;
  date: string;
  dateObj: string; // ISO日期格式，用于统计工作日
  message: string; // 原始提交信息
  summary: string; // 清理后的摘要（去除类型前缀等）
  commitUrl: string;
  commitType: CommitType; // 提交分类
}

/** 提交类型分布 */
export interface TypeDistribution {
  type: CommitType;
  label: string;
  icon: string;
  count: number;
  percentage: number;
  items: ReportItem[];
}

/** 工作焦点 */
export interface WorkFocus {
  title: string;
  percentage: number;
  details: string[];
}

/** 登录状态 */
export interface AuthState {
  token: string;
  user: GiteeUser | null;
}
