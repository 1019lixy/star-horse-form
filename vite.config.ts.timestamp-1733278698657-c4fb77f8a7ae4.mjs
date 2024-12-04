// vite.config.ts
import { defineConfig } from "file:///E:/lixycode/testcode/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/lixycode/testcode/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import progress from "file:///E:/lixycode/testcode/node_modules/vite-plugin-progress/dist/index.mjs";
import vueJsx from "file:///E:/lixycode/testcode/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import inject from "file:///E:/lixycode/testcode/node_modules/@rollup/plugin-inject/dist/es/index.js";
import topLevelAwait from "file:///E:/lixycode/testcode/node_modules/vite-plugin-top-level-await/exports/import.mjs";
import { resolve } from "path";
import { createSvgIconsPlugin } from "file:///E:/lixycode/testcode/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import Components from "file:///E:/lixycode/testcode/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///E:/lixycode/testcode/node_modules/unplugin-vue-components/dist/resolvers.js";
import AutoImport from "file:///E:/lixycode/testcode/node_modules/unplugin-auto-import/dist/vite.js";
import { viteCommonjs } from "file:///E:/lixycode/testcode/node_modules/@originjs/vite-plugin-commonjs/lib/index.js";
var __vite_injected_original_dirname = "E:\\lixycode\\testcode";
var codeHost = "http://192.168.20.165:8888/";
var systemHost = "http://localhost:8749/";
var workflowHost = "http://localhost:8899/";
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
    "@codemirror/lang-css",
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
              `monaco-editor/esm/vs/language/css/css.worker`,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxsaXh5Y29kZVxcXFx0ZXN0Y29kZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcbGl4eWNvZGVcXFxcdGVzdGNvZGVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L2xpeHljb2RlL3Rlc3Rjb2RlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHtkZWZpbmVDb25maWd9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgcHJvZ3Jlc3MgZnJvbSAndml0ZS1wbHVnaW4tcHJvZ3Jlc3MnXHJcbmltcG9ydCB2dWVKc3ggZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIlxyXG5pbXBvcnQgaW5qZWN0IGZyb20gXCJAcm9sbHVwL3BsdWdpbi1pbmplY3RcIlxyXG5pbXBvcnQgdG9wTGV2ZWxBd2FpdCBmcm9tICd2aXRlLXBsdWdpbi10b3AtbGV2ZWwtYXdhaXQnO1xyXG5pbXBvcnQge3Jlc29sdmV9IGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7Y3JlYXRlU3ZnSWNvbnNQbHVnaW59IGZyb20gJ3ZpdGUtcGx1Z2luLXN2Zy1pY29ucydcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcclxuaW1wb3J0IHtFbGVtZW50UGx1c1Jlc29sdmVyfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmltcG9ydCB7dml0ZUNvbW1vbmpzfSBmcm9tICdAb3JpZ2luanMvdml0ZS1wbHVnaW4tY29tbW9uanMnXHJcblxyXG5jb25zdCBjb2RlSG9zdDogc3RyaW5nID0gXCJodHRwOi8vMTkyLjE2OC4yMC4xNjU6ODg4OC9cIlxyXG4vLyBjb25zdCBjb2RlSG9zdDpzdHJpbmcgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6ODg4OC9cIlxyXG5jb25zdCBzeXN0ZW1Ib3N0OiBzdHJpbmcgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6ODc0OS9cIlxyXG4vLyBjb25zdCBzeXN0ZW1Ib3N0OnN0cmluZyA9IFwiaHR0cDovLzE5Mi4xNjguMjAuMjA0Ojg3NDkvXCJcclxuY29uc3Qgd29ya2Zsb3dIb3N0OiBzdHJpbmcgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6ODg5OS9cIlxyXG5jb25zdCBjb250aW51c0hvc3Q6IHN0cmluZyA9IFwiaHR0cDovL2xvY2FsaG9zdDo4ODU5L1wiXHJcbi8vIGNvbnN0IGRiU2VhcmNoSG9zdDpzdHJpbmcgPSBcImh0dHA6Ly8xOTIuMTY4LjIwLjE2NTo3NzU5L1wiXHJcbmNvbnN0IGRiU2VhcmNoSG9zdDogc3RyaW5nID0gXCJodHRwOi8vbG9jYWxob3N0Ojc3NTkvXCJcclxuY29uc3QgdXNlckRiSG9zdDogc3RyaW5nID0gXCJodHRwOi8vbG9jYWxob3N0Ojc3NTgvXCJcclxuLy8gY29uc3QgdXNlckRiSG9zdDpzdHJpbmcgPSBcImh0dHA6Ly8xOTIuMTY4LjIwLjIwNDo3NzU4L1wiXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygobW9kZSwgY29tbWFuZCkgPT4ge1xyXG4gICAgY29uc3Qgb3B0aW1pemVEZXBzRWxlbWVudFBsdXNJbmNsdWRlcyA9IFtcclxuICAgICAgICBcImVsZW1lbnQtcGx1cy9lc1wiLCAndnVlJyxcclxuICAgICAgICAndnVlLXJvdXRlcicsXHJcbiAgICAgICAgJ3Z1ZTMtZ3VpZGVzJyxcclxuICAgICAgICAndnVlMy1pbmZpbml0ZS12aWV3ZXInLFxyXG4gICAgICAgICd2dWUzLW1vdmVhYmxlJyxcclxuICAgICAgICAnc21vb3RoLXNpZ25hdHVyZScsXHJcbiAgICAgICAgJ0B2dWV1c2UvY29yZScsXHJcbiAgICAgICAgJ2pzb25lZGl0b3InLFxyXG4gICAgICAgICdwcmV2aWV3LWltYWdlLWpzL2ljb24uanMnLFxyXG4gICAgICAgICdAZnVsbGNhbGVuZGFyL3Z1ZTMnLFxyXG4gICAgICAgICdAZnVsbGNhbGVuZGFyL2RheWdyaWQnLFxyXG4gICAgICAgICdAZnVsbGNhbGVuZGFyL3RpbWVncmlkJyxcclxuICAgICAgICAnQGZ1bGxjYWxlbmRhci9tdWx0aW1vbnRoJyxcclxuICAgICAgICAnQGZ1bGxjY2FsZW5kYXIvaW50ZXJhY3Rpb24nLFxyXG4gICAgICAgICdAZnVsbGNhbGVuZGFyL2NvcmUvbG9jYWxlcy96aC1jbicsXHJcbiAgICAgICAgJ0BmdWxsY2FsZW5kYXIvbGlzdCcsXHJcbiAgICAgICAgJ0BmdWxsY2FsZW5kYXIvaW50ZXJhY3Rpb24nLFxyXG4gICAgICAgICdheGlvcycsXHJcbiAgICAgICAgJ3FzJyxcclxuICAgICAgICAnZ3JpZHN0YWNrJyxcclxuICAgICAgICAncHJldmlldy1pbWFnZS1qcycsXHJcbiAgICAgICAgJ2JwbW4tanMvbGliL01vZGVsZXInLFxyXG4gICAgICAgICdicG1uLWpzLXRva2VuLXNpbXVsYXRpb24nLFxyXG4gICAgICAgICdicG1uLWpzLWJwbW5saW50JyxcclxuICAgICAgICAnZGlhZ3JhbS1qcy1taW5pbWFwJyxcclxuICAgICAgICAnaHRtbDJjYW52YXMnLFxyXG4gICAgICAgICdlY2hhcnRzJyxcclxuICAgICAgICAnY29kZW1pcnJvcicsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL3ZpZXcnLFxyXG4gICAgICAgICdAY29kZW1pcnJvci9zdGF0ZScsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2hpc3RvcnknLFxyXG4gICAgICAgICdAY29kZW1pcnJvci9jb21tYW5kcycsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2F1dG9jb21wbGV0ZScsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2xhbmctcHl0aG9uJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1qYXZhc2NyaXB0JyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1qYXZhJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1qc29uJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy15YW1sJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1jc3MnLFxyXG4gICAgICAgICdAY29kZW1pcnJvci9sYW5nLXZ1ZScsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2xhbmctaHRtbCcsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2xhbmctY3BwJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy14bWwnLFxyXG4gICAgICAgICdAY29kZW1pcnJvci9sYW5nLW1hcmtkb3duJyxcclxuICAgICAgICAnQGNvZGVtaXJyb3IvbGFuZy1nbycsXHJcbiAgICAgICAgJ0Bjb2RlbWlycm9yL2xhbmctc3FsJyxcclxuICAgICAgICAndGhlbWVtaXJyb3InLFxyXG4gICAgICAgICdzb3J0YWJsZWpzJyxcclxuICAgICAgICAnanNlbmNyeXB0JyxcclxuICAgICAgICAndXVpZCcsXHJcbiAgICAgICAgJ2pxdWVyeScsXHJcbiAgICAgICAgJ0B3YW5nZWRpdG9yL2VkaXRvcicsXHJcbiAgICAgICAgJ0B3YW5nZWRpdG9yL2VkaXRvci1mb3ItdnVlJyxcclxuICAgICAgICAnQHJlcGxpdC9jb2RlbWlycm9yLW1pbmltYXAnLFxyXG4gICAgICAgICdlbGVtZW50LXBsdXMvZGlzdC9sb2NhbGUvemgtY24ubWpzJyxcclxuICAgICAgICAnZWxlbWVudC1wbHVzL2Rpc3QvbG9jYWxlL2VuLm1qcycsXHJcbiAgICAgICAgJ2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzLyovc3R5bGUvaW5kZXgnLFxyXG4gICAgICAgICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZScsXHJcbiAgICAgICAgJ3BpbmlhJyxcclxuICAgICAgICAnYXhpb3MnLFxyXG4gICAgICAgICd2dWUtcm91dGVyJyxcclxuICAgICAgICAnQHZ1ZXVzZS9jb3JlJyxcclxuICAgICAgICAnZmx2LmpzJyxcclxuICAgIF1cclxuICAgIC8vIGZzLnJlYWRkaXJTeW5jKFwibm9kZV9tb2R1bGVzL2VsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzXCIpLm1hcCgoZGlybmFtZSkgPT4ge1xyXG4gICAgLy8gICAgIGZzLmFjY2VzcyhcclxuICAgIC8vICAgICAgICAgYG5vZGVfbW9kdWxlcy9lbGVtZW50LXBsdXMvZXMvY29tcG9uZW50cy8ke2Rpcm5hbWV9L3N0eWxlL2Nzcy5tanNgLFxyXG4gICAgLy8gICAgICAgICAoZXJyKSA9PiB7XHJcbiAgICAvLyAgICAgICAgICAgICBpZiAoIWVycikge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIG9wdGltaXplRGVwc0VsZW1lbnRQbHVzSW5jbHVkZXMucHVzaChcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgYGVsZW1lbnQtcGx1cy9lcy9jb21wb25lbnRzLyR7ZGlybmFtZX0vc3R5bGUvY3NzYFxyXG4gICAgLy8gICAgICAgICAgICAgICAgIClcclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIClcclxuICAgIC8vIH0pXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGJhc2U6IFwiL1wiLFxyXG4gICAgICAgIHNlcnZlcjoge1xyXG4gICAgICAgICAgICBwb3J0OiA4ODgwLFxyXG4gICAgICAgICAgICBob3N0OiB0cnVlLFxyXG4gICAgICAgICAgICBvcGVuOiB0cnVlLFxyXG4gICAgICAgICAgICBobXI6IHRydWUsXHJcbiAgICAgICAgICAgIHByb3h5OiB7XHJcbiAgICAgICAgICAgICAgICBcIi9zeXN0ZW0tY29uZmlnXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IHN5c3RlbUhvc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGgucmVwbGFjZSgvXlxcL3N5c3RlbS1jb25maWcvLCAnL3N5c3RlbS1jb25maWctZGV2JyksXHJcbiAgICAgICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIi9jb2RlLWdlbmVyYXRvclwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBjb2RlSG9zdCxcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvY29kZS1nZW5lcmF0b3IvLCAnL2NvZGUtZ2VuZXJhdG9yLWRldicpLFxyXG4gICAgICAgICAgICAgICAgICAgIHdzOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCIvZmxvdy1lbmdpbmVcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogd29ya2Zsb3dIb3N0LFxyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiL2Rldm9wcy1jb250aW51c1wiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiBjb250aW51c0hvc3QsXHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHJld3JpdGU6IChwYXRoOiBzdHJpbmcpID0+IHBhdGgucmVwbGFjZSgvXlxcL2Rldm9wcy1jb250aW51cy8sICcvZGV2b3BzLWNvbnRpbnVzLWRldicpLFxyXG4gICAgICAgICAgICAgICAgICAgIHdzOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXCIvZGJzZWFyY2gtbWFuYWdlXCI6IHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGRiU2VhcmNoSG9zdCxcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcmV3cml0ZTogKHBhdGg6IHN0cmluZykgPT4gcGF0aC5yZXBsYWNlKC9eXFwvZGJzZWFyY2gtbWFuYWdlLywgJy9kYnNlYXJjaC1tYW5hZ2UtZGV2JyksXHJcbiAgICAgICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAgICAgXCIvdXNlcmRiLW1hbmFnZVwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB1c2VyRGJIb3N0LFxyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC91c2VyZGItbWFuYWdlLywgJy91c2VyZGItbWFuYWdlLWRldicpLFxyXG4gICAgICAgICAgICAgICAgICAgIHdzOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcHRpbWl6ZURlcHM6IHtcclxuICAgICAgICAgICAgaW5jbHVkZTogb3B0aW1pemVEZXBzRWxlbWVudFBsdXNJbmNsdWRlc1xyXG4gICAgICAgICAgICAvLyBleGNsdWRlOltdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgICAgIHZ1ZSh7XHJcbiAgICAgICAgICAgICAgICBzY3JpcHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBcdTVGMDBcdTU0MkYgZGVmaW5lTW9kZWxcclxuICAgICAgICAgICAgICAgICAgICBkZWZpbmVNb2RlbDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgICAgICAgICAgICBpbXBvcnRzOiBbJ3Z1ZSddLFxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpXSxcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIENvbXBvbmVudHMoe1xyXG4gICAgICAgICAgICAgICAgZGlyczogW1wic3JjL2NvbXBvbmVudHNcIiwgXCJzcmMvdmlld3NcIl0sXHJcbiAgICAgICAgICAgICAgICAvLyBcdThGRDlcdTkxQ0NcdTVDMzFcdTY2MkZcdTc2RjhcdTUxNzN1aVx1NUU5M1x1NzY4NFx1ODlFM1x1Njc5MFx1NURFNVx1NTE3NywgXHU5MUNDXHU5NzYyXHU3Njg0XHU5MDA5XHU5ODc5XHU2NzA5XHU2NjJGXHU1NDI2XHU0RjdGXHU3NTI4XHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU2ODM3XHU1RjBGIFx1NTk4Mlx1Njc5Q1x1OTcwMFx1ODk4MVx1OTAxQVx1OEZDNyB2YXIgXHU1M0Q4XHU5MUNGXHU2NTM5XHU1M0Q4XHU0RTNCXHU5ODk4IFx1OTcwMFx1ODk4MVx1NkNFOFx1NjEwRlx1NEUwMFx1NEUwQlxyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcihcclxuICAgICAgICAgICAgICAgICAgICB7aW1wb3J0U3R5bGU6ICdzYXNzJyx9XHJcbiAgICAgICAgICAgICAgICApXVxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgcHJvZ3Jlc3MoKSxcclxuICAgICAgICAgICAgdG9wTGV2ZWxBd2FpdCgpLFxyXG4gICAgICAgICAgICB2aXRlQ29tbW9uanMoKSxcclxuICAgICAgICAgICAgdnVlSnN4KHt9KSxcclxuICAgICAgICAgICAgaW5qZWN0KHtcclxuICAgICAgICAgICAgICAgICQ6IFwianF1ZXJ5XCIsIC8vIFx1OEZEOVx1OTFDQ1x1NEYxQVx1ODFFQVx1NTJBOFx1OEY3RFx1NTE2NSBub2RlX21vZHVsZXMgXHU0RTJEXHU3Njg0IGpxdWVyeVxyXG4gICAgICAgICAgICAgICAgalF1ZXJ5OiBcImpxdWVyeVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ3aW5kb3dzLmpRdWVyeVwiOiBcImpxdWVyeVwiLFxyXG4gICAgICAgICAgICAgICAgXCJ3aW5kb3dzLiRcIjogXCJqcXVlcnlcIixcclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGNyZWF0ZVN2Z0ljb25zUGx1Z2luKHtcclxuICAgICAgICAgICAgICAgIGljb25EaXJzOiBbcmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2ljb25zJyksIHJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9hc3NldHMvaWNvbnMvc3ZnJyldLFxyXG4gICAgICAgICAgICAgICAgc3ltYm9sSWQ6ICdpY29uLVtkaXJdLVtuYW1lXScsXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAvKiBlc2xpbnRQbHVnaW4oe1xyXG4gICAgICAgICAgICAgICAgIGluY2x1ZGU6IFtcInNyYy8hKiohLyEqLmpzXCIsIFwic3JjLyEqKiEvISoudnVlXCIsIFwic3JjLyEqKiEvISoudHNcIiwgXCJzcmMvISoqIS8hKi50c3hcIl0sXHJcbiAgICAgICAgICAgICAgICAgZXhjbHVkZTogW1wibm9kZV9tb2R1bGVzLyEqKlwiLCBcImRpc3QvISoqXCIsXCJqcXVlcnkubWluLmpzXCJdLFxyXG4gICAgICAgICAgICAgICAgIGZpeDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICBjYWNoZTogZmFsc2VcclxuICAgICAgICAgICAgIH0pLCovXHJcbiAgICAgICAgICAgIC8vIG1vbmFjb0VkaXRvclBsdWdpbih7IGxhbmd1YWdlV29ya2VyczogWydlZGl0b3JXb3JrZXJTZXJ2aWNlJywgJ3R5cGVzY3JpcHQnLCAnanNvbicsICdodG1sJ119KSxcclxuICAgICAgICAgICAgLy9cdTVGMDBcdTU0MkZnemlwLFx1NTQwRVx1N0FFRm5naW54IFx1OTcwMFx1ODk4MSBnemlwX3N0YXRpY1x1OEJCRVx1N0Y2RVx1NEUzQW9uXHJcbiAgICAgICAgICAgIC8qIHZpdGVDb21wcmVzc2lvbih7XHJcbiAgICAgICAgICAgICAgICAgLy9cdTc1MUZcdTYyMTBcdTUzOEJcdTdGMjlcdTUzMDVnelxyXG4gICAgICAgICAgICAgICAgIHZlcmJvc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgZGlzYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgdGhyZXNob2xkOiAxMDI0MCxcclxuICAgICAgICAgICAgICAgICBhbGdvcml0aG06ICdnemlwJyxcclxuICAgICAgICAgICAgICAgICBkZWxldGVPcmlnaW5GaWxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgIGV4dDogJy5neicsXHJcbiAgICAgICAgICAgICB9KSwqL1xyXG4gICAgICAgIF0sXHJcbiAgICAgICAgY3NzOiB7XHJcbiAgICAgICAgICAgIC8vXHU4OUUzXHU1MUIzIERlcHJlY2F0aW9uIFdhcm5pbmc6IFRoZSBsZWdhY3kgSlMgQVBJIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBEYXJ0IFNhc3MgMi4wLjAuXHJcbiAgICAgICAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIHNjc3M6IHtcclxuICAgICAgICAgICAgICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInLCAvLyBvciAnbW9kZXJuJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qICBvcHRpbWl6ZURlcHM6IHtcclxuICAgICAgICAgICAgICBpbmNsdWRlOiBbXHJcbiAgICAgICAgICAgICAgICAgIGBtb25hY28tZWRpdG9yL2VzbS92cy9sYW5ndWFnZS9qc29uL2pzb24ud29ya2VyYCxcclxuICAgICAgICAgICAgICAgICAgYG1vbmFjby1lZGl0b3IvZXNtL3ZzL2xhbmd1YWdlL2Nzcy9jc3Mud29ya2VyYCxcclxuICAgICAgICAgICAgICAgICAgYG1vbmFjby1lZGl0b3IvZXNtL3ZzL2xhbmd1YWdlL2h0bWwvaHRtbC53b3JrZXJgLFxyXG4gICAgICAgICAgICAgICAgICBgbW9uYWNvLWVkaXRvci9lc20vdnMvbGFuZ3VhZ2UvdHlwZXNjcmlwdC90cy53b3JrZXJgLFxyXG4gICAgICAgICAgICAgICAgICBgbW9uYWNvLWVkaXRvci9lc20vdnMvZWRpdG9yL2VkaXRvci53b3JrZXJgXHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgIH0sKi9cclxuICAgICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgICAgICBcIkBcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIilcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGV4dGVuc2lvbnM6IFsnLmpzJywgJy52dWUnLCAnLmpzb24nLCAnLnRzJywgXCIuanN4XCJdXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKiAgIGNzczoge1xyXG4gICAgICAgICAgICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICBzY3NzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpb25hbERhdGE6IGBAdXNlIFwiQC9hc3NldHMvY3NzL2VsZW1lbnQvaW5kZXguc2Nzc1wiIGFzICo7YCxcclxuICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgfSwqL1xyXG4gICAgICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgIGlucHV0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFpbjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiaW5kZXguaHRtbFwiKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBjb21wcmVzczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTdDXHU1QkI5XHU2MDI3ICBcImVzbmV4dFwifFwibW9kdWxlc1wiXHJcbiAgICAgICAgICAgIHRhcmdldDogXCJtb2R1bGVzXCIsXHJcbiAgICAgICAgICAgIC8vXHU2MzA3XHU1QjlBXHU4RjkzXHU1MUZBXHU4REVGXHU1Rjg0XHJcbiAgICAgICAgICAgIG91dERpcjogXCJkaXN0XCIsXHJcbiAgICAgICAgICAgIC8vXHU3NTFGXHU2MjEwXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU3Njg0XHU1QjU4XHU2NTNFXHU4REVGXHU1Rjg0XHJcbiAgICAgICAgICAgIGFzc2V0c0RpcjogXCJhc3NldHNcIixcclxuICAgICAgICAgICAgLy9cdTVDMEZcdTRFOEVcdTZCNjRcdTk2MDhcdTUwM0NcdTc2ODRcdTVCRkNcdTUxNjVcdTYyMTZcdTVGMTVcdTc1MjhcdThENDRcdTZFOTBcdTVDMDZcdTUxODVcdTgwNTRcdTRFM0EgYmFzZTY0IFx1N0YxNlx1NzgwMVx1RkYwQ1x1NEVFNVx1OTA3Rlx1NTE0RFx1OTg5RFx1NTkxNlx1NzY4NCBodHRwIFx1OEJGN1x1NkM0Mlx1MzAwMlx1OEJCRVx1N0Y2RVx1NEUzQSAwIFx1NTNFRlx1NEVFNVx1NUI4Q1x1NTE2OFx1Nzk4MVx1NzUyOFx1NkI2NFx1OTg3OVxyXG4gICAgICAgICAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NixcclxuICAgICAgICAgICAgLy9cdTU0MkZcdTc1MjgvXHU3OTgxXHU3NTI4IENTUyBcdTRFRTNcdTc4MDFcdTYyQzZcdTUyMDZcclxuICAgICAgICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxyXG4gICAgICAgICAgICAvL1x1Njc4NFx1NUVGQVx1NTQwRVx1NjYyRlx1NTQyNlx1NzUxRlx1NjIxMCBzb3VyY2UgbWFwIFx1NjU4N1x1NEVGNlxyXG4gICAgICAgICAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAvL1x1ODFFQVx1NUI5QVx1NEU0OVx1NUU5NVx1NUM0Mlx1NzY4NCBSb2xsdXAgXHU2MjUzXHU1MzA1XHU5MTREXHU3RjZFXHJcbiAgICAgICAgICAgIC8vQHJvbGx1cC9wbHVnaW4tY29tbW9uanMgXHU2M0QyXHU0RUY2XHU3Njg0XHU5MDA5XHU5ODc5XHJcbiAgICAgICAgICAgIGNvbW1vbmpzT3B0aW9uczoge30sXHJcbiAgICAgICAgICAgIC8vXHU2Nzg0XHU1RUZBXHU3Njg0XHU1RTkzXHJcbiAgICAgICAgICAgIC8vIFZpdGVcdTk4NzlcdTc2RUUgYnVpbGRcdTYyNTNcdTUzMDVcdTU0MEVcdTZENEZcdTg5QzhcdTU2NjhcdTRFMkRcdTUzRUZcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjhcdTc2ODRcdTY1QjlcdTZDRDUgaHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl81NDg5ODg3OC9hcnRpY2xlL2RldGFpbHMvMTI5NzMwNjI4XHJcbiAgICAgICAgICAgIC8vIGxpYjoge30sXHJcbiAgICAgICAgICAgIC8vXHU1RjUzXHU4QkJFXHU3RjZFXHU0RTNBIHRydWVcdUZGMENcdTY3ODRcdTVFRkFcdTU0MEVcdTVDMDZcdTRGMUFcdTc1MUZcdTYyMTAgbWFuaWZlc3QuanNvbiBcdTY1ODdcdTRFRjZcclxuICAgICAgICAgICAgbWFuaWZlc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICAvLyBcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2UgXHU1M0VGXHU0RUU1XHU3OTgxXHU3NTI4XHU2NzAwXHU1QzBGXHU1MzE2XHU2REY3XHU2REM2XHVGRjBDXHJcbiAgICAgICAgICAgIC8vIFx1NjIxNlx1NjYyRlx1NzUyOFx1Njc2NVx1NjMwN1x1NUI5QVx1NEY3Rlx1NzUyOFx1NTRFQVx1NzlDRFx1NkRGN1x1NkRDNlx1NTY2OFxyXG4gICAgICAgICAgICAvLyBib29sZWFuIHwgJ3RlcnNlcicgfCAnZXNidWlsZCdcclxuICAgICAgICAgICAgbWluaWZ5OiBcInRlcnNlclwiLCAvL3RlcnNlciBcdTY3ODRcdTVFRkFcdTU0MEVcdTY1ODdcdTRFRjZcdTRGNTNcdTc5RUZcdTY2RjRcdTVDMEZcclxuICAgICAgICAgICAgLy9cdTRGMjBcdTkwMTJcdTdFRDkgVGVyc2VyIFx1NzY4NFx1NjZGNFx1NTkxQSBtaW5pZnkgXHU5MDA5XHU5ODc5XHUzMDAyXHJcbiAgICAgICAgICAgIC8vXHU4QkJFXHU3RjZFXHU0RTNBIGZhbHNlIFx1Njc2NVx1Nzk4MVx1NzUyOFx1NUMwNlx1Njc4NFx1NUVGQVx1NTQwRVx1NzY4NFx1NjU4N1x1NEVGNlx1NTE5OVx1NTE2NVx1NzhDMVx1NzZEOFxyXG4gICAgICAgICAgICB3cml0ZTogdHJ1ZSxcclxuICAgICAgICAgICAgLy9cdTlFRDhcdThCQTRcdTYwQzVcdTUxQjVcdTRFMEJcdUZGMENcdTgyRTUgb3V0RGlyIFx1NTcyOCByb290IFx1NzZFRVx1NUY1NVx1NEUwQlx1RkYwQ1x1NTIxOSBWaXRlIFx1NEYxQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NkUwNVx1N0E3QVx1OEJFNVx1NzZFRVx1NUY1NVx1MzAwMlxyXG4gICAgICAgICAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICAgICAgICAgICAgLy9jaHVuayBcdTU5MjdcdTVDMEZcdThCNjZcdTU0NEFcdTc2ODRcdTk2NTBcdTUyMzZcclxuICAgICAgICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDBcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9QLFNBQVEsb0JBQW1CO0FBQy9RLE9BQU8sU0FBUztBQUNoQixPQUFPLGNBQWM7QUFDckIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sWUFBWTtBQUNuQixPQUFPLG1CQUFtQjtBQUMxQixTQUFRLGVBQWM7QUFDdEIsU0FBUSw0QkFBMkI7QUFDbkMsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUSwyQkFBMEI7QUFDbEMsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUSxvQkFBbUI7QUFYM0IsSUFBTSxtQ0FBbUM7QUFhekMsSUFBTSxXQUFtQjtBQUV6QixJQUFNLGFBQXFCO0FBRTNCLElBQU0sZUFBdUI7QUFDN0IsSUFBTSxlQUF1QjtBQUU3QixJQUFNLGVBQXVCO0FBQzdCLElBQU0sYUFBcUI7QUFHM0IsSUFBTyxzQkFBUSxhQUFhLENBQUMsTUFBTSxZQUFZO0FBQzNDLFFBQU0sa0NBQWtDO0FBQUEsSUFDcEM7QUFBQSxJQUFtQjtBQUFBLElBQ25CO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FB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
