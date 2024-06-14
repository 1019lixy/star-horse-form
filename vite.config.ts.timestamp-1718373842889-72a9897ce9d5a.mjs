// vite.config.ts
import { defineConfig } from "file:///D:/webstromworkspace/shdevopsui/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/webstromworkspace/shdevopsui/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import progress from "file:///D:/webstromworkspace/shdevopsui/node_modules/vite-plugin-progress/dist/index.mjs";
import vueJsx from "file:///D:/webstromworkspace/shdevopsui/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import inject from "file:///D:/webstromworkspace/shdevopsui/node_modules/@rollup/plugin-inject/dist/es/index.js";
import viteCompression from "file:///D:/webstromworkspace/shdevopsui/node_modules/vite-plugin-compression/dist/index.mjs";
import { resolve } from "path";
import { createSvgIconsPlugin } from "file:///D:/webstromworkspace/shdevopsui/node_modules/vite-plugin-svg-icons/dist/index.mjs";
import Components from "file:///D:/webstromworkspace/shdevopsui/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///D:/webstromworkspace/shdevopsui/node_modules/unplugin-vue-components/dist/resolvers.js";
import AutoImport from "file:///D:/webstromworkspace/shdevopsui/node_modules/unplugin-auto-import/dist/vite.js";
var __vite_injected_original_dirname = "D:\\webstromworkspace\\shdevopsui";
var codeHost = "http://localhost:8888/";
var systemHost = "http://localhost:8749/";
var workflowHost = "http://localhost:8899/";
var continusHost = "http://localhost:8859/";
var dbSearchHost = "http://localhost:7759/";
var userDbHost = "http://localhost:7758/";
var vite_config_default = defineConfig({
  server: {
    port: 8880,
    host: true,
    open: true,
    hmr: true,
    proxy: {
      "/system-config-dev": {
        target: systemHost,
        changeOrigin: true,
        ws: true
      },
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
        ws: true
      },
      "/dbsearch-manage": {
        target: dbSearchHost,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dbsearch-manage/, "/dbsearch-manage-dev"),
        ws: true
      },
      "/userdb-manage-dev": {
        target: userDbHost,
        changeOrigin: true,
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
  plugins: [
    vue({
      script: {
        // 开启 defineModel
        defineModel: true
      }
    }),
    AutoImport({
      imports: ["vue"]
    }),
    Components({
      // 这里就是相关ui库的解析工具, 里面的选项有是否使用自动导入样式 如果需要通过 var 变量改变主题 需要注意一下
      resolvers: [ElementPlusResolver()]
    }),
    progress(),
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
    }),
    //开启gzip,后端nginx 需要 gzip_static设置为on
    viteCompression({
      //生成压缩包gz
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: "gzip",
      deleteOriginFile: true,
      ext: ".gz"
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src")
    },
    extensions: [".js", ".vue", ".json", ".ts", ".jsx"]
  },
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3ZWJzdHJvbXdvcmtzcGFjZVxcXFxzaGRldm9wc3VpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3ZWJzdHJvbXdvcmtzcGFjZVxcXFxzaGRldm9wc3VpXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93ZWJzdHJvbXdvcmtzcGFjZS9zaGRldm9wc3VpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHtkZWZpbmVDb25maWd9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgcHJvZ3Jlc3MgZnJvbSAndml0ZS1wbHVnaW4tcHJvZ3Jlc3MnXHJcbmltcG9ydCB2dWVKc3ggZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIlxyXG5pbXBvcnQgaW5qZWN0IGZyb20gXCJAcm9sbHVwL3BsdWdpbi1pbmplY3RcIlxyXG5pbXBvcnQgdml0ZUNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJ1xyXG5pbXBvcnQge3Jlc29sdmV9IGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7Y3JlYXRlU3ZnSWNvbnNQbHVnaW59IGZyb20gJ3ZpdGUtcGx1Z2luLXN2Zy1pY29ucydcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcclxuaW1wb3J0IHtFbGVtZW50UGx1c1Jlc29sdmVyfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcblxyXG5jb25zdCBjb2RlSG9zdCA9IFwiaHR0cDovL2xvY2FsaG9zdDo4ODg4L1wiXHJcbmNvbnN0IHN5c3RlbUhvc3QgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6ODc0OS9cIlxyXG5jb25zdCB3b3JrZmxvd0hvc3QgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6ODg5OS9cIlxyXG5jb25zdCBjb250aW51c0hvc3QgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6ODg1OS9cIlxyXG5jb25zdCBkYlNlYXJjaEhvc3QgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6Nzc1OS9cIlxyXG5jb25zdCB1c2VyRGJIb3N0ID0gXCJodHRwOi8vbG9jYWxob3N0Ojc3NTgvXCJcclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICAgIHBvcnQ6IDg4ODAsXHJcbiAgICAgICAgaG9zdDogdHJ1ZSxcclxuICAgICAgICBvcGVuOiB0cnVlLFxyXG4gICAgICAgIGhtcjogdHJ1ZSxcclxuICAgICAgICBwcm94eToge1xyXG4gICAgICAgICAgICBcIi9zeXN0ZW0tY29uZmlnLWRldlwiOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHN5c3RlbUhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi9zeXN0ZW0tY29uZmlnXCI6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogc3lzdGVtSG9zdCxcclxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9zeXN0ZW0tY29uZmlnLywgJy9zeXN0ZW0tY29uZmlnLWRldicpLFxyXG4gICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIFwiL2NvZGUtZ2VuZXJhdG9yXCI6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogY29kZUhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvY29kZS1nZW5lcmF0b3IvLCAnL2NvZGUtZ2VuZXJhdG9yLWRldicpLFxyXG4gICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCIvZmxvdy1lbmdpbmVcIjoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB3b3JrZmxvd0hvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi9kZXZvcHMtY29udGludXNcIjoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBjb250aW51c0hvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi9kYnNlYXJjaC1tYW5hZ2VcIjoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBkYlNlYXJjaEhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvZGJzZWFyY2gtbWFuYWdlLywgJy9kYnNlYXJjaC1tYW5hZ2UtZGV2JyksXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi91c2VyZGItbWFuYWdlLWRldlwiOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHVzZXJEYkhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi91c2VyZGItbWFuYWdlXCI6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogdXNlckRiSG9zdCxcclxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC91c2VyZGItbWFuYWdlLywgJy91c2VyZGItbWFuYWdlLWRldicpLFxyXG4gICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgICB2dWUoe1xyXG4gICAgICAgICAgICBzY3JpcHQ6IHtcclxuICAgICAgICAgICAgICAgIC8vIFx1NUYwMFx1NTQyRiBkZWZpbmVNb2RlbFxyXG4gICAgICAgICAgICAgICAgZGVmaW5lTW9kZWw6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICAgICAgICBpbXBvcnRzOiBbJ3Z1ZSddXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgQ29tcG9uZW50cyh7XHJcbiAgICAgICAgICAgIC8vIFx1OEZEOVx1OTFDQ1x1NUMzMVx1NjYyRlx1NzZGOFx1NTE3M3VpXHU1RTkzXHU3Njg0XHU4OUUzXHU2NzkwXHU1REU1XHU1MTc3LCBcdTkxQ0NcdTk3NjJcdTc2ODRcdTkwMDlcdTk4NzlcdTY3MDlcdTY2MkZcdTU0MjZcdTRGN0ZcdTc1MjhcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjVcdTY4MzdcdTVGMEYgXHU1OTgyXHU2NzlDXHU5NzAwXHU4OTgxXHU5MDFBXHU4RkM3IHZhciBcdTUzRDhcdTkxQ0ZcdTY1MzlcdTUzRDhcdTRFM0JcdTk4OTggXHU5NzAwXHU4OTgxXHU2Q0U4XHU2MTBGXHU0RTAwXHU0RTBCXHJcbiAgICAgICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV1cclxuICAgICAgICB9KSxcclxuICAgICAgICBwcm9ncmVzcygpLFxyXG4gICAgICAgIHZ1ZUpzeCh7fSksXHJcbiAgICAgICAgaW5qZWN0KHtcclxuICAgICAgICAgICAgJDogXCJqcXVlcnlcIiwgLy8gXHU4RkQ5XHU5MUNDXHU0RjFBXHU4MUVBXHU1MkE4XHU4RjdEXHU1MTY1IG5vZGVfbW9kdWxlcyBcdTRFMkRcdTc2ODQganF1ZXJ5XHJcbiAgICAgICAgICAgIGpRdWVyeTogXCJqcXVlcnlcIixcclxuICAgICAgICAgICAgXCJ3aW5kb3dzLmpRdWVyeVwiOiBcImpxdWVyeVwiLFxyXG4gICAgICAgICAgICBcIndpbmRvd3MuJFwiOiBcImpxdWVyeVwiLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIGNyZWF0ZVN2Z0ljb25zUGx1Z2luKHtcclxuICAgICAgICAgICAgaWNvbkRpcnM6IFtyZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvaWNvbnMnKV0sXHJcbiAgICAgICAgICAgIHN5bWJvbElkOiAnaWNvbi1bZGlyXS1bbmFtZV0nLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIC8vXHU1RjAwXHU1NDJGZ3ppcCxcdTU0MEVcdTdBRUZuZ2lueCBcdTk3MDBcdTg5ODEgZ3ppcF9zdGF0aWNcdThCQkVcdTdGNkVcdTRFM0FvblxyXG4gICAgICAgIHZpdGVDb21wcmVzc2lvbih7XHJcbiAgICAgICAgICAgIC8vXHU3NTFGXHU2MjEwXHU1MzhCXHU3RjI5XHU1MzA1Z3pcclxuICAgICAgICAgICAgdmVyYm9zZTogdHJ1ZSxcclxuICAgICAgICAgICAgZGlzYWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHRocmVzaG9sZDogMTAyNDAsXHJcbiAgICAgICAgICAgIGFsZ29yaXRobTogJ2d6aXAnLFxyXG4gICAgICAgICAgICBkZWxldGVPcmlnaW5GaWxlOiB0cnVlLFxyXG4gICAgICAgICAgICBleHQ6ICcuZ3onLFxyXG4gICAgICAgIH0pLFxyXG4gICAgXSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgICBhbGlhczoge1xyXG4gICAgICAgICAgICBcIkBcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIilcclxuICAgICAgICB9LFxyXG4gICAgICAgIGV4dGVuc2lvbnM6IFsnLmpzJywgJy52dWUnLCAnLmpzb24nLCAnLnRzJywgXCIuanN4XCJdXHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGlucHV0OiB7XHJcbiAgICAgICAgICAgICAgICBtYWluOiByZXNvbHZlKF9fZGlybmFtZSwgXCJpbmRleC5odG1sXCIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICAgICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy9cdTZENEZcdTg5QzhcdTU2NjhcdTUxN0NcdTVCQjlcdTYwMjcgIFwiZXNuZXh0XCJ8XCJtb2R1bGVzXCJcclxuICAgICAgICB0YXJnZXQ6IFwibW9kdWxlc1wiLFxyXG4gICAgICAgIC8vXHU2MzA3XHU1QjlBXHU4RjkzXHU1MUZBXHU4REVGXHU1Rjg0XHJcbiAgICAgICAgb3V0RGlyOiBcImRpc3RcIixcclxuICAgICAgICAvL1x1NzUxRlx1NjIxMFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NzY4NFx1NUI1OFx1NjUzRVx1OERFRlx1NUY4NFxyXG4gICAgICAgIGFzc2V0c0RpcjogXCJhc3NldHNcIixcclxuICAgICAgICAvL1x1NUMwRlx1NEU4RVx1NkI2NFx1OTYwOFx1NTAzQ1x1NzY4NFx1NUJGQ1x1NTE2NVx1NjIxNlx1NUYxNVx1NzUyOFx1OEQ0NFx1NkU5MFx1NUMwNlx1NTE4NVx1ODA1NFx1NEUzQSBiYXNlNjQgXHU3RjE2XHU3ODAxXHVGRjBDXHU0RUU1XHU5MDdGXHU1MTREXHU5ODlEXHU1OTE2XHU3Njg0IGh0dHAgXHU4QkY3XHU2QzQyXHUzMDAyXHU4QkJFXHU3RjZFXHU0RTNBIDAgXHU1M0VGXHU0RUU1XHU1QjhDXHU1MTY4XHU3OTgxXHU3NTI4XHU2QjY0XHU5ODc5XHJcbiAgICAgICAgYXNzZXRzSW5saW5lTGltaXQ6IDQwOTYsXHJcbiAgICAgICAgLy9cdTU0MkZcdTc1MjgvXHU3OTgxXHU3NTI4IENTUyBcdTRFRTNcdTc4MDFcdTYyQzZcdTUyMDZcclxuICAgICAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXHJcbiAgICAgICAgLy9cdTY3ODRcdTVFRkFcdTU0MEVcdTY2MkZcdTU0MjZcdTc1MUZcdTYyMTAgc291cmNlIG1hcCBcdTY1ODdcdTRFRjZcclxuICAgICAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgICAgIC8vXHU4MUVBXHU1QjlBXHU0RTQ5XHU1RTk1XHU1QzQyXHU3Njg0IFJvbGx1cCBcdTYyNTNcdTUzMDVcdTkxNERcdTdGNkVcclxuICAgICAgICAvL0Byb2xsdXAvcGx1Z2luLWNvbW1vbmpzIFx1NjNEMlx1NEVGNlx1NzY4NFx1OTAwOVx1OTg3OVxyXG4gICAgICAgIGNvbW1vbmpzT3B0aW9uczoge30sXHJcbiAgICAgICAgLy9cdTY3ODRcdTVFRkFcdTc2ODRcdTVFOTNcclxuICAgICAgICAvLyBWaXRlXHU5ODc5XHU3NkVFIGJ1aWxkXHU2MjUzXHU1MzA1XHU1NDBFXHU2RDRGXHU4OUM4XHU1NjY4XHU0RTJEXHU1M0VGXHU3NkY0XHU2M0E1XHU0RjdGXHU3NTI4XHU3Njg0XHU2NUI5XHU2Q0Q1IGh0dHBzOi8vYmxvZy5jc2RuLm5ldC93ZWl4aW5fNTQ4OTg4NzgvYXJ0aWNsZS9kZXRhaWxzLzEyOTczMDYyOFxyXG4gICAgICAgIC8vIGxpYjoge30sXHJcbiAgICAgICAgLy9cdTVGNTNcdThCQkVcdTdGNkVcdTRFM0EgdHJ1ZVx1RkYwQ1x1Njc4NFx1NUVGQVx1NTQwRVx1NUMwNlx1NEYxQVx1NzUxRlx1NjIxMCBtYW5pZmVzdC5qc29uIFx1NjU4N1x1NEVGNlxyXG4gICAgICAgIG1hbmlmZXN0OiBmYWxzZSxcclxuICAgICAgICAvLyBcdThCQkVcdTdGNkVcdTRFM0EgZmFsc2UgXHU1M0VGXHU0RUU1XHU3OTgxXHU3NTI4XHU2NzAwXHU1QzBGXHU1MzE2XHU2REY3XHU2REM2XHVGRjBDXHJcbiAgICAgICAgLy8gXHU2MjE2XHU2NjJGXHU3NTI4XHU2NzY1XHU2MzA3XHU1QjlBXHU0RjdGXHU3NTI4XHU1NEVBXHU3OUNEXHU2REY3XHU2REM2XHU1NjY4XHJcbiAgICAgICAgLy8gYm9vbGVhbiB8ICd0ZXJzZXInIHwgJ2VzYnVpbGQnXHJcbiAgICAgICAgbWluaWZ5OiBcInRlcnNlclwiLCAvL3RlcnNlciBcdTY3ODRcdTVFRkFcdTU0MEVcdTY1ODdcdTRFRjZcdTRGNTNcdTc5RUZcdTY2RjRcdTVDMEZcclxuICAgICAgICAvL1x1NEYyMFx1OTAxMlx1N0VEOSBUZXJzZXIgXHU3Njg0XHU2NkY0XHU1OTFBIG1pbmlmeSBcdTkwMDlcdTk4NzlcdTMwMDJcclxuICAgICAgICAvL1x1OEJCRVx1N0Y2RVx1NEUzQSBmYWxzZSBcdTY3NjVcdTc5ODFcdTc1MjhcdTVDMDZcdTY3ODRcdTVFRkFcdTU0MEVcdTc2ODRcdTY1ODdcdTRFRjZcdTUxOTlcdTUxNjVcdTc4QzFcdTc2RDhcclxuICAgICAgICB3cml0ZTogdHJ1ZSxcclxuICAgICAgICAvL1x1OUVEOFx1OEJBNFx1NjBDNVx1NTFCNVx1NEUwQlx1RkYwQ1x1ODJFNSBvdXREaXIgXHU1NzI4IHJvb3QgXHU3NkVFXHU1RjU1XHU0RTBCXHVGRjBDXHU1MjE5IFZpdGUgXHU0RjFBXHU1NzI4XHU2Nzg0XHU1RUZBXHU2NUY2XHU2RTA1XHU3QTdBXHU4QkU1XHU3NkVFXHU1RjU1XHUzMDAyXHJcbiAgICAgICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICAgICAgLy9jaHVuayBcdTU5MjdcdTVDMEZcdThCNjZcdTU0NEFcdTc2ODRcdTk2NTBcdTUyMzZcclxuICAgICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMFxyXG4gICAgfVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFSLFNBQVEsb0JBQW1CO0FBQ2hULE9BQU8sU0FBUztBQUNoQixPQUFPLGNBQWM7QUFDckIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sWUFBWTtBQUNuQixPQUFPLHFCQUFxQjtBQUM1QixTQUFRLGVBQWM7QUFDdEIsU0FBUSw0QkFBMkI7QUFDbkMsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUSwyQkFBMEI7QUFDbEMsT0FBTyxnQkFBZ0I7QUFWdkIsSUFBTSxtQ0FBbUM7QUFZekMsSUFBTSxXQUFXO0FBQ2pCLElBQU0sYUFBYTtBQUNuQixJQUFNLGVBQWU7QUFDckIsSUFBTSxlQUFlO0FBQ3JCLElBQU0sZUFBZTtBQUNyQixJQUFNLGFBQWE7QUFFbkIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sS0FBSztBQUFBLElBQ0wsT0FBTztBQUFBLE1BQ0gsc0JBQXNCO0FBQUEsUUFDbEIsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsSUFBSTtBQUFBLE1BQ1I7QUFBQSxNQUNBLGtCQUFrQjtBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLG9CQUFvQixvQkFBb0I7QUFBQSxRQUN4RSxJQUFJO0FBQUEsTUFDUjtBQUFBLE1BRUEsbUJBQW1CO0FBQUEsUUFDZixRQUFRO0FBQUEsUUFD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
