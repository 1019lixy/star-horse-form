import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { dirname, join, resolve } from "path";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import AutoImport from "unplugin-auto-import/vite";
import tailwindcss from "@tailwindcss/vite";
import vueDevTools from "vite-plugin-vue-devtools";
//生产types文件插件
import dts from "vite-plugin-dts";
import fs from "fs";
import https from "https";
import { execSync } from "child_process"; // 新增引入
// https://vitejs.dev/config/
const systemHost: string = "http://localhost:8749/";
const userDbHost: string = "http://localhost:7758/";
const wbrtcHost: string = "https://192.168.120.7:8443/";
const gatewayHost: string = "http://localhost:7780/";
const isGateway: boolean = true;
const env: string = "-dev";
const rewrite = (path: string, name: string) => {
  if (isGateway) {
    return path.replace(new RegExp(`^\/${name}`), `/${name}${env}/${name}`);
  }
  return path;
};
// 证书路径（用之前生成的证书，或先执行 mkcert 生成）
const certPath = resolve(__dirname, "./cert");
const httpsOptions = {
  key: fs.readFileSync(join(certPath, "key.pem")),
  cert: fs.readFileSync(join(certPath, "cert.pem")),
  // 关键：指定兼容的 TLS 版本和加密套件
  minVersion: "TLSv1.2", // 最低支持 TLS 1.2（主流浏览器都支持）
  maxVersion: "TLSv1.3", // 最高支持 TLS 1.3
  ciphers: [
    "TLS_AES_128_GCM_SHA256",
    "TLS_AES_256_GCM_SHA384",
    "TLS_CHACHA20_POLY1305_SHA256",
    "ECDHE-RSA-AES128-GCM-SHA256",
    "ECDHE-RSA-AES256-GCM-SHA384",
  ].join(":"), // 主流兼容的加密套件
  honorCipherOrder: true,
};

/**
 * 此配置文件，非必需不要随便做修改，特别是打包相关的参数
 */
export default defineConfig((mode) => {
  let optimizeDepsList: string[] = ["vue", "vue-router", "pinia", "axios"];
  return {
    base: "/",
    define: {
      global: "globalThis",
    },
    server: {
      // https: httpsOptions,
      // allowedHosts: true,
      // strictPort: true,
      // http2: false,
      host: "0.0.0.0",
      port: 9990,
      http: true,
      open: true,
      hmr: true,
      proxy: {
        "/api": {
          target: wbrtcHost,
          changeOrigin: true,
          secure: false,
          // rewrite: (path: string) =>
          //   path.replace(/^\/system-config/, "/system-config-dev"),
          ws: true,
          agent: new https.Agent({
            rejectUnauthorized: false, // 开发环境忽略自签名证书错误
            minVersion: "TLSv1.2",
          }),
        },
        "/system-config": {
          target:isGateway?gatewayHost: systemHost,
          changeOrigin: true,
          rewrite: (path: string) =>rewrite(path,"system-config"),
          ws: true,
        },

        "/userdb-manage": {
          target: isGateway?gatewayHost: userDbHost,
          changeOrigin: true,
          rewrite: (path: string) =>rewrite(path,"userdb-manage"),
          ws: true,
        },
      },
    },
    optimizeDeps: {
      // force: true,
      include: optimizeDepsList,
    },
    plugins: [
      // vueDevTools(),
      tailwindcss(),
      vue({
        script: {
          // 开启 defineModel
          defineModel: true,
        },
      }),

      dts({
        entryRoot: "./src",
        outDir: "dist/types",
        insertTypesEntry: true,
        rollupTypes: false,
        tsconfigPath: "./tsconfig.build.json",
        exclude: ["**/*.svg", "**/sample/**", "**/views/**"],
        // 显式配置别名，确保 .d.ts 中的 @/ 被正确替换为相对路径
        aliases: {
          "@": resolve(dirname(fileURLToPath(import.meta.url)), "./src"),
        },
        async afterBuild() {
          // vue-tsc 在有类型错误时默认不生成声明文件，需要显式传入 --noEmitOnError false
          console.log("[dts] Running vue-tsc to generate type declarations...");
          try {
            execSync(
              "npx vue-tsc -p tsconfig.build.json --noEmitOnError false",
              { stdio: "pipe", cwd: process.cwd() }
            );
            console.log("[dts] Type declarations generated successfully.");
          } catch {
            console.log("[dts] Type declarations generated (with type warnings).");
          }

          // 后备修复：如果 aliases 选项未完全生效，手动替换 @/ 为相对路径
          console.log("[dts] Fixing path aliases in declaration files...");
          const fs = await import("fs");
          const path = await import("path");
          const typesDir = resolve(__dirname, "dist/types");

          function fixPathsInFile(filePath: string) {
            let content = fs.readFileSync(filePath, "utf-8");
            if (!content.includes("@/")) return;

            // 计算从当前文件到 types 根目录的相对路径
            const relToRoot = path.relative(path.dirname(filePath), typesDir).replace(/\\/g, "/");
            const prefix = relToRoot ? relToRoot + "/" : "./";

            // 替换 "@/xxx" 为 "./xxx" 或 "../xxx"
            content = content.replace(/"@\//g, `"${prefix}`);
            content = content.replace(/'@\//g, `'${prefix}`);

            fs.writeFileSync(filePath, content, "utf-8");
          }

          function walkDir(dir: string) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              if (entry.isDirectory()) {
                walkDir(fullPath);
              } else if (entry.name.endsWith(".d.ts")) {
                fixPathsInFile(fullPath);
              }
            }
          }

          walkDir(typesDir);
          console.log("[dts] Path aliases fixed successfully.");
        },
      }),
      AutoImport({
        imports: [
          "vue",
          {
            "element-plus/es/locale/lang/zh-cn": [
              ["default", "zhCn"], // 别名导入中文包
            ],
          },
        ],
        vueTemplate: true,
        dts: "./auto-imports.d.ts",
        eslintrc: {
          enabled: true,
        },
        resolvers: [
          ElementPlusResolver({
            importStyle: "sass",
          }),
        ],
      }),
      Components({
        dirs: ["src/components", "src/views"],
        // 这里就是相关ui库的解析工具, 里面的选项有是否使用自动导入样式 如果需要通过 var 变量改变主题 需要注意一下
        resolvers: [ElementPlusResolver({ importStyle: "sass" })],
        dts: "./components.d.ts",
      }),
      // viteCommonjs(),
      // 删除inject插件，避免ESM和CommonJS混合导致的import require$$0问题
      // 如果确实需要jQuery，应通过正常的import语句导入
    ],
    css: {
      //解决 Deprecation Warning: The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0.
      preprocessorOptions: {
        scss: {
          api: "modern-compiler", // or 'modern'
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(dirname(fileURLToPath(import.meta.url)), "./src"),
        jquery: fileURLToPath(new URL("./src/jquery-shim.js", import.meta.url)),
      },
      extensions: [".js", ".vue", ".json", ".ts", ".jsx"],
    },

    cacheDir: "node_modules/.vite",
    build: {
      // 保留所有显式导出，避免tree-shaking移除
      rollupOptions: {
        external: [
          "vue",
          "pinia",
          "preview-image-js",
          "axios",
          "flv.js",
          "star-horse-lowcode",
          "vanilla-jsoneditor",
          "vuedraggable-es",
          "sample/**/*",
          // element-plus 及其子路径必须全部外部化，否则 CJS 互操作变量 defaults_default 未定义
          /^element-plus/,
          /^@element-plus/,
        ],
        output: {
          exports: "named",
          assetFileNames: "assets/[name][extname]",
          // 禁用代码分割
          codeSplitting: false,
          // 合并所有chunk到单个文件
          manualChunks: undefined,
          // 保留模块结构，避免扁平化
          // preserveModules: false,
          // 禁用代码分割
          // inlineDynamicImports: true,
            // 合并所有chunk到单个文件
          /* manualChunks: (id) => {
                                  // 按目录拆分：将 src/components 下的组件拆分为单独的 chunk
                                  if (id.includes("src/components/")) {
                                      // 例如：将 src/components/StarHorseFormDesign.vue 拆到 form-design chunk
                                      const match = id.match(/src\/components\/([^/]+)/);
                                      if (match) return `components/${match[1]}`;
                                  }
                                  // 按依赖拆分（如果有内部工具库，可单独拆出）
                                  if (id.includes("src/utils/")) {
                                      return "utils";
                                  }
                                  console.log(id);
                                  // 其他代码合并到 main chunk
                                  return "main";
                              },
                              dir: "dist", // 所有产物放在 dist 目录
                              entryFileNames: "[name].js", // 入口文件命名（如 index.es.js）
                              chunkFileNames: "chunks/[name]-[hash].js", // 拆分的 chunk 存放路径*/
          // 正确处理外部依赖的导入
          globals: {
            vue: "Vue",
            pinia: "Pinia",
            axios: "axios",
            "element-plus": "ElementPlus",
            "@element-plus/icons-vue": "ElementPlusIconsVue",
          },
          // 解决 CJS default import 互操作变量未定义问题
          interop: "auto",
          // 保留外部模块的 import 语句，防止 Terser 优化掉
          externalLiveBindings: true,
        },
      },
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      },
      lib: {
        entry: "src/index.ts", //指定组件编译入口文件
        name: "star-horse-form",
        fileName: (format) => `index.${format}.js`,
        //'cjs', 'umd'
        formats: ["es"],
      }, //库编译模式配置
      // 开启并行压缩
      parallel: true,
      //chunk 大小警告的限制（以 kbs 为单位）
      chunkSizeWarningLimit: 2000,
      //浏览器兼容性  "esnext"|"modules",升级后用modules 报错
      target: "esnext",
      //指定输出路径
      outDir: "dist",
      //生成静态资源的存放路径
      assetsDir: "assets",
      //小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求。设置为 0 可以完全禁用此项
      assetsInlineLimit: 4096,
      //启用/禁用 CSS 代码拆分
      cssCodeSplit: true,
      //构建后是否生成 source map 文件
      sourcemap: mode.mode === "development",
      //自定义底层的 Rollup 打包配置
      //@rollup/plugin-commonjs 插件的选项
      commonjsOptions: {},
      //构建的库
      //当设置为 true，构建后将会生成 manifest.json 文件
      manifest: false,
      // 设置为 false 可以禁用最小化混淆，
      // 或是用来指定使用哪种混淆器
      // boolean | 'terser' | 'esbuild'
      minify: "terser", //terser 构建后文件体积更小
      //传递给 Terser 的更多 minify 选项。
      //设置为 false 来禁用将构建后的文件写入磁盘
      write: true,
      //默认情况下，若 outDir 在 root 目录下，则 Vite 会在构建时清空该目录。
      emptyOutDir: true,
    },
  };
});
