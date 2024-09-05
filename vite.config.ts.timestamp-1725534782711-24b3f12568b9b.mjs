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
var __vite_injected_original_dirname = "D:\\webstromworkspace\\shdevopsui";
var codeHost = "http://192.168.20.165:8888/";
var systemHost = "http://localhost:8749/";
var workflowHost = "http://localhost:8899/";
var continusHost = "http://localhost:8859/";
var dbSearchHost = "http://localhost:7759/";
var userDbHost = "http://localhost:7758/";
var vite_config_default = defineConfig({
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
    include: [
      "vue",
      "vue-router",
      "vue-types",
      "element-plus/es/locale/lang/zh-cn",
      "element-plus/es/locale/lang/en",
      "@iconify/iconify",
      "@vueuse/core",
      "@/components/types",
      "axios",
      "qs",
      "echarts",
      "echarts-wordcloud",
      "qrcode",
      "@wangeditor/editor",
      "@wangeditor/editor-for-vue"
    ]
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
      // 这里就是相关ui库的解析工具, 里面的选项有是否使用自动导入样式 如果需要通过 var 变量改变主题 需要注意一下
      resolvers: [ElementPlusResolver(
        { importStyle: "sass" }
      )]
    }),
    progress(),
    topLevelAwait(),
    vueJsx({}),
    inject({
      $: "jquery",
      // 这里会自动载入 node_modules 中的 jquery
      jQuery: "jquery",
      "windows.jQuery": "jquery",
      "windows.$": "jquery"
    }),
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), "src/icons")],
      symbolId: "icon-[dir]-[name]"
    })
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
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3ZWJzdHJvbXdvcmtzcGFjZVxcXFxzaGRldm9wc3VpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3ZWJzdHJvbXdvcmtzcGFjZVxcXFxzaGRldm9wc3VpXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93ZWJzdHJvbXdvcmtzcGFjZS9zaGRldm9wc3VpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHtkZWZpbmVDb25maWcsIG9wdGltaXplRGVwc30gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBwcm9ncmVzcyBmcm9tICd2aXRlLXBsdWdpbi1wcm9ncmVzcydcclxuaW1wb3J0IHZ1ZUpzeCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlLWpzeFwiXHJcbmltcG9ydCBpbmplY3QgZnJvbSBcIkByb2xsdXAvcGx1Z2luLWluamVjdFwiXHJcbmltcG9ydCB2aXRlQ29tcHJlc3Npb24gZnJvbSAndml0ZS1wbHVnaW4tY29tcHJlc3Npb24nXHJcbmltcG9ydCB0b3BMZXZlbEF3YWl0IGZyb20gJ3ZpdGUtcGx1Z2luLXRvcC1sZXZlbC1hd2FpdCc7XHJcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHtjcmVhdGVTdmdJY29uc1BsdWdpbn0gZnJvbSAndml0ZS1wbHVnaW4tc3ZnLWljb25zJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xyXG5pbXBvcnQge0VsZW1lbnRQbHVzUmVzb2x2ZXJ9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcclxuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcclxuaW1wb3J0IG1vbmFjb0VkaXRvclBsdWdpbiBmcm9tIFwidml0ZS1wbHVnaW4tbW9uYWNvLWVkaXRvclwiO1xyXG5cclxuY29uc3QgY29kZUhvc3QgPSBcImh0dHA6Ly8xOTIuMTY4LjIwLjE2NTo4ODg4L1wiXHJcbmNvbnN0IHN5c3RlbUhvc3QgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6ODc0OS9cIlxyXG4vLyBjb25zdCBzeXN0ZW1Ib3N0ID0gXCJodHRwOi8vMTkyLjE2OC4yMC4yMDQ6ODc0OS9cIlxyXG5jb25zdCB3b3JrZmxvd0hvc3QgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6ODg5OS9cIlxyXG5jb25zdCBjb250aW51c0hvc3QgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6ODg1OS9cIlxyXG4vLyBjb25zdCBkYlNlYXJjaEhvc3QgPSBcImh0dHA6Ly8xOTIuMTY4LjIwLjE2NTo3NzU5L1wiXHJcbmNvbnN0IGRiU2VhcmNoSG9zdCA9IFwiaHR0cDovL2xvY2FsaG9zdDo3NzU5L1wiXHJcbmNvbnN0IHVzZXJEYkhvc3QgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6Nzc1OC9cIlxyXG4vLyBjb25zdCB1c2VyRGJIb3N0ID0gXCJodHRwOi8vMTkyLjE2OC4yMC4yMDQ6Nzc1OC9cIlxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgYmFzZTpcIi9cIixcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICAgIHBvcnQ6IDg4ODAsXHJcbiAgICAgICAgaG9zdDogdHJ1ZSxcclxuICAgICAgICBvcGVuOiB0cnVlLFxyXG4gICAgICAgIGhtcjogdHJ1ZSxcclxuICAgICAgICBwcm94eToge1xyXG5cclxuICAgICAgICAgICAgXCIvc3lzdGVtLWNvbmZpZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHN5c3RlbUhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvc3lzdGVtLWNvbmZpZy8sICcvc3lzdGVtLWNvbmZpZy1kZXYnKSxcclxuICAgICAgICAgICAgICAgIHdzOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiL2NvZGUtZ2VuZXJhdG9yXCI6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogY29kZUhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvY29kZS1nZW5lcmF0b3IvLCAnL2NvZGUtZ2VuZXJhdG9yLWRldicpLFxyXG4gICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCIvZmxvdy1lbmdpbmVcIjoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB3b3JrZmxvd0hvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi9kZXZvcHMtY29udGludXNcIjoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBjb250aW51c0hvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvZGV2b3BzLWNvbnRpbnVzLywgJy9kZXZvcHMtY29udGludXMtZGV2JyksXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi9kYnNlYXJjaC1tYW5hZ2VcIjoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBkYlNlYXJjaEhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvZGJzZWFyY2gtbWFuYWdlLywgJy9kYnNlYXJjaC1tYW5hZ2UtZGV2JyksXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgXCIvdXNlcmRiLW1hbmFnZVwiOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHVzZXJEYkhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvdXNlcmRiLW1hbmFnZS8sICcvdXNlcmRiLW1hbmFnZS1kZXYnKSxcclxuICAgICAgICAgICAgICAgIHdzOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICAgIGluY2x1ZGU6IFtcclxuICAgICAgICAgICAgJ3Z1ZScsXHJcbiAgICAgICAgICAgICd2dWUtcm91dGVyJyxcclxuICAgICAgICAgICAgJ3Z1ZS10eXBlcycsXHJcbiAgICAgICAgICAgICdlbGVtZW50LXBsdXMvZXMvbG9jYWxlL2xhbmcvemgtY24nLFxyXG4gICAgICAgICAgICAnZWxlbWVudC1wbHVzL2VzL2xvY2FsZS9sYW5nL2VuJyxcclxuICAgICAgICAgICAgJ0BpY29uaWZ5L2ljb25pZnknLFxyXG4gICAgICAgICAgICAnQHZ1ZXVzZS9jb3JlJyxcclxuICAgICAgICAgICAgJ0AvY29tcG9uZW50cy90eXBlcycsXHJcbiAgICAgICAgICAgICdheGlvcycsXHJcbiAgICAgICAgICAgICdxcycsXHJcbiAgICAgICAgICAgICdlY2hhcnRzJyxcclxuICAgICAgICAgICAgJ2VjaGFydHMtd29yZGNsb3VkJyxcclxuICAgICAgICAgICAgJ3FyY29kZScsXHJcbiAgICAgICAgICAgICdAd2FuZ2VkaXRvci9lZGl0b3InLFxyXG4gICAgICAgICAgICAnQHdhbmdlZGl0b3IvZWRpdG9yLWZvci12dWUnXHJcbiAgICAgICAgXVxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgICB2dWUoe1xyXG4gICAgICAgICAgICBzY3JpcHQ6IHtcclxuICAgICAgICAgICAgICAgIC8vIFx1NUYwMFx1NTQyRiBkZWZpbmVNb2RlbFxyXG4gICAgICAgICAgICAgICAgZGVmaW5lTW9kZWw6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICAgICAgICBpbXBvcnRzOiBbJ3Z1ZSddLFxyXG4gICAgICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIENvbXBvbmVudHMoe1xyXG4gICAgICAgICAgICAvLyBcdThGRDlcdTkxQ0NcdTVDMzFcdTY2MkZcdTc2RjhcdTUxNzN1aVx1NUU5M1x1NzY4NFx1ODlFM1x1Njc5MFx1NURFNVx1NTE3NywgXHU5MUNDXHU5NzYyXHU3Njg0XHU5MDA5XHU5ODc5XHU2NzA5XHU2NjJGXHU1NDI2XHU0RjdGXHU3NTI4XHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU2ODM3XHU1RjBGIFx1NTk4Mlx1Njc5Q1x1OTcwMFx1ODk4MVx1OTAxQVx1OEZDNyB2YXIgXHU1M0Q4XHU5MUNGXHU2NTM5XHU1M0Q4XHU0RTNCXHU5ODk4IFx1OTcwMFx1ODk4MVx1NkNFOFx1NjEwRlx1NEUwMFx1NEUwQlxyXG4gICAgICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKFxyXG4gICAgICAgICAgICAgICAge2ltcG9ydFN0eWxlOiAnc2FzcycsfVxyXG4gICAgICAgICAgICApXVxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHByb2dyZXNzKCksXHJcbiAgICAgICAgdG9wTGV2ZWxBd2FpdCgpLFxyXG4gICAgICAgIHZ1ZUpzeCh7fSksXHJcbiAgICAgICAgaW5qZWN0KHtcclxuICAgICAgICAgICAgJDogXCJqcXVlcnlcIiwgLy8gXHU4RkQ5XHU5MUNDXHU0RjFBXHU4MUVBXHU1MkE4XHU4RjdEXHU1MTY1IG5vZGVfbW9kdWxlcyBcdTRFMkRcdTc2ODQganF1ZXJ5XHJcbiAgICAgICAgICAgIGpRdWVyeTogXCJqcXVlcnlcIixcclxuICAgICAgICAgICAgXCJ3aW5kb3dzLmpRdWVyeVwiOiBcImpxdWVyeVwiLFxyXG4gICAgICAgICAgICBcIndpbmRvd3MuJFwiOiBcImpxdWVyeVwiLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIGNyZWF0ZVN2Z0ljb25zUGx1Z2luKHtcclxuICAgICAgICAgICAgaWNvbkRpcnM6IFtyZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvaWNvbnMnKV0sXHJcbiAgICAgICAgICAgIHN5bWJvbElkOiAnaWNvbi1bZGlyXS1bbmFtZV0nLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgLy8gbW9uYWNvRWRpdG9yUGx1Z2luKHsgbGFuZ3VhZ2VXb3JrZXJzOiBbJ2VkaXRvcldvcmtlclNlcnZpY2UnLCAndHlwZXNjcmlwdCcsICdqc29uJywgJ2h0bWwnXX0pLFxyXG4gICAgICAgIC8vXHU1RjAwXHU1NDJGZ3ppcCxcdTU0MEVcdTdBRUZuZ2lueCBcdTk3MDBcdTg5ODEgZ3ppcF9zdGF0aWNcdThCQkVcdTdGNkVcdTRFM0FvblxyXG4gICAgICAgLyogdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgICAgICAgLy9cdTc1MUZcdTYyMTBcdTUzOEJcdTdGMjlcdTUzMDVnelxyXG4gICAgICAgICAgICB2ZXJib3NlOiB0cnVlLFxyXG4gICAgICAgICAgICBkaXNhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgdGhyZXNob2xkOiAxMDI0MCxcclxuICAgICAgICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXHJcbiAgICAgICAgICAgIGRlbGV0ZU9yaWdpbkZpbGU6IHRydWUsXHJcbiAgICAgICAgICAgIGV4dDogJy5neicsXHJcbiAgICAgICAgfSksKi9cclxuICAgIF0sXHJcbiAgLyogIG9wdGltaXplRGVwczoge1xyXG4gICAgICAgIGluY2x1ZGU6IFtcclxuICAgICAgICAgICAgYG1vbmFjby1lZGl0b3IvZXNtL3ZzL2xhbmd1YWdlL2pzb24vanNvbi53b3JrZXJgLFxyXG4gICAgICAgICAgICBgbW9uYWNvLWVkaXRvci9lc20vdnMvbGFuZ3VhZ2UvY3NzL2Nzcy53b3JrZXJgLFxyXG4gICAgICAgICAgICBgbW9uYWNvLWVkaXRvci9lc20vdnMvbGFuZ3VhZ2UvaHRtbC9odG1sLndvcmtlcmAsXHJcbiAgICAgICAgICAgIGBtb25hY28tZWRpdG9yL2VzbS92cy9sYW5ndWFnZS90eXBlc2NyaXB0L3RzLndvcmtlcmAsXHJcbiAgICAgICAgICAgIGBtb25hY28tZWRpdG9yL2VzbS92cy9lZGl0b3IvZWRpdG9yLndvcmtlcmBcclxuICAgICAgICBdLFxyXG4gICAgfSwqL1xyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLmpzJywgJy52dWUnLCAnLmpzb24nLCAnLnRzJywgXCIuanN4XCJdXHJcbiAgICB9LFxyXG4gICAgLyogICBjc3M6IHtcclxuICAgICAgICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgIHNjc3M6IHtcclxuICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxEYXRhOiBgQHVzZSBcIkAvYXNzZXRzL2Nzcy9lbGVtZW50L2luZGV4LnNjc3NcIiBhcyAqO2AsXHJcbiAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgfSxcclxuICAgICAgIH0sKi9cclxuICAgIGJ1aWxkOiB7XHJcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgICAgICBpbnB1dDoge1xyXG4gICAgICAgICAgICAgICAgbWFpbjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiaW5kZXguaHRtbFwiKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXJzZXJPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGNvbXByZXNzOiB7XHJcbiAgICAgICAgICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTdDXHU1QkI5XHU2MDI3ICBcImVzbmV4dFwifFwibW9kdWxlc1wiXHJcbiAgICAgICAgdGFyZ2V0OiBcIm1vZHVsZXNcIixcclxuICAgICAgICAvL1x1NjMwN1x1NUI5QVx1OEY5M1x1NTFGQVx1OERFRlx1NUY4NFxyXG4gICAgICAgIG91dERpcjogXCJkaXN0XCIsXHJcbiAgICAgICAgLy9cdTc1MUZcdTYyMTBcdTk3NTlcdTYwMDFcdThENDRcdTZFOTBcdTc2ODRcdTVCNThcdTY1M0VcdThERUZcdTVGODRcclxuICAgICAgICBhc3NldHNEaXI6IFwiYXNzZXRzXCIsXHJcbiAgICAgICAgLy9cdTVDMEZcdTRFOEVcdTZCNjRcdTk2MDhcdTUwM0NcdTc2ODRcdTVCRkNcdTUxNjVcdTYyMTZcdTVGMTVcdTc1MjhcdThENDRcdTZFOTBcdTVDMDZcdTUxODVcdTgwNTRcdTRFM0EgYmFzZTY0IFx1N0YxNlx1NzgwMVx1RkYwQ1x1NEVFNVx1OTA3Rlx1NTE0RFx1OTg5RFx1NTkxNlx1NzY4NCBodHRwIFx1OEJGN1x1NkM0Mlx1MzAwMlx1OEJCRVx1N0Y2RVx1NEUzQSAwIFx1NTNFRlx1NEVFNVx1NUI4Q1x1NTE2OFx1Nzk4MVx1NzUyOFx1NkI2NFx1OTg3OVxyXG4gICAgICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LFxyXG4gICAgICAgIC8vXHU1NDJGXHU3NTI4L1x1Nzk4MVx1NzUyOCBDU1MgXHU0RUUzXHU3ODAxXHU2MkM2XHU1MjA2XHJcbiAgICAgICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxyXG4gICAgICAgIC8vXHU2Nzg0XHU1RUZBXHU1NDBFXHU2NjJGXHU1NDI2XHU3NTFGXHU2MjEwIHNvdXJjZSBtYXAgXHU2NTg3XHU0RUY2XHJcbiAgICAgICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgICAgICAvL1x1ODFFQVx1NUI5QVx1NEU0OVx1NUU5NVx1NUM0Mlx1NzY4NCBSb2xsdXAgXHU2MjUzXHU1MzA1XHU5MTREXHU3RjZFXHJcbiAgICAgICAgLy9Acm9sbHVwL3BsdWdpbi1jb21tb25qcyBcdTYzRDJcdTRFRjZcdTc2ODRcdTkwMDlcdTk4NzlcclxuICAgICAgICBjb21tb25qc09wdGlvbnM6IHt9LFxyXG4gICAgICAgIC8vXHU2Nzg0XHU1RUZBXHU3Njg0XHU1RTkzXHJcbiAgICAgICAgLy8gVml0ZVx1OTg3OVx1NzZFRSBidWlsZFx1NjI1M1x1NTMwNVx1NTQwRVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NEUyRFx1NTNFRlx1NzZGNFx1NjNBNVx1NEY3Rlx1NzUyOFx1NzY4NFx1NjVCOVx1NkNENSBodHRwczovL2Jsb2cuY3Nkbi5uZXQvd2VpeGluXzU0ODk4ODc4L2FydGljbGUvZGV0YWlscy8xMjk3MzA2MjhcclxuICAgICAgICAvLyBsaWI6IHt9LFxyXG4gICAgICAgIC8vXHU1RjUzXHU4QkJFXHU3RjZFXHU0RTNBIHRydWVcdUZGMENcdTY3ODRcdTVFRkFcdTU0MEVcdTVDMDZcdTRGMUFcdTc1MUZcdTYyMTAgbWFuaWZlc3QuanNvbiBcdTY1ODdcdTRFRjZcclxuICAgICAgICBtYW5pZmVzdDogZmFsc2UsXHJcbiAgICAgICAgLy8gXHU4QkJFXHU3RjZFXHU0RTNBIGZhbHNlIFx1NTNFRlx1NEVFNVx1Nzk4MVx1NzUyOFx1NjcwMFx1NUMwRlx1NTMxNlx1NkRGN1x1NkRDNlx1RkYwQ1xyXG4gICAgICAgIC8vIFx1NjIxNlx1NjYyRlx1NzUyOFx1Njc2NVx1NjMwN1x1NUI5QVx1NEY3Rlx1NzUyOFx1NTRFQVx1NzlDRFx1NkRGN1x1NkRDNlx1NTY2OFxyXG4gICAgICAgIC8vIGJvb2xlYW4gfCAndGVyc2VyJyB8ICdlc2J1aWxkJ1xyXG4gICAgICAgIG1pbmlmeTogXCJ0ZXJzZXJcIiwgLy90ZXJzZXIgXHU2Nzg0XHU1RUZBXHU1NDBFXHU2NTg3XHU0RUY2XHU0RjUzXHU3OUVGXHU2NkY0XHU1QzBGXHJcbiAgICAgICAgLy9cdTRGMjBcdTkwMTJcdTdFRDkgVGVyc2VyIFx1NzY4NFx1NjZGNFx1NTkxQSBtaW5pZnkgXHU5MDA5XHU5ODc5XHUzMDAyXHJcbiAgICAgICAgLy9cdThCQkVcdTdGNkVcdTRFM0EgZmFsc2UgXHU2NzY1XHU3OTgxXHU3NTI4XHU1QzA2XHU2Nzg0XHU1RUZBXHU1NDBFXHU3Njg0XHU2NTg3XHU0RUY2XHU1MTk5XHU1MTY1XHU3OEMxXHU3NkQ4XHJcbiAgICAgICAgd3JpdGU6IHRydWUsXHJcbiAgICAgICAgLy9cdTlFRDhcdThCQTRcdTYwQzVcdTUxQjVcdTRFMEJcdUZGMENcdTgyRTUgb3V0RGlyIFx1NTcyOCByb290IFx1NzZFRVx1NUY1NVx1NEUwQlx1RkYwQ1x1NTIxOSBWaXRlIFx1NEYxQVx1NTcyOFx1Njc4NFx1NUVGQVx1NjVGNlx1NkUwNVx1N0E3QVx1OEJFNVx1NzZFRVx1NUY1NVx1MzAwMlxyXG4gICAgICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gICAgICAgIC8vY2h1bmsgXHU1OTI3XHU1QzBGXHU4QjY2XHU1NDRBXHU3Njg0XHU5NjUwXHU1MjM2XHJcbiAgICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA1MDBcclxuICAgIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFxUixTQUFR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
