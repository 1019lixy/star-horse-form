export  const userOperationMsg=` /**
     * 代码不需要 function fname(){} 这样的包装，直接写函数体即可;
     * 可以直接利用的系统变量
     * currentField：Record<string,any> 当前组件信息
     * formData：Record<string,any>  表单数据
     * formFields:Array<FieldInfo> 表单所有属性
     * formInstance:Ref 表单实例
     * userInfo:Record<string,any> 当前登录信息
     * postRequest:Function(url:string,params:Object|Array) Post 请求接口
     * getRequest:Function(url:string) Get 请求接口
     * download:Function(url:string) 下载数据接口
     * upload:Function(url,params?:Object|Array) 上传数据接口
     * load:Function(target?:string) 加载遮罩
     * closeLoad:Function() 关闭加载遮罩
     */`;
/**
 * 自定义 JS 代码格式化与压缩工具
 * 轻量实现，不依赖 prettier，避免与第三方库的模块循环依赖
 */

/**
 * 格式化 JS 代码（供编辑时使用）
 * - 把压缩的单行代码拆分成多行
 * - 按括号嵌套添加缩进
 * - 保留字符串和注释内容不变
 */
export function formatJs(code: string): string {
    if (!code || !code.trim()) return code || "";
    try {
        return doFormat(code);
    } catch (e) {
        console.warn("formatJs failed, return original code:", e);
        return code;
    }
}

/**
 * 压缩 JS 代码（供保存时使用）
 * - 移除多余空白、空行
 * - 保留字符串和注释内容
 */
export function compressJs(code: string): string {
    if (!code || !code.trim()) return code || "";
    try {
        return doCompress(code);
    } catch (e) {
        console.warn("compressJs failed, return original code:", e);
        return code;
    }
}

// ─── 内部：字符级扫描工具 ───

interface ScanContext {
    out: string;
    i: number;
    src: string;
    len: number;
}

/** 跳过并原样输出字符串字面量 */
function scanString(ctx: ScanContext): void {
    const {src, len} = ctx;
    const quote = src[ctx.i];
    ctx.out += quote;
    ctx.i++;
    while (ctx.i < len) {
        const c = src[ctx.i];
        ctx.out += c;
        ctx.i++;
        if (c === "\\") {
            if (ctx.i < len) {
                ctx.out += src[ctx.i];
                ctx.i++;
            }
            continue;
        }
        if (c === quote) break;
    }
}

/** 跳过并原样输出单行注释 //... */
function scanLineComment(ctx: ScanContext): string {
    const {src, len} = ctx;
    let comment = "";
    while (ctx.i < len && src[ctx.i] !== "\n") {
        comment += src[ctx.i];
        ctx.i++;
    }
    return comment;
}

/** 跳过并原样输出多行注释 /* ... *\/ */
function scanBlockComment(ctx: ScanContext): string {
    const {src, len} = ctx;
    let comment = "/*";
    ctx.i += 2;
    while (ctx.i < len && !(src[ctx.i] === "*" && src[ctx.i + 1] === "/")) {
        comment += src[ctx.i];
        ctx.i++;
    }
    comment += "*/";
    ctx.i += 2;
    return comment;
}

// ─── 格式化实现 ───

/**
 * 格式化：把压缩代码拆分成多行并缩进
 * 策略：在 ; { } 后断行，按 { } 计算缩进层级
 */
function doFormat(src: string): string {
    const len = src.length;
    let out = "";
    let i = 0;
    let indent = 0;
    let lineStart = true;
    let lastChar = "";

    const pad = () => "  ".repeat(Math.max(0, indent));
    const newline = () => {
        out += "\n";
        lineStart = true;
    };

    while (i < len) {
        const ch = src[i];
        const next = src[i + 1];

        // 字符串：原样输出
        if (ch === '"' || ch === "'" || ch === "`") {
            if (lineStart) {
                out += pad();
                lineStart = false;
            }
            const ctx = {out, i, src, len};
            scanString(ctx);
            out = ctx.out;
            i = ctx.i;
            lastChar = ch;
            continue;
        }
        // 单行注释
        if (ch === "/" && next === "/") {
            if (lineStart) {
                out += pad();
                lineStart = false;
            }
            const ctx = {out, i, src, len};
            const comment = scanLineComment(ctx);
            i = ctx.i;
            out += comment;
            // 单行注释后必须换行
            newline();
            continue;
        }
        // 多行注释
        if (ch === "/" && next === "*") {
            if (lineStart) {
                out += pad();
                lineStart = false;
            }
            const ctx = {out, i, src, len};
            const comment = scanBlockComment(ctx);
            i = ctx.i;
            out += comment;
            lastChar = "/";
            continue;
        }
        // 左花括号：换行后缩进+1
        if (ch === "{") {
            if (!lineStart && lastChar && !/[\s(]/.test(lastChar)) {
                out += " ";
            }
            out += "{";
            indent++;
            newline();
            i++;
            lastChar = "{";
            continue;
        }
        // 右花括号：缩进-1 后换行
        if (ch === "}") {
            indent = Math.max(0, indent - 1);
            if (!lineStart) newline();
            out += pad() + "}";
            indent = Math.max(0, indent);
            // } 后若跟 ; 则不立即换行
            if (src[i + 1] !== ";" && src[i + 1] !== "," && src[i + 1] !== ")") {
                newline();
            }
            i++;
            lastChar = "}";
            lineStart = false;
            continue;
        }
        // 分号：换行（for 循环内的分号除外）
        if (ch === ";") {
            out += ";";
            // 简单判断是否在 for 循环括号内：向前查找最近的未闭合 (
            if (!isInsideForLoop(out, indent)) {
                newline();
            } else {
                out += " ";
            }
            i++;
            lastChar = ";";
            continue;
        }
        // 换行符：压缩代码里一般没有，有的话当作换行
        if (ch === "\n" || ch === "\r") {
            if (!lineStart) newline();
            i++;
            continue;
        }
        // 空白：压缩代码中只保留必要的
        if (/\s/.test(ch)) {
            // 保留关键字之间的空格（如 return 后）
            if (lastChar && /[a-zA-Z0-9_$]/.test(lastChar) && next && /[a-zA-Z0-9_$]/.test(next)) {
                if (lineStart) {
                    out += pad();
                    lineStart = false;
                }
                out += " ";
            }
            i++;
            continue;
        }
        // 普通字符
        if (lineStart) {
            out += pad();
            lineStart = false;
        }
        out += ch;
        lastChar = ch;
        i++;
    }
    // 清理末尾多余空行
    return out.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

/**
 * 粗略判断当前分号是否在 for 循环括号内
 * 通过检查最后几行是否包含 `for(`
 */
function isInsideForLoop(out: string, _indent: number): boolean {
    // 查找最后一个未闭合的左括号
    let parenDepth = 0;
    for (let i = out.length - 1; i >= 0; i--) {
        if (out[i] === ")") parenDepth++;
        else if (out[i] === "(") {
            if (parenDepth === 0) {
                // 找到未闭合的 (，检查前面是否是 for
                let j = i - 1;
                while (j >= 0 && /\s/.test(out[j])) j--;
                return out.substring(Math.max(0, j - 2), j + 1) === "for";
            }
            parenDepth--;
        }
    }
    return false;
}

// ─── 压缩实现 ───

/**
 * 压缩：移除多余空白，保留字符串和注释
 */
function doCompress(src: string): string {
    const len = src.length;
    let out = "";
    let i = 0;

    while (i < len) {
        const ch = src[i];
        const next = src[i + 1];

        // 字符串：原样保留
        if (ch === '"' || ch === "'" || ch === "`") {
            const ctx = {out, i, src, len};
            scanString(ctx);
            out = ctx.out;
            i = ctx.i;
            continue;
        }
        // 单行注释：保留内容，去行首缩进
        if (ch === "/" && next === "/") {
            const ctx = {out, i, src, len};
            const comment = scanLineComment(ctx);
            i = ctx.i;
            out += comment.trimStart();
            continue;
        }
        // 多行注释：保留，内部空白压成单空格
        if (ch === "/" && next === "*") {
            const ctx = {out, i, src, len};
            const comment = scanBlockComment(ctx);
            i = ctx.i;
            // 把注释内的换行压成单空格
            out += comment.replace(/\s+/g, " ");
            continue;
        }
        // 换行：压成单空格
        if (ch === "\n" || ch === "\r") {
            if (out && !/\s$/.test(out)) {
                out += " ";
            }
            i++;
            continue;
        }
        // 连续空白：压成单空格
        if (/\s/.test(ch)) {
            if (out && !/\s$/.test(out)) {
                out += " ";
            }
            i++;
            continue;
        }
        // 普通字符
        out += ch;
        i++;
    }
    // 清理符号前后的多余空格
    return out
        .replace(/\s*([;,\(\)\[\]{}])\s*/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
}
