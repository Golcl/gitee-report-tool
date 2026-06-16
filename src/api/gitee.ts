import type { GiteeUser, GiteeRepo, GiteeCommit } from "@/types";

const API_BASE = "https://gitee.com/api/v5";
const AUTH_BASE = "https://gitee.com";

/** 获取 OAuth 授权跳转 URL */
export function getAuthUrl(): string {
  const clientId = import.meta.env.VITE_GITEE_CLIENT_ID || "YOUR_CLIENT_ID";
  const redirectUri =
    import.meta.env.VITE_GITEE_REDIRECT_URI ||
    window.location.origin + window.location.pathname + '#/callback';
  return `${AUTH_BASE}/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
}

/** token 存储 key */
const TOKEN_KEY = "gitee_report_token";
const USER_KEY = "gitee_report_user";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): GiteeUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: GiteeUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** 通用请求方法 */
async function request<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const token = getStoredToken();
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `请求失败: ${res.status}`);
  }

  return res.json();
}

/** 获取当前用户信息 */
export function getCurrentUser(): Promise<GiteeUser> {
  return request<GiteeUser>("/user");
}

/** 获取用户仓库列表（按更新时间降序，取前20个） */
export function getUserRepos(): Promise<GiteeRepo[]> {
  return request<GiteeRepo[]>("/user/repos", {
    sort: "updated",
    direction: "desc",
    per_page: "30",
    type: "all",
  });
}

/** 获取仓库的提交记录（仅获取指定作者的提交） */
export async function getRepoCommits(
  owner: string,
  repo: string,
  since: string,
  until: string,
  author?: string,
): Promise<GiteeCommit[]> {
  const result: GiteeCommit[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const params: Record<string, string> = {
      since,
      until,
      per_page: String(perPage),
      page: String(page),
    };
    if (author) params.author = author;

    const commits = await request<GiteeCommit[]>(
      `/repos/${owner}/${repo}/commits`,
      params,
    );

    if (!commits || commits.length === 0) break;
    result.push(...commits);
    if (commits.length < perPage) break;
    page++;
  }

  return result;
}
