/**
 * docs/build-html.cjs
 * 将 docs/*.md 整合构建为单页 index.html
 * 用法：node docs/build-html.cjs
 * 修改 md 后重新运行即可同步 index.html
 */
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const DOCS_DIR = __dirname;

// 文档顺序（决定侧边栏与正文排列）
const FILES = [
  "getting-started.md",
  "architecture.md",
  "form-designer.md",
  "rule-engine-designer.md",
  "containers.md",
  "commonpage.md",
  "diagram-designer.md",
  "system-components.md",
  "api-layer.md",
  "backend-api.md",
];

// 侧边栏分组配置：[分组名, [文件名, 导航显示名, data-keyword]]
const NAV_GROUPS = [
  ["指南", [
    ["getting-started.md", "快速上手", "快速上手 安装 配置"],
    ["architecture.md", "架构总览", "架构 模块 目录 数据流"],
  ]],
  ["核心组件", [
    ["form-designer.md", "表单设计器", "表单设计器 StarHorseFormDesign FormConfig"],
    ["rule-engine-designer.md", "规则引擎设计器", "规则引擎 RuleDesigner 节点 触发事件 FieldAction"],
  ]],
  ["页面与容器", [
    ["containers.md", "布局容器", "布局容器 container box dytable tab card"],
    ["commonpage.md", "通用页面模板", "通用页面 commonpage useCommonPage FormTablePage"],
    ["diagram-designer.md", "流程图设计器", "流程图 DiagramDesigner"],
  ]],
  ["参考", [
    ["system-components.md", "工具与系统组件", "工具组件 DynamicQueryBuilder AiDialog"],
    ["api-layer.md", "前端 API 层", "API 接口 rule_engine_api dataAdapter"],
    ["backend-api.md", "后端接口", "后端 Java SpringBoot WebSocket FormController"],
  ]],
];

// slug 生成：中文保留，空格转 -，小写
const slug = (s) =>
  s
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

// 从 markdown 提取 H1 标题
function extractH1(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "";
}

// 为 HTML 内容中的 h2/h3 添加 id（用于锚点）
function addHeadingIds(html) {
  let counter = 0;
  return html.replace(/<(h[1-3])>(.*?)<\/\1>/g, (match, tag, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text) return match;
    return `<${tag} id="${slug(text)}">${inner}</${tag}>`;
  });
}

// 读取并转换所有 md 文件
const sections = [];
const navItems = [];

for (const file of FILES) {
  const fp = path.join(DOCS_DIR, file);
  const md = fs.readFileSync(fp, "utf-8");
  const h1 = extractH1(md);
  const sectionId = slug(h1) || file.replace(".md", "");

  // 去掉 md 中的 H1（已用 section 标题代替）
  const bodyMd = md.replace(/^#\s+.+$/m, "").trim();
  const html = marked.parse(bodyMd);
  const htmlWithIds = addHeadingIds(html);

  sections.push({
    id: sectionId,
    title: h1,
    html: htmlWithIds,
  });
}

// 构建侧边栏 HTML
let navHtml = "";
for (const [groupName, items] of NAV_GROUPS) {
  navHtml += `        <div class="nav-group">\n          <div class="nav-group-title">${groupName}</div>\n`;
  for (const [file, label, keyword] of items) {
    const md = fs.readFileSync(path.join(DOCS_DIR, file), "utf-8");
    const h1 = extractH1(md);
    const sectionId = slug(h1) || file.replace(".md", "");
    navHtml += `          <a class="nav-item" href="#${sectionId}" data-keyword="${keyword}">${label}</a>\n`;
  }
  navHtml += `        </div>\n`;
}

// 构建正文 HTML
let contentHtml = "";
for (const s of sections) {
  contentHtml += `      <section id="${s.id}">\n        <h1>${s.title}</h1>\n${s.html}\n      </section>\n\n`;
}

// 组装完整 HTML
const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StarHorseForm 动态表单组件文档</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: #409eff;
      --primary-light: #ecf5ff;
      --primary-dark: #337ecc;
      --text: #303133;
      --text-secondary: #606266;
      --text-muted: #909399;
      --border: #dcdfe6;
      --border-light: #e4e7ed;
      --bg: #fff;
      --bg-page: #f5f7fa;
      --bg-code: #f8f8f8;
      --sidebar-width: 260px;
    }
    html { scroll-behavior: smooth; font-size: 16px; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif; color: var(--text); background: var(--bg-page); line-height: 1.6; }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }

    .app { display: flex; min-height: 100vh; }
    .sidebar {
      position: fixed; top: 0; left: 0; bottom: 0;
      width: var(--sidebar-width);
      background: var(--bg);
      border-right: 1px solid var(--border-light);
      overflow-y: auto; z-index: 100;
      transition: transform 0.3s ease;
      display: flex; flex-direction: column;
    }
    .sidebar-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-light);
      position: sticky; top: 0; background: var(--bg); z-index: 1;
    }
    .sidebar-header h1 {
      font-size: 18px; font-weight: 700; color: var(--primary);
      margin-bottom: 12px; white-space: nowrap;
    }
    .search-input {
      width: 100%; padding: 8px 12px; border: 1px solid var(--border);
      border-radius: 4px; font-size: 13px; outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: var(--primary); }
    .search-input::placeholder { color: var(--text-muted); }

    .nav { flex: 1; overflow-y: auto; padding: 8px 0; }
    .nav-group { margin-bottom: 4px; }
    .nav-group-title {
      padding: 8px 20px 4px; font-size: 12px; font-weight: 600;
      color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;
      cursor: default; user-select: none;
    }
    .nav-item {
      display: block; padding: 7px 20px 7px 28px; font-size: 14px;
      color: var(--text-secondary); cursor: pointer;
      transition: all 0.15s; border-left: 3px solid transparent;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .nav-item:hover { color: var(--primary); background: var(--primary-light); }
    .nav-item.active {
      color: var(--primary); background: var(--primary-light);
      border-left-color: var(--primary); font-weight: 500;
    }
    .nav-item.hidden { display: none; }

    .content {
      flex: 1; margin-left: var(--sidebar-width);
      max-width: 920px; padding: 40px 48px 80px;
    }
    .content section { margin-bottom: 48px; scroll-margin-top: 20px; }
    .content section + section { padding-top: 24px; border-top: 1px solid var(--border-light); }
    .content h1 { font-size: 28px; font-weight: 700; margin-bottom: 16px; color: var(--text); }
    .content h2 { font-size: 22px; font-weight: 600; margin: 32px 0 12px; color: var(--text); padding-bottom: 8px; border-bottom: 1px solid var(--border-light); }
    .content h3 { font-size: 18px; font-weight: 600; margin: 24px 0 10px; color: var(--text); }
    .content h4 { font-size: 16px; font-weight: 600; margin: 20px 0 8px; color: var(--text-secondary); }
    .content p { margin: 8px 0; color: var(--text-secondary); }
    .content ul, .content ol { margin: 8px 0; padding-left: 24px; color: var(--text-secondary); }
    .content li { margin: 4px 0; }
    .content strong { color: var(--text); font-weight: 600; }
    .content blockquote {
      margin: 12px 0; padding: 12px 16px;
      border-left: 4px solid var(--primary);
      background: var(--primary-light); border-radius: 0 4px 4px 0;
      color: var(--text-secondary); font-size: 14px;
    }
    .content blockquote p { margin: 4px 0; }
    .content hr { border: none; border-top: 1px solid var(--border-light); margin: 24px 0; }

    .content table {
      width: 100%; border-collapse: collapse; margin: 12px 0;
      font-size: 14px; overflow-x: auto; display: block;
    }
    .content th, .content td {
      border: 1px solid var(--border); padding: 10px 14px;
      text-align: left; vertical-align: top;
    }
    .content th {
      background: var(--bg-page); font-weight: 600;
      color: var(--text); white-space: nowrap;
    }
    .content tr:nth-child(even) td { background: #fafafa; }
    .content tr:hover td { background: var(--primary-light); }

    .content code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      background: var(--bg-code); padding: 2px 6px; border-radius: 3px;
      font-size: 0.9em; color: #c7254e;
    }
    .content pre {
      margin: 12px 0; padding: 16px 20px;
      background: #1e1e1e; border-radius: 6px;
      overflow-x: auto; line-height: 1.5;
    }
    .content pre code {
      background: none; color: #d4d4d4; padding: 0;
      font-size: 13px; white-space: pre;
    }

    .menu-btn {
      display: none; position: fixed; top: 12px; left: 12px; z-index: 200;
      width: 40px; height: 40px; border-radius: 8px;
      background: var(--bg); border: 1px solid var(--border);
      cursor: pointer; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .menu-btn svg { width: 20px; height: 20px; stroke: var(--text); }
    .overlay {
      display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.3);
      z-index: 99;
    }
    .overlay.show { display: block; }

    @media (max-width: 768px) {
      .menu-btn { display: flex; }
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); box-shadow: 4px 0 16px rgba(0,0,0,0.1); }
      .content { margin-left: 0; padding: 20px 16px 60px; padding-top: 64px; }
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: #c0c4cc; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #909399; }
    ::-webkit-scrollbar-track { background: transparent; }

    .back-top {
      position: fixed; right: 32px; bottom: 32px;
      width: 40px; height: 40px; border-radius: 50%;
      background: var(--primary); color: #fff;
      border: none; cursor: pointer; display: none;
      align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(64,158,255,0.4);
      transition: opacity 0.2s; z-index: 50;
    }
    .back-top:hover { background: var(--primary-dark); }
    .back-top.show { display: flex; }
    .back-top svg { width: 18px; height: 18px; }
  </style>
</head>
<body>
  <button class="menu-btn" id="menuBtn" aria-label="菜单">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  </button>
  <div class="overlay" id="overlay"></div>
  <div class="app">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <h1>StarHorseForm</h1>
        <input type="text" placeholder="搜索文档..." class="search-input" id="searchInput">
      </div>
      <nav class="nav" id="nav">
${navHtml}      </nav>
    </aside>
    <main class="content" id="content">

${contentHtml}    </main>
  </div>

  <button class="back-top" id="backTop" aria-label="回到顶部">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
  </button>

  <script>
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });

    const searchInput = document.getElementById('searchInput');
    const navItems = document.querySelectorAll('.nav-item');

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      navItems.forEach(item => {
        const keyword = (item.getAttribute('data-keyword') || '').toLowerCase();
        const text = item.textContent.toLowerCase();
        if (!query || keyword.includes(query) || text.includes(query)) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
      document.querySelectorAll('.nav-group').forEach(group => {
        const visibleItems = group.querySelectorAll('.nav-item:not(.hidden)');
        group.style.display = visibleItems.length ? '' : 'none';
      });
    });

    const sections = document.querySelectorAll('section[id]');
    const backTop = document.getElementById('backTop');

    function updateActiveNav() {
      let current = '';
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) current = section.id;
      });
      navItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('href') === '#' + current);
      });
    }

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(item.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          sidebar.classList.remove('open');
          overlay.classList.remove('show');
        }
      });
    });

    window.addEventListener('scroll', () => {
      updateActiveNav();
      backTop.classList.toggle('show', window.scrollY > 400);
    });

    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    updateActiveNav();
  </script>
</body>
</html>
`;

const outPath = path.join(DOCS_DIR, "index.html");
fs.writeFileSync(outPath, fullHtml, "utf-8");
console.log(`已生成 ${outPath}（${(fullHtml.length / 1024).toFixed(1)} KB）`);