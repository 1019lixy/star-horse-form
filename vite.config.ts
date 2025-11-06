import {fileURLToPath, URL} from "node:url";
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import {dirname, resolve} from "path";
import Components from "unplugin-vue-components/vite";
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";
import AutoImport from "unplugin-auto-import/vite";
import ElementPlus from "unplugin-element-plus/vite";
import tailwindcss from "@tailwindcss/vite";
//生产types文件插件
import dts from "vite-plugin-dts";
// https://vitejs.dev/config/
const systemHost: string = "http://localhost:8749/";
const userDbHost: string = "http://localhost:7758/";
/**
 * 此配置文件，非必需不要随便做修改，特别是打包相关的参数
 */
export default defineConfig((mode) => {
    let optimizeDepsList: string[] = ["vue", "vue-router", "pinia", "axios"];
    return {
        base: "/",
        server: {
            port: 4000,
            host: true,
            open: true,
            hmr: true,
            proxy: {
                "/system-config": {
                    target: systemHost,
                    changeOrigin: true,
                    rewrite: (path: string) =>
                        path.replace(/^\/system-config/, "/system-config-dev"),
                    ws: true,
                },

                "/userdb-manage": {
                    target: userDbHost,
                    changeOrigin: true,
                    rewrite: (path: string) =>
                        path.replace(/^\/userdb-manage/, "/userdb-manage-dev"),
                    ws: true,
                },
            },
        },
        optimizeDeps: {
            // force: true,
            include: optimizeDepsList,
        },
        plugins: [
            tailwindcss(),
            vue({
                script: {
                    // 开启 defineModel
                    defineModel: true,
                },
            }),

            ElementPlus({
                // 自动导入样式（无需手动 import 全量 CSS）
                useSource: true,
            }),
            dts({
                entryRoot: "./src",
                outDir: "dist/types",
                insertTypesEntry: true,
                rollupTypes: true,
                tsconfigPath: "./tsconfig.json",
                exclude: ["**/*.svg", "**/sample/*.vue"],
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
                resolvers: [ElementPlusResolver({importStyle: "sass"})],
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
                "jquery": fileURLToPath(new URL("./src/jquery-shim.js", import.meta.url))
            },
            extensions: [".js", ".vue", ".json", ".ts", ".jsx"],
        },

        cacheDir: "node_modules/.vite",
        build: {
            //  告诉打包工具 "vue-demi" 也是外部依赖项
            rollupOptions: {
                external: ["vue", "pinia",
                    // "element-plus",
                    "md-editor-v3",
                    "quill-image-uploader",
                    "smooth-signature",
                    "qrcode.vue",
                    "smooth-signature",
                    "vanilla-jsoneditor",
                    "vue3-barcode",
                    "vue3-ts-jsoneditor",
                    "@vueup/vue-quill",
                    "jquery",
                    "react-dom",
                    "star-horse-lowcode",
                    "codemirror",
                    "echarts",
                    "react",
                    "@codemirror/*",
                    "@univerjs/*",
                    "sample/**/*",
                ],
                output: {
                    exports: "named",
                    assetFileNames: "assets/[name][extname]",
                    // 保留模块结构，避免扁平化
                    preserveModules: false,
                    // 禁用代码分割
                    inlineDynamicImports: true,
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
                    },
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
