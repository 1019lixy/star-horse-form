// vite.config.ts
import { defineConfig } from "file:///D:/webstromworkspace/shdevopsui/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/webstromworkspace/shdevopsui/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import progress from "file:///D:/webstromworkspace/shdevopsui/node_modules/vite-plugin-progress/dist/index.mjs";
import vueJsx from "file:///D:/webstromworkspace/shdevopsui/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import inject from "file:///D:/webstromworkspace/shdevopsui/node_modules/@rollup/plugin-inject/dist/es/index.js";
import topLevelAwait from "file:///D:/webstromworkspace/shdevopsui/node_modules/vite-plugin-top-level-await/exports/import.mjs";
import { resolve } from "path";
import { createSvgIconsPlugin } from "file:///D:/webstromworkspace/shdevopsui/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import Components from "file:///D:/webstromworkspace/shdevopsui/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///D:/webstromworkspace/shdevopsui/node_modules/unplugin-vue-components/dist/resolvers.js";
import AutoImport from "file:///D:/webstromworkspace/shdevopsui/node_modules/unplugin-auto-import/dist/vite.js";
import { viteCommonjs } from "file:///D:/webstromworkspace/shdevopsui/node_modules/@originjs/vite-plugin-commonjs/lib/index.js";
import vueDevTools from "file:///D:/webstromworkspace/shdevopsui/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
var __vite_injected_original_dirname = "D:\\webstromworkspace\\shdevopsui";
var codeHost = "http://192.168.20.165:8888/";
var systemHost = "http://localhost:8749/";
var workflowHost = "http://localhost:8199/";
var continusHost = "http://localhost:8859/";
var dbSearchHost = "http://localhost:7759/";
var userDbHost = "http://localhost:7758/";
var vite_config_default = defineConfig((mode, command) => {
  const optimizeDepsElementPlusIncludes = [
    "element-plus/es",
    "vue",
    "vue-router",
    "vue3-guides",
    "vue3-infinite-viewer",
    "vue3-moveable",
    "smooth-signature",
    "jsoneditor",
    "@vueuse/core",
    "jsoneditor",
    "preview-image-js/icon.js",
    "@fullcalendar/vue3",
    "@fullcalendar/daygrid",
    "@fullcalendar/timegrid",
    "@fullcalendar/multimonth",
    "@fullccalendar/interaction",
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
    "codemirror",
    "@codemirror/view",
    "@codemirror/state",
    "@codemirror/history",
    "@codemirror/commands",
    "@codemirror/autocomplete",
    "@codemirror/lang-python",
    "@codemirror/lang-javascript",
    "@codemirror/lang-java",
    "@codemirror/lang-json",
    "@codemirror/lang-yaml",
    "@codemirror/lang-enums",
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
    "@wangeditor/editor",
    "@wangeditor/editor-for-vue",
    "@replit/codemirror-minimap",
    "element-plus/dist/locale/zh-cn.mjs",
    "element-plus/dist/locale/en.mjs",
    "element-plus/es/components/*/style/index",
    "@element-plus/icons-vue",
    "pinia",
    "axios",
    "vue-router",
    "@vueuse/core",
    "flv.js"
  ];
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
          rewrite: (path) => path.replace(/^\/system-config/, "/system-config-dev"),
          ws: true
        },
        "/code-generator": {
          target: codeHost,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/code-generator/, "/code-generator-dev"),
          ws: true
        },
        "/flow-engine": {
          target: workflowHost,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/flow-engine/, "/flow-engine-dev"),
          ws: true
        },
        "/devops-continus": {
          target: continusHost,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/devops-continus/, "/devops-continus-dev"),
          ws: true
        },
        "/dbsearch-manage": {
          target: dbSearchHost,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dbsearch-manage/, "/dbsearch-manage-dev"),
          ws: true
        },
        "/userdb-manage": {
          target: userDbHost,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/userdb-manage/, "/userdb-manage-dev"),
          ws: true
        }
      }
    },
    optimizeDeps: {
      include: optimizeDepsElementPlusIncludes
      // exclude:[]
    },
    plugins: [
      vueDevTools(),
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
        resolvers: [ElementPlusResolver(
          { importStyle: "sass" }
        )]
      }),
      progress(),
      topLevelAwait(),
      viteCommonjs(),
      vueJsx({}),
      inject({
        $: "jquery",
        // 这里会自动载入 node_modules 中的 jquery
        jQuery: "jquery",
        "windows.jQuery": "jquery",
        "windows.$": "jquery"
      }),
      createSvgIconsPlugin({
        iconDirs: [resolve(process.cwd(), "src/icons"), resolve(process.cwd(), "src/assets/icons/svg")],
        symbolId: "icon-[dir]-[name]"
      })
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
          api: "modern-compiler"
          // or 'modern'
        }
      }
    },
    /*  optimizeDeps: {
          include: [
              `monaco-editor/esm/vs/language/json/json.worker`,
              `monaco-editor/esm/vs/language/enums/enums.worker`,
              `monaco-editor/esm/vs/language/html/html.worker`,
              `monaco-editor/esm/vs/language/typescript/ts.worker`,
              `monaco-editor/esm/vs/editor/editor.worker`
          ],
      },*/
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "./src")
      },
      extensions: [".js", ".vue", ".json", ".ts", ".jsx"]
    },
    /*   enums: {
           preprocessorOptions: {
               scss: {
                   additionalData: `@use "@/assets/enums/element/index.scss" as *;`,
               },
           },
       },*/
    build: {
      rollupOptions: {
        input: {
          main: resolve(__vite_injected_original_dirname, "index.html")
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
      minify: "terser",
      //terser 构建后文件体积更小
      //传递给 Terser 的更多 minify 选项。
      //设置为 false 来禁用将构建后的文件写入磁盘
      write: true,
      //默认情况下，若 outDir 在 root 目录下，则 Vite 会在构建时清空该目录。
      emptyOutDir: true,
      //chunk 大小警告的限制
      chunkSizeWarningLimit: 500
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3ZWJzdHJvbXdvcmtzcGFjZVxcXFxzaGRldm9wc3VpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3ZWJzdHJvbXdvcmtzcGFjZVxcXFxzaGRldm9wc3VpXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93ZWJzdHJvbXdvcmtzcGFjZS9zaGRldm9wc3VpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHtkZWZpbmVDb25maWd9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgcHJvZ3Jlc3MgZnJvbSAndml0ZS1wbHVnaW4tcHJvZ3Jlc3MnXHJcbmltcG9ydCB2dWVKc3ggZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIlxyXG5pbXBvcnQgaW5qZWN0IGZyb20gXCJAcm9sbHVwL3BsdWdpbi1pbmplY3RcIlxyXG5pbXBvcnQgdG9wTGV2ZWxBd2FpdCBmcm9tICd2aXRlLXBsdWdpbi10b3AtbGV2ZWwtYXdhaXQnO1xyXG5pbXBvcnQge3Jlc29sdmV9IGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7Y3JlYXRlU3ZnSWNvbnNQbHVnaW59IGZyb20gJ3ZpdGUtcGx1Z2luLXN2Zy1pY29ucydcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcclxuaW1wb3J0IHtFbGVtZW50UGx1c1Jlc29sdmVyfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmltcG9ydCB7dml0ZUNvbW1vbmpzfSBmcm9tICdAb3JpZ2luanMvdml0ZS1wbHVnaW4tY29tbW9uanMnXHJcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnXHJcbmNvbnN0IGNvZGVIb3N0OiBzdHJpbmcgPSBcImh0dHA6Ly8xOTIuMTY4LjIwLjE2NTo4ODg4L1wiXHJcbi8vIGNvbnN0IGNvZGVIb3N0OnN0cmluZyA9IFwiaHR0cDovL2xvY2FsaG9zdDo4ODg4L1wiXHJcbmNvbnN0IHN5c3RlbUhvc3Q6IHN0cmluZyA9IFwiaHR0cDovL2xvY2FsaG9zdDo4NzQ5L1wiXHJcbi8vIGNvbnN0IHN5c3RlbUhvc3Q6c3RyaW5nID0gXCJodHRwOi8vMTkyLjE2OC4yMC4yMDQ6ODc0OS9cIlxyXG5jb25zdCB3b3JrZmxvd0hvc3Q6IHN0cmluZyA9IFwiaHR0cDovL2xvY2FsaG9zdDo4MTk5L1wiXHJcbmNvbnN0IGNvbnRpbnVzSG9zdDogc3RyaW5nID0gXCJodHRwOi8vbG9jYWxob3N0Ojg4NTkvXCJcclxuLy8gY29uc3QgZGJTZWFyY2hIb3N0OnN0cmluZyA9IFwiaHR0cDovLzE5Mi4xNjguMjAuMTY1Ojc3NTkvXCJcclxuY29uc3QgZGJTZWFyY2hIb3N0OiBzdHJpbmcgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6Nzc1OS9cIlxyXG5jb25zdCB1c2VyRGJIb3N0OiBzdHJpbmcgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6Nzc1OC9cIlxyXG4vLyBjb25zdCB1c2VyRGJIb3N0OnN0cmluZyA9IFwiaHR0cDovLzE5Mi4xNjguMjAuMjA0Ojc3NTgvXCJcclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKChtb2RlLCBjb21tYW5kKSA9PiB7XHJcbiAgICBjb25zdCBvcHRpbWl6ZURlcHNFbGVtZW50UGx1c0luY2x1ZGVzID0gW1xyXG4gICAgICAgIFwiZWxlbWVudC1wbHVzL2VzXCIsICd2dWUnLFxyXG4gICAgICAgICd2dWUtcm91dGVyJyxcclxuICAgICAgICAndnVlMy1ndWlkZXMnLFxyXG4gICAgICAgICd2dWUzLWluZmluaXRlLXZpZXdlcicsXHJcbiAgICAgICAgJ3Z1ZTMtbW92ZWFibGUnLFxyXG4gICAgICAgICdzbW9vdGgtc2lnbmF0dXJlJyxcclxuICAgICAgICAnanNvbmVkaXRvcicsXHJcbiAgICAgICAgJ0B2dWV1c2UvY29yZScsXHJcbiAgICAgICAgJ2pzb25lZGl0b3InLFxyXG4gICAgICAgICdwcmV2aWV3LWltYWdlLWpzL2ljb24uanMnLFxyXG4gICAgICAgICdAZnVsbGNhbGVuZGFyL3Z1ZTMnLFxyXG4gICAgICAgICdAZnVsbGNhbGVuZGFyL2RheWdyaWQnLFxyXG4gICAgICAgICdAZnVsbGNhbGVuZGFyL3RpbWVncmlkJyxcclxuICAgICAgICAnQGZ1bGxjYWxlbmRhci9tdWx0aW1vbnRoJyxcclxuICAgICAgICAnQGZ1bGxjY2FsZW5kYXIvaW50ZXJhY3Rpb24nLFxyXG4gICAgICAgICdAZnVsbGNhbGVuZGFyL2NvcmUvbG9jYWxlcy96aC1jbicsXHJcbiAgICAgICAgJ0BmdWxsY2FsZW5kYXIvbGlzdCcsXHJcbiAgICAgICAgJ0BmdWxsY2FsZW5kYXIvaW50ZXJhY3Rpb24nLFxyXG4gICAgICAgICdheGlvcycsXHJcbiAgICAgICAgJ3FzJyxcclxuICAgICAgICAnZ3JpZHN0YWNrJyxcclxuICAgICAgICAncHJldmlldy1pbWFnZS1qcycsXHJcbiAgICAgICAgJ2JwbW4tanMvbGliL01vZGVsZXInLFxyXG4gICAgICAgICdicG1uLWpzLXRva2VuLXNpbXVsYXRpb24nLFxyXG4gICAgICAgICdicG1uLWpzLWJwbW5saW50JyxcclxuICAgICAgICAnZGlhZ3JhbS1qcy1taW5pbWFwJyxcclxuICAgICAgICAnaHRtbDJjYW52YXMnLFxyXG4gICAgICAgICdlY2hhcnRzJyxcclxuICAgICAgICAnY29kZW1pcnJvcicsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL3ZpZXcnLFxyXG4gICAgICAgICdAY29kZW1pcnJvci9zdGF0ZScsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2hpc3RvcnknLFxyXG4gICAgICAgICdAY29kZW1pcnJvci9jb21tYW5kcycsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2F1dG9jb21wbGV0ZScsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2xhbmctcHl0aG9uJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1qYXZhc2NyaXB0JyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1qYXZhJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1qc29uJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy15YW1sJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1lbnVtcycsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2xhbmctdnVlJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1odG1sJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1jcHAnLFxyXG4gICAgICAgICdAY29kZW1pcnJvci9sYW5nLXhtbCcsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2xhbmctbWFya2Rvd24nLFxyXG4gICAgICAgICdAY29kZW1pcnJvci9sYW5nLWdvJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1zcWwnLFxyXG4gICAgICAgICd0aGVtZW1pcnJvcicsXHJcbiAgICAgICAgJ3NvcnRhYmxlanMnLFxyXG4gICAgICAgICdqc2VuY3J5cHQnLFxyXG4gICAgICAgICd1dWlkJyxcclxuICAgICAgICAnanF1ZXJ5JyxcclxuICAgICAgICAnQHdhbmdlZGl0b3IvZWRpdG9yJyxcclxuICAgICAgICAnQHdhbmdlZGl0b3IvZWRpdG9yLWZvci12dWUnLFxyXG4gICAgICAgICdAcmVwbGl0L2NvZGVtaXJyb3ItbWluaW1hcCcsXHJcbiAgICAgICAgJ2VsZW1lbnQtcGx1cy9kaXN0L2xvY2FsZS96aC1jbi5tanMnLFxyXG4gICAgICAgICdlbGVtZW50LXBsdXMvZGlzdC9sb2NhbGUvZW4ubWpzJyxcclxuICAgICAgICAnZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHMvKi9zdHlsZS9pbmRleCcsXHJcbiAgICAgICAgJ0BlbGVtZW50LXBsdXMvaWNvbnMtdnVlJyxcclxuICAgICAgICAncGluaWEnLFxyXG4gICAgICAgICdheGlvcycsXHJcbiAgICAgICAgJ3Z1ZS1yb3V0ZXInLFxyXG4gICAgICAgICdAdnVldXNlL2NvcmUnLFxyXG4gICAgICAgICdmbHYuanMnLFxyXG4gICAgXVxyXG4gICAgLy8gZnMucmVhZGRpclN5bmMoXCJub2RlX21vZHVsZXMvZWxlbWVudC1wbHVzL2VzL2NvbXBvbmVudHNcIikubWFwKChkaXJuYW1lKSA9PiB7XHJcbiAgICAvLyAgICAgZnMuYWNjZXNzKFxyXG4gICAgLy8gICAgICAgICBgbm9kZV9tb2R1bGVzL2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzLyR7ZGlybmFtZX0vc3R5bGUvZW51bXMubWpzYCxcclxuICAgIC8vICAgICAgICAgKGVycikgPT4ge1xyXG4gICAgLy8gICAgICAgICAgICAgaWYgKCFlcnIpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICBvcHRpbWl6ZURlcHNFbGVtZW50UGx1c0luY2x1ZGVzLnB1c2goXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGBlbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy8ke2Rpcm5hbWV9L3N0eWxlL2VudW1zYFxyXG4gICAgLy8gICAgICAgICAgICAgICAgIClcclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIClcclxuICAgIC8vIH0pXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGJhc2U6IFwiL1wiLFxyXG4gICAgICAgIHNlcnZlcjoge1xyXG4gICAgICAgICAgICBwb3J0OiA4ODgwLFxyXG4gICAgICAgICAgICBob3N0OiB0cnVlLFxyXG4gICAgICAgICAgICBvcGVuOiB0cnVlLFxyXG4gICAgICAgICAgICBobXI6IHRydWUsXHJcbiAgICAgICAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgICAgICAgICBcIi9zeXN0ZW0tY29uZmlnXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHN5c3RlbUhvc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGgucmVwbGFjZSgvXlxcL3N5c3RlbS1jb25maWcvLCAnL3N5c3RlbS1jb25maWctZGV2JyksXHJcbiAgICAgICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIi9jb2RlLWdlbmVyYXRvclwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBjb2RlSG9zdCxcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvY29kZS1nZW5lcmF0b3IvLCAnL2NvZGUtZ2VuZXJhdG9yLWRldicpLFxyXG4gICAgICAgICAgICAgICAgICAgIHdzOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCIvZmxvdy1lbmdpbmVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogd29ya2Zsb3dIb3N0LFxyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9mbG93LWVuZ2luZS8sICcvZmxvdy1lbmdpbmUtZGV2JyksXHJcbiAgICAgICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIi9kZXZvcHMtY29udGludXNcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogY29udGludXNIb3N0LFxyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9kZXZvcHMtY29udGludXMvLCAnL2Rldm9wcy1jb250aW51cy1kZXYnKSxcclxuICAgICAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiL2Ric2VhcmNoLW1hbmFnZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBkYlNlYXJjaEhvc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGgucmVwbGFjZSgvXlxcL2Ric2VhcmNoLW1hbmFnZS8sICcvZGJzZWFyY2gtbWFuYWdlLWRldicpLFxyXG4gICAgICAgICAgICAgICAgICAgIHdzOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgICAgIFwiL3VzZXJkYi1tYW5hZ2VcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogdXNlckRiSG9zdCxcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvdXNlcmRiLW1hbmFnZS8sICcvdXNlcmRiLW1hbmFnZS1kZXYnKSxcclxuICAgICAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgICAgICAgIGluY2x1ZGU6IG9wdGltaXplRGVwc0VsZW1lbnRQbHVzSW5jbHVkZXNcclxuICAgICAgICAgICAgLy8gZXhjbHVkZTpbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgICAgICB2dWVEZXZUb29scygpLFxyXG4gICAgICAgICAgICB2dWUoe1xyXG4gICAgICAgICAgICAgICAgc2NyaXB0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gXHU1RjAwXHU1NDJGIGRlZmluZU1vZGVsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5lTW9kZWw6IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICAgICAgICAgICAgaW1wb3J0czogWyd2dWUnXSxcclxuICAgICAgICAgICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBDb21wb25lbnRzKHtcclxuICAgICAgICAgICAgICAgIGRpcnM6IFtcInNyYy9jb21wb25lbnRzXCIsIFwic3JjL3ZpZXdzXCJdLFxyXG4gICAgICAgICAgICAgICAgLy8gXHU4RkQ5XHU5MUNDXHU1QzMxXHU2NjJGXHU3NkY4XHU1MTczdWlcdTVFOTNcdTc2ODRcdTg5RTNcdTY3OTBcdTVERTVcdTUxNzcsIFx1OTFDQ1x1OTc2Mlx1NzY4NFx1OTAwOVx1OTg3OVx1NjcwOVx1NjYyRlx1NTQyNlx1NEY3Rlx1NzUyOFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NjgzN1x1NUYwRiBcdTU5ODJcdTY3OUNcdTk3MDBcdTg5ODFcdTkwMUFcdThGQzcgdmFyIFx1NTNEOFx1OTFDRlx1NjUzOVx1NTNEOFx1NEUzQlx1OTg5OCBcdTk3MDBcdTg5ODFcdTZDRThcdTYxMEZcdTRFMDBcdTRFMEJcclxuICAgICAgICAgICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoXHJcbiAgICAgICAgICAgICAgICAgICAge2ltcG9ydFN0eWxlOiAnc2FzcycsfVxyXG4gICAgICAgICAgICAgICAgKV1cclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIHByb2dyZXNzKCksXHJcbiAgICAgICAgICAgIHRvcExldmVsQXdhaXQoKSxcclxuICAgICAgICAgICAgdml0ZUNvbW1vbmpzKCksXHJcbiAgICAgICAgICAgIHZ1ZUpzeCh7fSksXHJcbiAgICAgICAgICAgIGluamVjdCh7XHJcbiAgICAgICAgICAgICAgICAkOiBcImpxdWVyeVwiLCAvLyBcdThGRDlcdTkxQ0NcdTRGMUFcdTgxRUFcdTUyQThcdThGN0RcdTUxNjUgbm9kZV9tb2R1bGVzIFx1NEUyRFx1NzY4NCBqcXVlcnlcclxuICAgICAgICAgICAgICAgIGpRdWVyeTogXCJqcXVlcnlcIixcclxuICAgICAgICAgICAgICAgIFwid2luZG93cy5qUXVlcnlcIjogXCJqcXVlcnlcIixcclxuICAgICAgICAgICAgICAgIFwid2luZG93cy4kXCI6IFwianF1ZXJ5XCIsXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBjcmVhdGVTdmdJY29uc1BsdWdpbih7XHJcbiAgICAgICAgICAgICAgICBpY29uRGlyczogW3Jlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9pY29ucycpLCByZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvYXNzZXRzL2ljb25zL3N2ZycpXSxcclxuICAgICAgICAgICAgICAgIHN5bWJvbElkOiAnaWNvbi1bZGlyXS1bbmFtZV0nLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgLyogZXNsaW50UGx1Z2luKHtcclxuICAgICAgICAgICAgICAgICBpbmNsdWRlOiBbXCJzcmMvISoqIS8hKi5qc1wiLCBcInNyYy8hKiohLyEqLnZ1ZVwiLCBcInNyYy8hKiohLyEqLnRzXCIsIFwic3JjLyEqKiEvISoudHN4XCJdLFxyXG4gICAgICAgICAgICAgICAgIGV4Y2x1ZGU6IFtcIm5vZGVfbW9kdWxlcy8hKipcIiwgXCJkaXN0LyEqKlwiLFwianF1ZXJ5Lm1pbi5qc1wiXSxcclxuICAgICAgICAgICAgICAgICBmaXg6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgY2FjaGU6IGZhbHNlXHJcbiAgICAgICAgICAgICB9KSwqL1xyXG4gICAgICAgICAgICAvLyBtb25hY29FZGl0b3JQbHVnaW4oeyBsYW5ndWFnZVdvcmtlcnM6IFsnZWRpdG9yV29ya2VyU2VydmljZScsICd0eXBlc2NyaXB0JywgJ2pzb24nLCAnaHRtbCddfSksXHJcbiAgICAgICAgICAgIC8vXHU1RjAwXHU1NDJGZ3ppcCxcdTU0MEVcdTdBRUZuZ2lueCBcdTk3MDBcdTg5ODEgZ3ppcF9zdGF0aWNcdThCQkVcdTdGNkVcdTRFM0FvblxyXG4gICAgICAgICAgICAvKiB2aXRlQ29tcHJlc3Npb24oe1xyXG4gICAgICAgICAgICAgICAgIC8vXHU3NTFGXHU2MjEwXHU1MzhCXHU3RjI5XHU1MzA1Z3pcclxuICAgICAgICAgICAgICAgICB2ZXJib3NlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgIGRpc2FibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgIHRocmVzaG9sZDogMTAyNDAsXHJcbiAgICAgICAgICAgICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXHJcbiAgICAgICAgICAgICAgICAgZGVsZXRlT3JpZ2luRmlsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICBleHQ6ICcuZ3onLFxyXG4gICAgICAgICAgICAgfSksKi9cclxuICAgICAgICBdLFxyXG4gICAgICAgIGNzczoge1xyXG4gICAgICAgICAgICAvL1x1ODlFM1x1NTFCMyBEZXByZWNhdGlvbiBXYXJuaW5nOiBUaGUgbGVnYWN5IEpTIEFQSSBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gRGFydCBTYXNzIDIuMC4wLlxyXG4gICAgICAgICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBzY3NzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJywgLy8gb3IgJ21vZGVybidcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgICAgICAgICAgaW5jbHVkZTogW1xyXG4gICAgICAgICAgICAgICAgICBgbW9uYWNvLWVkaXRvci9lc20vdnMvbGFuZ3VhZ2UvanNvbi9qc29uLndvcmtlcmAsXHJcbiAgICAgICAgICAgICAgICAgIGBtb25hY28tZWRpdG9yL2VzbS92cy9sYW5ndWFnZS9lbnVtcy9lbnVtcy53b3JrZXJgLFxyXG4gICAgICAgICAgICAgICAgICBgbW9uYWNvLWVkaXRvci9lc20vdnMvbGFuZ3VhZ2UvaHRtbC9odG1sLndvcmtlcmAsXHJcbiAgICAgICAgICAgICAgICAgIGBtb25hY28tZWRpdG9yL2VzbS92cy9sYW5ndWFnZS90eXBlc2NyaXB0L3RzLndvcmtlcmAsXHJcbiAgICAgICAgICAgICAgICAgIGBtb25hY28tZWRpdG9yL2VzbS92cy9lZGl0b3IvZWRpdG9yLndvcmtlcmBcclxuICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgfSwqL1xyXG4gICAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgZXh0ZW5zaW9uczogWycuanMnLCAnLnZ1ZScsICcuanNvbicsICcudHMnLCBcIi5qc3hcIl1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qICAgZW51bXM6IHtcclxuICAgICAgICAgICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgICAgc2Nzczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiBgQHVzZSBcIkAvYXNzZXRzL2VudW1zL2VsZW1lbnQvaW5kZXguc2Nzc1wiIGFzICo7YCxcclxuICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgfSwqL1xyXG4gICAgICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGlucHV0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFpbjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiaW5kZXguaHRtbFwiKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBjb21wcmVzczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTdDXHU1QkI5XHU2MDI3ICBcImVzbmV4dFwifFwibW9kdWxlc1wiXHJcbiAgICAgICAgICAgIHRhcmdldDogXCJtb2R1bGVzXCIsXHJcbiAgICAgICAgICAgIC8vXHU2MzA3XHU1QjlBXHU4RjkzXHU1MUZBXHU4REVGXHU1Rjg0XHJcbiAgICAgICAgICAgIG91dERpcjogXCJkaXN0XCIsXHJcbiAgICAgICAgICAgIC8vXHU3NTFGXHU2MjEwXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU3Njg0XHU1QjU4XHU2NTNFXHU4REVGXHU1Rjg0XHJcbiAgICAgICAgICAgIGFzc2V0c0RpcjogXCJhc3NldHNcIixcclxuICAgICAgICAgICAgLy9cdTVDMEZcdTRFOEVcdTZCNjRcdTk2MDhcdTUwM0NcdTc2ODRcdTVCRkNcdTUxNjVcdTYyMTZcdTVGMTVcdTc1MjhcdThENDRcdTZFOTBcdTVDMDZcdTUxODVcdTgwNTRcdTRFM0EgYmFzZTY0IFx1N0YxNlx1NzgwMVx1RkYwQ1x1NEVFNVx1OTA3Rlx1NTE0RFx1OTg5RFx1NTkxNlx1NzY4NCBodHRwIFx1OEJGN1x1NkM0Mlx1MzAwMlx1OEJCRVx1N0Y2RVx1NEUzQSAwIFx1NTNFRlx1NEVFNVx1NUI4Q1x1NTE2OFx1Nzk4MVx1NzUyOFx1NkI2NFx1OTg3OVxyXG4gICAgICAgICAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NixcclxuICAgICAgICAgICAgLy9cdTU0MkZcdTc1MjgvXHU3OTgxXHU3NTI4IENTUyBcdTRFRTNcdTc4MDFcdTYyQzZcdTUyMDZcclxuICAgICAgICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxyXG4gICAgICAgICAgICAvL1x1Njc4NFx1NUVGQVx1NTQwRVx1NjYyRlx1NTQyNlx1NzUxRlx1NjIxMCBzb3VyY2UgbWFwIFx1NjU4N1x1NEVGNlxyXG4gICAgICAgICAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAvL1x1ODFFQVx1NUI5QVx1NEU0OVx1NUU5NVx1NUM0Mlx1NzY4NCBSb2xsdXAgXHU2MjUzXHU1MzA1XHU5MTREXHU3RjZFXHJcbiAgICAgICAgICAgIC8vQHJvbGx1cC9wbHVnaW4tY29tbW9uanMgXHU2M0QyXHU0RUY2XHU3Njg0XHU5MDA5XHU5ODc5XHJcbiAgICAgICAgICAgIGNvbW1vbmpzT3B0aW9uczoge30sXHJcbiAgICAgICAgICAgIC8vXHU2Nzg0XHU1RUZBXHU3Njg0XHU1RTkzXHJcbiAgICAgICAgICAgIC8vIFZpdGVcdTk4NzlcdTc2RUUgYnVpbGRcdTYyNTNcdTUzMDVcdTU0MEVcdTZENEZcdTg5QzhcdTU2NjhcdTRFMkRcdTUzRUZcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjhcdTc2ODRcdTY1QjlcdTZDRDUgaHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl81NDg5ODg3OC9hcnRpY2xlL2RldGFpbHMvMTI5NzMwNjI4XHJcbiAgICAgICAgICAgIC8vIGxpYjoge30sXHJcbiAgICAgICAgICAgIC8vXHU1RjUzXHU4QkJFXHU3RjZFXHU0RTNBIHRydWVcdUZGMENcdTY3ODRcdTVFRkFcdTU0MEVcdTVDMDZcdTRGMUFcdTc1MUZcdTYyMTAgbWFuaWZlc3QuanNvbiBcdTY1ODdcdTRFRjZcclxuICAgICAgICAgICAgbWFuaWZlc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAvLyBcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2UgXHU1M0VGXHU0RUU1XHU3OTgxXHU3NTI4XHU2NzAwXHU1QzBGXHU1MzE2XHU2REY3XHU2REM2XHVGRjBDXHJcbiAgICAgICAgICAgIC8vIFx1NjIxNlx1NjYyRlx1NzUyOFx1Njc2NVx1NjMwN1x1NUI5QVx1NEY3Rlx1NzUyOFx1NTRFQVx1NzlDRFx1NkRGN1x1NkRDNlx1NTY2OFxyXG4gICAgICAgICAgICAvLyBib29sZWFuIHwgJ3RlcnNlcicgfCAnZXNidWlsZCdcclxuICAgICAgICAgICAgbWluaWZ5OiBcInRlcnNlclwiLCAvL3RlcnNlciBcdTY3ODRcdTVFRkFcdTU0MEVcdTY1ODdcdTRFRjZcdTRGNTNcdTc5RUZcdTY2RjRcdTVDMEZcclxuICAgICAgICAgICAgLy9cdTRGMjBcdTkwMTJcdTdFRDkgVGVyc2VyIFx1NzY4NFx1NjZGNFx1NTkxQSBtaW5pZnkgXHU5MDA5XHU5ODc5XHUzMDAyXHJcbiAgICAgICAgICAgIC8vXHU4QkJFXHU3RjZFXHU0RTNBIGZhbHNlIFx1Njc2NVx1Nzk4MVx1NzUyOFx1NUMwNlx1Njc4NFx1NUVGQVx1NTQwRVx1NzY4NFx1NjU4N1x1NEVGNlx1NTE5OVx1NTE2NVx1NzhDMVx1NzZEOFxyXG4gICAgICAgICAgICB3cml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgLy9cdTlFRDhcdThCQTRcdTYwQzVcdTUxQjVcdTRFMEJcdUZGMENcdTgyRTUgb3V0RGlyIFx1NTcyOCByb290IFx1NzZFRVx1NUY1NVx1NEUwQlx1RkYwQ1x1NTIxOSBWaXRlIFx1NEYxQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NkUwNVx1N0E3QVx1OEJFNVx1NzZFRVx1NUY1NVx1MzAwMlxyXG4gICAgICAgICAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICAgICAgICAgICAgLy9jaHVuayBcdTU5MjdcdTVDMEZcdThCNjZcdTU0NEFcdTc2ODRcdTk2NTBcdTUyMzZcclxuICAgICAgICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDBcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFSLFNBQVEsb0JBQW1CO0FBQ2hULE9BQU8sU0FBUztBQUNoQixPQUFPLGNBQWM7QUFDckIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sWUFBWTtBQUNuQixPQUFPLG1CQUFtQjtBQUMxQixTQUFRLGVBQWM7QUFDdEIsU0FBUSw0QkFBMkI7QUFDbkMsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUSwyQkFBMEI7QUFDbEMsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUSxvQkFBbUI7QUFDM0IsT0FBTyxpQkFBaUI7QUFaeEIsSUFBTSxtQ0FBbUM7QUFhekMsSUFBTSxXQUFtQjtBQUV6QixJQUFNLGFBQXFCO0FBRTNCLElBQU0sZUFBdUI7QUFDN0IsSUFBTSxlQUF1QjtBQUU3QixJQUFNLGVBQXVCO0FBQzdCLElBQU0sYUFBcUI7QUFHM0IsSUFBTyxzQkFBUSxhQUFhLENBQUMsTUFBTSxZQUFZO0FBQzNDLFFBQU0sa0NBQWtDO0FBQUEsSUFDcEM7QUFBQSxJQUFtQjtBQUFBLElBQ25CO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNB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
