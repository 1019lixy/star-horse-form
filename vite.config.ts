import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import progress from 'vite-plugin-progress'
import vueJsx from "@vitejs/plugin-vue-jsx"
import inject from "@rollup/plugin-inject"
import topLevelAwait from 'vite-plugin-top-level-await';
import {resolve} from "path";
import {createSvgIconsPlugin} from 'vite-plugin-svg-icons'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import {viteCommonjs} from '@originjs/vite-plugin-commonjs'

const codeHost:string = "http://192.168.20.165:8888/"
// const codeHost:string = "http://localhost:8888/"
const systemHost:string = "http://localhost:8749/"
// const systemHost:string = "http://192.168.20.204:8749/"
const workflowHost:string = "http://localhost:8899/"
const continusHost:string = "http://localhost:8859/"
// const dbSearchHost:string = "http://192.168.20.165:7759/"
const dbSearchHost:string = "http://localhost:7759/"
const userDbHost:string = "http://localhost:7758/"
// const userDbHost:string = "http://192.168.20.204:7758/"
// https://vitejs.dev/config/
export default defineConfig((mode, command) => {
    const optimizeDepsElementPlusIncludes = [
        "element-plus/es", 'vue',
        'vue-router',
        'vue3-guides',
        'vue3-infinite-viewer',
        'smooth-signature',
        '@vueuse/core',
        'jsoneditor',
        '@fullcalendar/vue3',
        '@fullcalendar/daygrid',
        '@fullcalendar/timegrid',
        '@fullcalendar/multimonth',
        '@fullccalendar/interaction',
        '@fullcalendar/core/locales/zh-cn',
        '@fullcalendar/list',
        '@fullcalendar/interaction',
        'axios',
        'qs',
        'preview-image-js',
        'bpmn-js/lib/Modeler',
        'bpmn-js-token-simulation',
        'bpmn-js-bpmnlint',
        'diagram-js-minimap',
        'html2canvas',
        'echarts',
        'codemirror',
        '@codemirror/view',
        '@codemirror/state',
        '@codemirror/history',
        '@codemirror/commands',
        '@codemirror/autocomplete',
        '@codemirror/lang-python',
        '@codemirror/lang-javascript',
        '@codemirror/lang-java',
        '@codemirror/lang-json',
        '@codemirror/lang-yaml',
        '@codemirror/lang-css',
        '@codemirror/lang-vue',
        '@codemirror/lang-html',
        '@codemirror/lang-cpp',
        '@codemirror/lang-xml',
        '@codemirror/lang-markdown',
        '@codemirror/lang-go',
        '@codemirror/lang-sql',
        'thememirror',
        'sortablejs',
        'jsencrypt',
        'uuid',
        'jquery',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue',
        '@replit/codemirror-minimap',
        'element-plus/dist/locale/zh-cn.mjs',
        'element-plus/dist/locale/en.mjs',
        'element-plus/es/components/*/style/index',
        '@element-plus/icons-vue',
        'pinia',
        'axios',
        'vue-router',
        '@vueuse/core',
        'flv.js',
    ]
    // fs.readdirSync("node_modules/element-plus/es/components").map((dirname) => {
    //     fs.access(
    //         `node_modules/element-plus/es/components/${dirname}/style/css.mjs`,
    //         (err) => {
    //             if (!err) {
    //                 optimizeDepsElementPlusIncludes.push(
    //                     `element-plus/es/components/${dirname}/style/css`
    //                 )
    //             }
    //         }
    //     )
    // })
    return {
        base: "/",
        server: {
            port: 8880,
            host: true,
            open: true,
            hmr: true,
            proxy: {
                "/system-config": {
                    target: systemHost,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/system-config/, '/system-config-dev'),
                    ws: true
                },
                "/code-generator": {
                    target: codeHost,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/code-generator/, '/code-generator-dev'),
                    ws: true
                },
                "/flow-engine": {
                    target: workflowHost,
                    changeOrigin: true,
                    ws: true
                },
                "/devops-continus": {
                    target: continusHost,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/devops-continus/, '/devops-continus-dev'),
                    ws: true
                },
                "/dbsearch-manage": {
                    target: dbSearchHost,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/dbsearch-manage/, '/dbsearch-manage-dev'),
                    ws: true
                },

                "/userdb-manage": {
                    target: userDbHost,
                    changeOrigin: true,
                    rewrite: (path: string) => path.replace(/^\/userdb-manage/, '/userdb-manage-dev'),
                    ws: true
                },
            }
        },
        optimizeDeps: {
            include: optimizeDepsElementPlusIncludes
            // exclude:[]
        },
        plugins: [
            vue({
                script: {
                    // 开启 defineModel
                    defineModel: true
                }
            }),
            AutoImport({
                imports: ['vue'],
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                dirs: ["src/components", "src/views"],
                // 这里就是相关ui库的解析工具, 里面的选项有是否使用自动导入样式 如果需要通过 var 变量改变主题 需要注意一下
                resolvers: [ElementPlusResolver(
                    {importStyle: 'sass',}
                )]
            }),
            progress(),
            topLevelAwait(),
            viteCommonjs(),
            vueJsx({}),
            inject({
                $: "jquery", // 这里会自动载入 node_modules 中的 jquery
                jQuery: "jquery",
                "windows.jQuery": "jquery",
                "windows.$": "jquery",
            }),
            createSvgIconsPlugin({
                iconDirs: [resolve(process.cwd(), 'src/icons'),resolve(process.cwd(), 'src/assets/icons/svg')],
                symbolId: 'icon-[dir]-[name]',
            }),
            /* eslintPlugin({
                 include: ["src/!**!/!*.js", "src/!**!/!*.vue", "src/!**!/!*.ts", "src/!**!/!*.tsx"],
                 exclude: ["node_modules/!**", "dist/!**","jquery.min.js"],
                 fix: true,
                 cache: false
             }),*/
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
        ],
        css: {
            //解决 Deprecation Warning: The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0.
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler', // or 'modern'
                },
            },
        },
        /*  optimizeDeps: {
              include: [
                  `monaco-editor/esm/vs/language/json/json.worker`,
                  `monaco-editor/esm/vs/language/css/css.worker`,
                  `monaco-editor/esm/vs/language/html/html.worker`,
                  `monaco-editor/esm/vs/language/typescript/ts.worker`,
                  `monaco-editor/esm/vs/editor/editor.worker`
              ],
          },*/
        resolve: {
            alias: {
                "@": resolve(__dirname, "./src")
            },

            extensions: ['.js', '.vue', '.json', '.ts', ".jsx"]
        },
        /*   css: {
               preprocessorOptions: {
                   scss: {
                       additionalData: `@use "@/assets/css/element/index.scss" as *;`,
                   },
               },
           },*/
        build: {
            rollupOptions: {
                input: {
                    main: resolve(__dirname, "index.html")
                }
            },
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                }
            },
            //浏览器兼容性  "esnext"|"modules"
            target: "modules",
            //指定输出路径
            outDir: "dist",
            //生成静态资源的存放路径
            assetsDir: "assets",
            //小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求。设置为 0 可以完全禁用此项
            assetsInlineLimit: 4096,
            //启用/禁用 CSS 代码拆分
            cssCodeSplit: true,
            //构建后是否生成 source map 文件
            sourcemap: false,
            //自定义底层的 Rollup 打包配置
            //@rollup/plugin-commonjs 插件的选项
            commonjsOptions: {},
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
            emptyOutDir: true,
            //chunk 大小警告的限制
            chunkSizeWarningLimit: 500
        }
    };
})
