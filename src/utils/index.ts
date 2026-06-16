import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type {
  TimeRange,
  RangeType,
  ReportItem,
  GiteeCommit,
  GiteeRepo,
  CommitType,
  TypeDistribution,
  WorkFocus,
} from "@/types";

dayjs.extend(isoWeek);

// ===================== 提交分类系统 =====================

/** 提交类型映射表 */
const COMMIT_TYPE_MAP: {
  prefix: string;
  type: CommitType;
  label: string;
  icon: string;
}[] = [
  { prefix: "feat", type: "feat", label: "✨ 新功能", icon: "✨" },
  { prefix: "fix", type: "fix", label: "🐛 修复", icon: "🐛" },
  { prefix: "chore", type: "chore", label: "🔧 杂项", icon: "🔧" },
  { prefix: "refactor", type: "refactor", label: "♻️ 重构", icon: "♻️" },
  { prefix: "docs", type: "docs", label: "📝 文档", icon: "📝" },
  { prefix: "style", type: "style", label: "💄 样式", icon: "💄" },
  { prefix: "test", type: "test", label: "✅ 测试", icon: "✅" },
  { prefix: "perf", type: "chore", label: "🔧 杂项", icon: "🔧" },
  { prefix: "ci", type: "chore", label: "🔧 杂项", icon: "🔧" },
  { prefix: "build", type: "chore", label: "🔧 杂项", icon: "🔧" },
  { prefix: "revert", type: "chore", label: "🔧 杂项", icon: "🔧" },
];

/** 合并提交检测关键词 */
const MERGE_KEYWORDS = [
  "merge branch",
  "merge remote",
  "merge pull request",
  "合并分支",
  "合并远程",
  "合并请求",
  "🔀",
  "合并",
];

/** 从提交信息中解析类型 */
export function classifyCommit(message: string): CommitType {
  const lower = message.toLowerCase().trim();

  // 检测合并提交
  if (MERGE_KEYWORDS.some((kw) => lower.includes(kw))) {
    return "merge";
  }

  // 检测 conventional commit 格式：type: description 或 type(scope): description
  const conventionalMatch = message.match(/^(\w+)(\([^)]*\))?\s*[!:]/);
  if (conventionalMatch) {
    const prefix = conventionalMatch[1].toLowerCase();
    const mapping = COMMIT_TYPE_MAP.find((m) => m.prefix === prefix);
    if (mapping) return mapping.type;
  }

  // 检测中文关键词
  if (
    lower.includes("新增") ||
    lower.includes("添加") ||
    lower.includes("add") ||
    lower.includes("实现")
  ) {
    return "feat";
  }
  if (
    lower.includes("修复") ||
    lower.includes("修复:") ||
    lower.includes("fix") ||
    lower.includes("bug") ||
    lower.includes("完善")
  ) {
    return "fix";
  }
  if (
    lower.includes("重构") ||
    lower.includes("refactor") ||
    lower.includes("优化")
  ) {
    return "refactor";
  }
  if (
    lower.includes("文档") ||
    lower.includes("doc") ||
    lower.includes("readme")
  ) {
    return "docs";
  }
  if (
    lower.includes("样式") ||
    lower.includes("style") ||
    lower.includes("css") ||
    lower.includes("ui")
  ) {
    return "style";
  }
  if (lower.includes("测试") || lower.includes("test")) {
    return "test";
  }
  if (
    lower.includes("杂项") ||
    lower.includes("chore") ||
    lower.includes("配置") ||
    lower.includes("依赖") ||
    lower.includes("构建") ||
    lower.includes("build") ||
    lower.includes("deps")
  ) {
    return "chore";
  }

  return "other";
}

/** 获取提交类型的显示信息 */
export function getCommitTypeInfo(type: CommitType): {
  label: string;
  icon: string;
} {
  const mapping = COMMIT_TYPE_MAP.find((m) => m.type === type);
  if (mapping) return { label: mapping.label, icon: mapping.icon };
  if (type === "merge") return { label: "🔀 合并", icon: "🔀" };
  return { label: "📌 其他", icon: "📌" };
}

/** 从提交信息中提取可读摘要（去除 conventional commit 前缀等噪音） */
export function extractSummary(message: string): string {
  let cleaned = message.trim();

  // 去除 merge 前缀
  const mergePatterns = [
    /^merge\s+(branch|remote|pull request)[^:]*:\s*/i,
    /^合并[^:]*:\s*/,
  ];
  for (const p of mergePatterns) {
    if (p.test(cleaned)) {
      cleaned = cleaned.replace(p, "").trim();
      if (!cleaned) return message.trim(); // 如果清空了，返回原始信息
    }
  }

  // 去除 conventional commit 类型前缀：type(scope): 或 type:
  const ccMatch = cleaned.match(/^(\w+)(\([^)]*\))?\s*[!:]\s*/);
  if (ccMatch) {
    cleaned = cleaned.slice(ccMatch[0].length).trim();
  }

  // 去除多余换行（只保留第一行作为摘要）
  const firstLine = cleaned.split("\n")[0].trim();

  return firstLine || message.trim();
}

// ===================== 时间范围 =====================

/** 根据类型生成时间范围 */
export function getTimeRange(
  type: RangeType,
  customRange?: [string, string],
): TimeRange {
  const now = dayjs();

  switch (type) {
    case "week": {
      const start = now.startOf("isoWeek").format("YYYY-MM-DDTHH:mm:ss");
      const end = now.format("YYYY-MM-DDTHH:mm:ss");
      return { type, start, end };
    }
    case "month": {
      const start = now.startOf("month").format("YYYY-MM-DDTHH:mm:ss");
      const end = now.format("YYYY-MM-DDTHH:mm:ss");
      return { type, start, end };
    }
    case "year": {
      const start = now.startOf("year").format("YYYY-MM-DDTHH:mm:ss");
      const end = now.format("YYYY-MM-DDTHH:mm:ss");
      return { type, start, end };
    }
    case "custom": {
      if (customRange && customRange.length === 2) {
        return {
          type,
          start: dayjs(customRange[0])
            .startOf("day")
            .format("YYYY-MM-DDTHH:mm:ss"),
          end: dayjs(customRange[1]).endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        };
      }
      return { type, start: "", end: "" };
    }
  }
}

// ===================== 提交记录转换 =====================

/** 将提交记录转换为报告项（含分类） */
export function commitsToReportItems(
  commits: GiteeCommit[],
  repo: GiteeRepo,
): ReportItem[] {
  return commits.map((c) => {
    const rawMsg = c.commit.message.trim();
    const commitType = classifyCommit(rawMsg);
    return {
      repo: repo.full_name,
      repoUrl: repo.html_url,
      date: dayjs(c.commit.author.date).format("YYYY-MM-DD HH:mm"),
      dateObj: c.commit.author.date,
      message: rawMsg,
      summary: extractSummary(rawMsg),
      commitUrl: c.html_url,
      commitType,
    };
  });
}

// ===================== 报告生成（核心） =====================

/** 计算两个日期之间有多少个不同的工作日 */
function countWorkingDays(dates: string[]): number {
  const uniqueDays = new Set<string>();
  for (const d of dates) {
    const day = dayjs(d);
    // 排除周末
    if (day.day() !== 0 && day.day() !== 6) {
      uniqueDays.add(day.format("YYYY-MM-DD"));
    }
  }
  return uniqueDays.size;
}

/** 获取所有不同的日期（格式：MM月DD日） */
function getUniqueDateLabels(dates: string[]): string[] {
  const unique = new Set<string>();
  for (const d of dates) {
    unique.add(dayjs(d).format("M月D日"));
  }
  return Array.from(unique).sort((a, b) => {
    const [ma, da] = a
      .replace(/[月日]/g, "-")
      .split("-")
      .map(Number);
    const [mb, db] = b
      .replace(/[月日]/g, "-")
      .split("-")
      .map(Number);
    return ma === mb ? da - db : ma - mb;
  });
}

/** 按提交类型分组 */
function groupByType(items: ReportItem[]): TypeDistribution[] {
  const typeOrder: CommitType[] = [
    "feat",
    "fix",
    "chore",
    "refactor",
    "docs",
    "style",
    "test",
    "merge",
    "other",
  ];
  const groups = new Map<CommitType, ReportItem[]>();

  for (const item of items) {
    const list = groups.get(item.commitType) || [];
    list.push(item);
    groups.set(item.commitType, list);
  }

  const total = items.length;
  const result: TypeDistribution[] = [];

  for (const type of typeOrder) {
    const list = groups.get(type);
    if (!list || list.length === 0) continue;
    const info = getCommitTypeInfo(type);
    result.push({
      type,
      label: info.label,
      icon: info.icon,
      count: list.length,
      percentage: Math.round((list.length / total) * 100),
      items: list.sort((a, b) => b.dateObj.localeCompare(a.dateObj)),
    });
  }

  return result;
}

/** 分析工作焦点（主题聚类） */
function analyzeWorkFocus(items: ReportItem[]): WorkFocus[] {
  const nonMerge = items.filter((i) => i.commitType !== "merge");
  if (nonMerge.length === 0) return [];

  const total = nonMerge.length;

  // 关键词-主题映射
  interface ThemePattern {
    keywords: string[];
    title: string;
  }
  const themePatterns: ThemePattern[] = [
    { keywords: ["台风", "typhoon", "风雨", "storm"], title: "台风预报功能" },
    {
      keywords: ["决策服务", "材料制作", "出图", "产品制作"],
      title: "决策服务与材料制作",
    },
    {
      keywords: ["客观预报", "数值预报", "综合研判"],
      title: "客观预报与数值预报",
    },
    { keywords: ["网格", "grid", "短时预报"], title: "网格预报功能" },
    { keywords: ["定点服务", "任务", "创建"], title: "定点服务功能" },
    {
      keywords: ["组件", "重构", "架构", "模块", "结构"],
      title: "组件架构优化",
    },
    {
      keywords: ["样式", "style", "css", "UI", "界面", "面板", "布局"],
      title: "界面样式优化",
    },
    {
      keywords: ["截图", "导出", "复制", "html2canvas", "工具"],
      title: "工具与导出能力",
    },
  ];

  // 为每个提交匹配主题
  const themeItems = new Map<string, ReportItem[]>();
  const unmatched: ReportItem[] = [];

  for (const item of nonMerge) {
    let matched = false;
    for (const pattern of themePatterns) {
      if (
        pattern.keywords.some(
          (kw) => item.message.includes(kw) || item.summary.includes(kw),
        )
      ) {
        const list = themeItems.get(pattern.title) || [];
        list.push(item);
        themeItems.set(pattern.title, list);
        matched = true;
        break;
      }
    }
    if (!matched) {
      unmatched.push(item);
    }
  }

  // 构建结果
  const focuses: WorkFocus[] = [];
  for (const pattern of themePatterns) {
    const items = themeItems.get(pattern.title);
    if (items && items.length > 0) {
      focuses.push({
        title: pattern.title,
        percentage: Math.round((items.length / total) * 100),
        details: items.slice(0, 5).map((i) => i.summary),
      });
    }
  }

  // 未匹配的作为"其他优化"
  if (unmatched.length > 0) {
    focuses.push({
      title: "其他优化",
      percentage: Math.round((unmatched.length / total) * 100),
      details: unmatched.slice(0, 5).map((i) => i.summary),
    });
  }

  // 按占比降序排列
  focuses.sort((a, b) => b.percentage - a.percentage);
  return focuses;
}

/** 生成工作报告文本（智能版本） */
export function generateReportText(
  items: ReportItem[],
  range: TimeRange,
  userName: string,
): string {
  const rangeLabelMap: Record<RangeType, string> = {
    week: "周报",
    month: "月报",
    year: "年报",
    custom: "工作报告",
  };

  const startStr = dayjs(range.start).format("YYYY年MM月DD日");
  const endStr = dayjs(range.end).format("YYYY年MM月DD日");
  const startShort = dayjs(range.start).format("M月D日");
  const endShort = dayjs(range.end).format("M月D日");
  const rangeLabel = rangeLabelMap[range.type];

  if (items.length === 0) {
    return `## 个人${rangeLabel} - ${userName}（${startShort}-${endShort}）

### 📊 提交统计

- **总提交数**: 0 条

---

该时间段内暂无提交记录。`;
  }

  // ===== 1. 统计计算 =====
  const typeDistributions = groupByType(items);
  const mergeItems = items.filter((i) => i.commitType === "merge");
  const effectiveItems = items.filter((i) => i.commitType !== "merge");
  const allDates = items.map((i) => i.dateObj);
  const workingDays = countWorkingDays(allDates);
  const dateLabels = getUniqueDateLabels(allDates);

  // ===== 2. 构建报告 =====
  let text = `## 个人${rangeLabel} - ${userName}（${startShort}-${endShort}）

### 📊 提交统计

- **总提交数**: ${items.length} 条
- **有效提交**: ${effectiveItems.length} 条${mergeItems.length > 0 ? `（不含 ${mergeItems.length} 条合并提交）` : ""}
- **工作日**: ${workingDays} 天工作（${dateLabels.join("、")}）

### 📈 提交类型分布

| 类型 | 数量 | 占比 |
|------|------|------|
`;

  for (const dist of typeDistributions) {
    text += `| ${dist.label} | ${dist.count} | ${dist.percentage}% |\n`;
  }

  text += `
### 📋 详细工作清单

`;

  // ===== 3. 按类型列出详细清单 =====
  for (const dist of typeDistributions) {
    text += `#### ${dist.label}（${dist.count} 项）

`;
    const byDate = new Map<string, ReportItem[]>();
    for (const item of dist.items) {
      const dayLabel = dayjs(item.dateObj).format("M月D日");
      const list = byDate.get(dayLabel) || [];
      list.push(item);
      byDate.set(dayLabel, list);
    }

    const sortedDates = Array.from(byDate.keys()).sort((a, b) => {
      const [ma, da] = a
        .replace(/[月日]/g, "-")
        .split("-")
        .map(Number);
      const [mb, db] = b
        .replace(/[月日]/g, "-")
        .split("-")
        .map(Number);
      return mb === ma ? db - da : mb - ma;
    });

    for (const dayLabel of sortedDates) {
      const dayItems = byDate.get(dayLabel)!;
      for (const item of dayItems) {
        text += `- **${dayLabel}** - ${item.summary}\n`;
      }
    }
    text += "\n";
  }

  // ===== 4. 工作重点分析 =====
  const focuses = analyzeWorkFocus(items);
  if (focuses.length > 0) {
    text += `### 🎯 工作重点分析

`;
    let idx = 1;
    for (const focus of focuses.slice(0, 5)) {
      text += `**${idx}. ${focus.title}（占比 ~${focus.percentage}%）**

`;
      for (const detail of focus.details) {
        text += `- ${detail}\n`;
      }
      text += "\n";
      idx++;
    }
  }

  // ===== 5. 代码变更总结 =====
  text += `### 💡 代码变更情况

`;

  // 找占比最高的类型
  const topTypes = [...typeDistributions]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);
  const topTypeLabels = topTypes.map(
    (t) => `**${t.label}**（${t.percentage}%）`,
  );

  if (effectiveItems.length > 0) {
    const featDist = typeDistributions.find((d) => d.type === "feat");
    const fixDist = typeDistributions.find((d) => d.type === "fix");

    if (featDist && featDist.percentage >= 30) {
      text += `- 本周新功能开发占比最高（${featDist.percentage}%），功能迭代速度较快\n`;
    }
    if (fixDist && fixDist.percentage >= 20) {
      text += `- 缺陷修复占比 ${fixDist.percentage}%，持续优化产品质量\n`;
    }

    if (focuses.length > 0) {
      const topFocuses = focuses.slice(0, 2).map((f) => f.title);
      text += `- 工作主要集中在**${topFocuses.join("** 和 **")}**等核心模块\n`;
    }

    text += `- 提交类型分布：${topTypeLabels.join("、")} 是主要工作类型\n`;
  }

  // ===== 6. 成果总结 =====
  text += `
### ✅ ${rangeLabel === "工作报告" ? "本期" : "本周"}成果总结

`;

  const featCount =
    typeDistributions.find((d) => d.type === "feat")?.count || 0;
  const fixCount = typeDistributions.find((d) => d.type === "fix")?.count || 0;
  const choreCount =
    typeDistributions.find((d) => d.type === "chore")?.count || 0;
  const refactorCount =
    typeDistributions.find((d) => d.type === "refactor")?.count || 0;

  if (featCount > 0) {
    text += `- ✨ 完成 ${featCount} 项新功能开发\n`;
  }
  if (fixCount > 0) {
    text += `- 🐛 修复 ${fixCount} 个问题和优化\n`;
  }
  if (refactorCount > 0) {
    text += `- ♻️ 进行 ${refactorCount} 项代码重构优化\n`;
  }
  if (choreCount > 0) {
    text += `- 🔧 完成 ${choreCount} 项杂项工作（配置、依赖等）\n`;
  }

  if (focuses.length > 0) {
    text += `- 🎯 核心聚焦于${focuses[0].title}`;
    if (focuses.length > 1) {
      text += `、${focuses[1].title}`;
    }
    text += `，持续推进模块完善\n`;
  }

  text += `\n---\n\n> 本报告由 Gitee 工作报告生成器自动生成 · ${dayjs().format("YYYY-MM-DD HH:mm")}`;

  return text;
}

// ===================== 剪贴板 =====================

/** 复制文本到剪贴板 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  }
}
