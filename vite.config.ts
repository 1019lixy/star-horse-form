import inject from "@rollup/plugin-inject";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { univerPlugin } from '@univerjs/vite-plugin'
import fs from "fs";
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

import tailwindcss from '@tailwindcss/vite';
import { visualizer } from "rollup-plugin-visualizer";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import progress from "vite-plugin-progress";
import vueDevTools from "vite-plugin-vue-devtools";
//此插件是处理外部依赖 比如cdn引入的js
const codeHost: string = "http://192.168.20.165:8888/";
// const codeHost:string = "http://localhost:8888/"
const systemHost: string = "http://localhost:8749/";
// const systemHost:string = "http://192.168.20.204:8749/"
const workflowHost: string = "http://localhost:8899/";
const continuousHost: string = "http://localhost:8859/";
const userDbHost: string = "http://localhost:7758/";
// const userDbHost:string = "http://192.168.20.204:7758/"
// https://vitejs.dev/config/
/**
 * 此配置文件，非必需不要随便做修改，特别是打包相关的参数
 */
export default defineConfig((mode) => {
    let optimizeDepsList: string[] = [
        'vue',
        'vue-router',
        'pinia',
        'axios'
    ];
    if (mode.mode === "development") {
        //
        optimizeDepsList = [
            "vue",
            "vue-router",
            "vue3-guides",
            "element-plus/es",
            "vue3-infinite-viewer",
            "lodash-es",
            "smooth-signature",
            "@vueuse/core",
            "preview-image-js/icon.js",
            "@fullcalendar/vue3",
            "@fullcalendar/daygrid",
            "@fullcalendar/timegrid",
            "@fullcalendar/multimonth",
            "@fullcalendar/core/locales/zh-cn",
            "@fullcalendar/list",
            "@fullcalendar/interaction",
            "axios",
            "qs",
            "gridstack",
            "preview-image-js",
            "bpmn-js/lib/Modeler",
            "bpmn-js-token-simulation",
            "bpmn-js-bpmnlint",
            "diagram-js-minimap",
            "html2canvas",
            "echarts",
            "pinia-plugin-persistedstate",
            "nprogress",
            "codemirror",
            "@codemirror/view",
            "@codemirror/state",
            "@codemirror/commands",
            "@codemirror/autocomplete",
            "@codemirror/lang-python",
            "@codemirror/lang-javascript",
            "@codemirror/lang-java",
            "@codemirror/lang-json",
            "@codemirror/lang-css",
            "@codemirror/lang-yaml",
            "@codemirror/lang-vue",
            "@codemirror/lang-html",
            "@codemirror/lang-cpp",
            "@codemirror/lang-xml",
            "@codemirror/lang-markdown",
            "@codemirror/lang-go",
            "@codemirror/lang-sql",
            "thememirror",
            "sortablejs",
            "jsencrypt",
            "uuid",
            "jquery",
            "@replit/codemirror-minimap",
            "element-plus/dist/locale/zh-cn.mjs",
            "element-plus/dist/locale/en.mjs",
            "pinia",
            "axios",
            "@vueuse/core",
            "flv.js",
            "@univerjs/presets",
            "@univerjs/presets/preset-docs-core",
            "@univerjs/presets/preset-docs-core/locales/zh-CN",
            "@univerjs/presets/preset-docs-drawing",
            "@univerjs/presets/preset-docs-drawing/locales/zh-CN",
            "@univerjs/presets/preset-docs-hyper-link",
            "@univerjs/presets/preset-docs-hyper-link/locales/zh-CN",
            "@univerjs/presets/preset-sheets-core",
            "@univerjs/presets/preset-sheets-core/locales/zh-CN"
        ];
        fs.readdirSync("node_modules/element-plus/es/components").map(async (dirname) => {
            try {
                fs.accessSync(`node_modules/element-plus/es/components/${dirname}/style/css.mjs`, fs.constants.F_OK);
                optimizeDepsList.push(`element-plus/es/components/${dirname}/style/css`);
            } catch (e) {
                console.log(`1,将强制对${dirname}进行依赖预构建异常`);
            }
            //注意，一定要包含下面这部分
            try {
                fs.accessSync(`node_modules/element-plus/es/components/${dirname}/style/index.mjs`, fs.constants.F_OK);
                optimizeDepsList.push(`element-plus/es/components/${dirname}/style/index`);
            } catch (e) {
                console.log(`2,将强制对${dirname}进行依赖预构建异常`);
            }
        });
    }
    return {
        base: "./",
        server: {
            port: 8880,
            host: true,
            open: true,
            hmr: true,
            proxy: {
                "/system-config": {
                    target: systemHost,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/system-config/, "/system-config-dev"),
                    ws: true
                },
                "/code-generator": {
                    target: codeHost,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/code-generator/, "/code-generator-dev"),
                    ws: true
                },
                "/flow-engine": {
                    target: workflowHost,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/flow-engine/, "/flow-engine-dev"),
                    ws: true
                },
                "/continuous-manage": {
                    target: continuousHost,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/continuous-manage/, "/continuous-manage-dev"),
                    ws: true
                },

                "/userdb-manage": {
                    target: userDbHost,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/userdb-manage/, "/userdb-manage-dev"),
                    ws: true
                }
            }
        },
        optimizeDeps: {
            // force: true,
            include: optimizeDepsList
            // exclude:[]
        },

        plugins: [
            vueDevTools(),
            tailwindcss(),
            univerPlugin(),
            vue({
                script: {
                    // 开启 defineModel
                    defineModel: true
                }
            }),
            AutoImport({
                imports: ["vue"],
                resolvers: [ElementPlusResolver()]
            }),
            Components({
                dirs: ["src/components", "src/views"],
                // 这里就是相关ui库的解析工具, 里面的选项有是否使用自动导入样式 如果需要通过 var 变量改变主题 需要注意一下
                resolvers: [ElementPlusResolver({
                    importStyle: false
                })]
            }),
            progress(),
            // viteCommonjs(),
            vueJsx({}),
            inject({
                $: "jquery", // 这里会自动载入 node_modules 中的 jquery
                jQuery: "jquery",
                "windows.jQuery": "jquery",
                "windows.$": "jquery"
            }),

            // monacoEditorPlugin({ languageWorkers: ['editorWorkerService', 'typescript', 'json', 'html']}),
            //开启gzip,后端nginx 需要 gzip_static设置为on
            /* viteCompression({
                       //生成压缩包gz
                       verbose: true,
                       disable: false,
                       threshold: 10240,
                       algorithm: 'gzip',
                       deleteOriginFile: true,
                       ext: '.gz',
                   }),*/
            // visualizer({
            //     open: false, // 构建完成后自动打开分析页面
            //     gzipSize: true,
            //     brotliSize: true
            // })
        ],
        css: {
            //解决 Deprecation Warning: The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0.
            preprocessorOptions: {
                scss: {
                    api: "modern-compiler" // or 'modern'
                }
            }
        },
        resolve: {
            alias: {
                "@": resolve(dirname(fileURLToPath(import.meta.url)), "./src")
            },
            'element-plus/es': 'element-plus/es',
            'element-plus/lib': 'element-plus/es',
            extensions: [".js", ".vue", ".json", ".ts", ".jsx"]
        },
        cacheDir: "node_modules/.vite",
        build: {
            //  告诉打包工具 "vue-demi" 也是外部依赖项
            rollupOptions: {
                external: [
                    'react',
                    'react-dom',
                    'react/jsx-runtime',
                    'react-dom/client'
                ],
                output: {
                    manualChunks(id: any) {
                        if (id.includes("node_modules")) {
                            //此处不要随修改，否则很可能打包后代码不能正常运行
                            // if (id.includes('element-plus')) return 'element-plus';
                            // if (id.includes('echarts')) return 'echarts';
                            // if (id.includes('bpmn-js')) return 'bpmn-js';

                            // if (id.includes('flv.js')) return 'flv';
                            // if (id.includes('gridstack')) return 'gridstack';
                            // if (id.includes('sortablejs')) return 'sortablejs';
                            // if (id.includes('lodash')) return 'lodash';
                            // return "vendor";
                            return id.toString().split('node_modules/')[1].split('/')[0].toString();
                        }
                    }
                },
                input: {
                    main: resolve(dirname(fileURLToPath(import.meta.url)), "index.html")
                }
            },
            terserOptions: {
                compress: {
                    drop_console: mode.mode === "production",
                    drop_debugger: mode.mode === "production"
                }
            },
            // 开启并行压缩
            parallel: true,
            //chunk 大小警告的限制（以 kbs 为单位）
            chunkSizeWarningLimit: 1000,
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
            commonjsOptions: {
                // 强制包含CodeMirror相关模块
                include: [/node_modules/, /@codemirror/],
                transformMixedEsModules: true
            },
            //构建的库
            // Vite项目 build打包后浏览器中可直接使用的方法 https://blog.csdn.net/weixin_54898878/article/details/129730628
            // lib: {},
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
            emptyOutDir: true
        }
    };
});
