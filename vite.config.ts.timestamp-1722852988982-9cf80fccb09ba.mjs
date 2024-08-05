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
        rewrite: (path) => path.replace(/^\/devops-continus/, "/devops-continus-dev"),
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3ZWJzdHJvbXdvcmtzcGFjZVxcXFxzaGRldm9wc3VpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFx3ZWJzdHJvbXdvcmtzcGFjZVxcXFxzaGRldm9wc3VpXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi93ZWJzdHJvbXdvcmtzcGFjZS9zaGRldm9wc3VpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHtkZWZpbmVDb25maWd9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgcHJvZ3Jlc3MgZnJvbSAndml0ZS1wbHVnaW4tcHJvZ3Jlc3MnXHJcbmltcG9ydCB2dWVKc3ggZnJvbSBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIlxyXG5pbXBvcnQgaW5qZWN0IGZyb20gXCJAcm9sbHVwL3BsdWdpbi1pbmplY3RcIlxyXG5pbXBvcnQgdml0ZUNvbXByZXNzaW9uIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJ1xyXG5pbXBvcnQge3Jlc29sdmV9IGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7Y3JlYXRlU3ZnSWNvbnNQbHVnaW59IGZyb20gJ3ZpdGUtcGx1Z2luLXN2Zy1pY29ucydcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcclxuaW1wb3J0IHtFbGVtZW50UGx1c1Jlc29sdmVyfSBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnMnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmNvbnN0IGNvZGVIb3N0ID0gXCJodHRwOi8vbG9jYWxob3N0Ojg4ODgvXCJcclxuY29uc3Qgc3lzdGVtSG9zdCA9IFwiaHR0cDovL2xvY2FsaG9zdDo4NzQ5L1wiXHJcbmNvbnN0IHdvcmtmbG93SG9zdCA9IFwiaHR0cDovL2xvY2FsaG9zdDo4ODk5L1wiXHJcbmNvbnN0IGNvbnRpbnVzSG9zdCA9IFwiaHR0cDovL2xvY2FsaG9zdDo4ODU5L1wiXHJcbmNvbnN0IGRiU2VhcmNoSG9zdCA9IFwiaHR0cDovL2xvY2FsaG9zdDo3NzU5L1wiXHJcbi8vIGNvbnN0IGRiU2VhcmNoSG9zdCA9IFwiaHR0cDovLzE5Mi4xNjguMjAuMTY1Ojc3NTkvXCJcclxuY29uc3QgdXNlckRiSG9zdCA9IFwiaHR0cDovL2xvY2FsaG9zdDo3NzU4L1wiXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgICBwb3J0OiA4ODgwLFxyXG4gICAgICAgIGhvc3Q6IHRydWUsXHJcbiAgICAgICAgb3BlbjogdHJ1ZSxcclxuICAgICAgICBobXI6IHRydWUsXHJcbiAgICAgICAgcHJveHk6IHtcclxuICAgICAgICAgICAgXCIvc3lzdGVtLWNvbmZpZy1kZXZcIjoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBzeXN0ZW1Ib3N0LFxyXG4gICAgICAgICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCIvc3lzdGVtLWNvbmZpZ1wiOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHN5c3RlbUhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvc3lzdGVtLWNvbmZpZy8sICcvc3lzdGVtLWNvbmZpZy1kZXYnKSxcclxuICAgICAgICAgICAgICAgIHdzOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiL2NvZGUtZ2VuZXJhdG9yXCI6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogY29kZUhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvY29kZS1nZW5lcmF0b3IvLCAnL2NvZGUtZ2VuZXJhdG9yLWRldicpLFxyXG4gICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCIvZmxvdy1lbmdpbmVcIjoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB3b3JrZmxvd0hvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi9kZXZvcHMtY29udGludXNcIjoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBjb250aW51c0hvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvZGV2b3BzLWNvbnRpbnVzLywgJy9kZXZvcHMtY29udGludXMtZGV2JyksXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi9kYnNlYXJjaC1tYW5hZ2VcIjoge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBkYlNlYXJjaEhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvZGJzZWFyY2gtbWFuYWdlLywgJy9kYnNlYXJjaC1tYW5hZ2UtZGV2JyksXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi91c2VyZGItbWFuYWdlLWRldlwiOiB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHVzZXJEYkhvc3QsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICB3czogdHJ1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIi91c2VyZGItbWFuYWdlXCI6IHtcclxuICAgICAgICAgICAgICAgIHRhcmdldDogdXNlckRiSG9zdCxcclxuICAgICAgICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC91c2VyZGItbWFuYWdlLywgJy91c2VyZGItbWFuYWdlLWRldicpLFxyXG4gICAgICAgICAgICAgICAgd3M6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIHZ1ZSh7XHJcbiAgICAgICAgICAgIHNjcmlwdDoge1xyXG4gICAgICAgICAgICAgICAgLy8gXHU1RjAwXHU1NDJGIGRlZmluZU1vZGVsXHJcbiAgICAgICAgICAgICAgICBkZWZpbmVNb2RlbDogdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgICAgICAgIGltcG9ydHM6IFsndnVlJ11cclxuICAgICAgICB9KSxcclxuICAgICAgICBDb21wb25lbnRzKHtcclxuICAgICAgICAgICAgLy8gXHU4RkQ5XHU5MUNDXHU1QzMxXHU2NjJGXHU3NkY4XHU1MTczdWlcdTVFOTNcdTc2ODRcdTg5RTNcdTY3OTBcdTVERTVcdTUxNzcsIFx1OTFDQ1x1OTc2Mlx1NzY4NFx1OTAwOVx1OTg3OVx1NjcwOVx1NjYyRlx1NTQyNlx1NEY3Rlx1NzUyOFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NjgzN1x1NUYwRiBcdTU5ODJcdTY3OUNcdTk3MDBcdTg5ODFcdTkwMUFcdThGQzcgdmFyIFx1NTNEOFx1OTFDRlx1NjUzOVx1NTNEOFx1NEUzQlx1OTg5OCBcdTk3MDBcdTg5ODFcdTZDRThcdTYxMEZcdTRFMDBcdTRFMEJcclxuICAgICAgICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcigpXVxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIHByb2dyZXNzKCksXHJcbiAgICAgICAgdnVlSnN4KHt9KSxcclxuICAgICAgICBpbmplY3Qoe1xyXG4gICAgICAgICAgICAkOiBcImpxdWVyeVwiLCAvLyBcdThGRDlcdTkxQ0NcdTRGMUFcdTgxRUFcdTUyQThcdThGN0RcdTUxNjUgbm9kZV9tb2R1bGVzIFx1NEUyRFx1NzY4NCBqcXVlcnlcclxuICAgICAgICAgICAgalF1ZXJ5OiBcImpxdWVyeVwiLFxyXG4gICAgICAgICAgICBcIndpbmRvd3MualF1ZXJ5XCI6IFwianF1ZXJ5XCIsXHJcbiAgICAgICAgICAgIFwid2luZG93cy4kXCI6IFwianF1ZXJ5XCIsXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgY3JlYXRlU3ZnSWNvbnNQbHVnaW4oe1xyXG4gICAgICAgICAgICBpY29uRGlyczogW3Jlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9pY29ucycpXSxcclxuICAgICAgICAgICAgc3ltYm9sSWQ6ICdpY29uLVtkaXJdLVtuYW1lXScsXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgLy9cdTVGMDBcdTU0MkZnemlwLFx1NTQwRVx1N0FFRm5naW54IFx1OTcwMFx1ODk4MSBnemlwX3N0YXRpY1x1OEJCRVx1N0Y2RVx1NEUzQW9uXHJcbiAgICAgICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgICAgICAgLy9cdTc1MUZcdTYyMTBcdTUzOEJcdTdGMjlcdTUzMDVnelxyXG4gICAgICAgICAgICB2ZXJib3NlOiB0cnVlLFxyXG4gICAgICAgICAgICBkaXNhYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgdGhyZXNob2xkOiAxMDI0MCxcclxuICAgICAgICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXHJcbiAgICAgICAgICAgIGRlbGV0ZU9yaWdpbkZpbGU6IHRydWUsXHJcbiAgICAgICAgICAgIGV4dDogJy5neicsXHJcbiAgICAgICAgfSksXHJcbiAgICBdLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGFsaWFzOiB7XHJcbiAgICAgICAgICAgIFwiQFwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXh0ZW5zaW9uczogWycuanMnLCAnLnZ1ZScsICcuanNvbicsICcudHMnLCBcIi5qc3hcIl1cclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgaW5wdXQ6IHtcclxuICAgICAgICAgICAgICAgIG1haW46IHJlc29sdmUoX19kaXJuYW1lLCBcImluZGV4Lmh0bWxcIilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICAgICAgICBjb21wcmVzczoge1xyXG4gICAgICAgICAgICAgICAgZHJvcF9jb25zb2xlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvL1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE3Q1x1NUJCOVx1NjAyNyAgXCJlc25leHRcInxcIm1vZHVsZXNcIlxyXG4gICAgICAgIHRhcmdldDogXCJtb2R1bGVzXCIsXHJcbiAgICAgICAgLy9cdTYzMDdcdTVCOUFcdThGOTNcdTUxRkFcdThERUZcdTVGODRcclxuICAgICAgICBvdXREaXI6IFwiZGlzdFwiLFxyXG4gICAgICAgIC8vXHU3NTFGXHU2MjEwXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU3Njg0XHU1QjU4XHU2NTNFXHU4REVGXHU1Rjg0XHJcbiAgICAgICAgYXNzZXRzRGlyOiBcImFzc2V0c1wiLFxyXG4gICAgICAgIC8vXHU1QzBGXHU0RThFXHU2QjY0XHU5NjA4XHU1MDNDXHU3Njg0XHU1QkZDXHU1MTY1XHU2MjE2XHU1RjE1XHU3NTI4XHU4RDQ0XHU2RTkwXHU1QzA2XHU1MTg1XHU4MDU0XHU0RTNBIGJhc2U2NCBcdTdGMTZcdTc4MDFcdUZGMENcdTRFRTVcdTkwN0ZcdTUxNERcdTk4OURcdTU5MTZcdTc2ODQgaHR0cCBcdThCRjdcdTZDNDJcdTMwMDJcdThCQkVcdTdGNkVcdTRFM0EgMCBcdTUzRUZcdTRFRTVcdTVCOENcdTUxNjhcdTc5ODFcdTc1MjhcdTZCNjRcdTk4NzlcclxuICAgICAgICBhc3NldHNJbmxpbmVMaW1pdDogNDA5NixcclxuICAgICAgICAvL1x1NTQyRlx1NzUyOC9cdTc5ODFcdTc1MjggQ1NTIFx1NEVFM1x1NzgwMVx1NjJDNlx1NTIwNlxyXG4gICAgICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICAgICAgICAvL1x1Njc4NFx1NUVGQVx1NTQwRVx1NjYyRlx1NTQyNlx1NzUxRlx1NjIxMCBzb3VyY2UgbWFwIFx1NjU4N1x1NEVGNlxyXG4gICAgICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICAgICAgLy9cdTgxRUFcdTVCOUFcdTRFNDlcdTVFOTVcdTVDNDJcdTc2ODQgUm9sbHVwIFx1NjI1M1x1NTMwNVx1OTE0RFx1N0Y2RVxyXG4gICAgICAgIC8vQHJvbGx1cC9wbHVnaW4tY29tbW9uanMgXHU2M0QyXHU0RUY2XHU3Njg0XHU5MDA5XHU5ODc5XHJcbiAgICAgICAgY29tbW9uanNPcHRpb25zOiB7fSxcclxuICAgICAgICAvL1x1Njc4NFx1NUVGQVx1NzY4NFx1NUU5M1xyXG4gICAgICAgIC8vIFZpdGVcdTk4NzlcdTc2RUUgYnVpbGRcdTYyNTNcdTUzMDVcdTU0MEVcdTZENEZcdTg5QzhcdTU2NjhcdTRFMkRcdTUzRUZcdTc2RjRcdTYzQTVcdTRGN0ZcdTc1MjhcdTc2ODRcdTY1QjlcdTZDRDUgaHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl81NDg5ODg3OC9hcnRpY2xlL2RldGFpbHMvMTI5NzMwNjI4XHJcbiAgICAgICAgLy8gbGliOiB7fSxcclxuICAgICAgICAvL1x1NUY1M1x1OEJCRVx1N0Y2RVx1NEUzQSB0cnVlXHVGRjBDXHU2Nzg0XHU1RUZBXHU1NDBFXHU1QzA2XHU0RjFBXHU3NTFGXHU2MjEwIG1hbmlmZXN0Lmpzb24gXHU2NTg3XHU0RUY2XHJcbiAgICAgICAgbWFuaWZlc3Q6IGZhbHNlLFxyXG4gICAgICAgIC8vIFx1OEJCRVx1N0Y2RVx1NEUzQSBmYWxzZSBcdTUzRUZcdTRFRTVcdTc5ODFcdTc1MjhcdTY3MDBcdTVDMEZcdTUzMTZcdTZERjdcdTZEQzZcdUZGMENcclxuICAgICAgICAvLyBcdTYyMTZcdTY2MkZcdTc1MjhcdTY3NjVcdTYzMDdcdTVCOUFcdTRGN0ZcdTc1MjhcdTU0RUFcdTc5Q0RcdTZERjdcdTZEQzZcdTU2NjhcclxuICAgICAgICAvLyBib29sZWFuIHwgJ3RlcnNlcicgfCAnZXNidWlsZCdcclxuICAgICAgICBtaW5pZnk6IFwidGVyc2VyXCIsIC8vdGVyc2VyIFx1Njc4NFx1NUVGQVx1NTQwRVx1NjU4N1x1NEVGNlx1NEY1M1x1NzlFRlx1NjZGNFx1NUMwRlxyXG4gICAgICAgIC8vXHU0RjIwXHU5MDEyXHU3RUQ5IFRlcnNlciBcdTc2ODRcdTY2RjRcdTU5MUEgbWluaWZ5IFx1OTAwOVx1OTg3OVx1MzAwMlxyXG4gICAgICAgIC8vXHU4QkJFXHU3RjZFXHU0RTNBIGZhbHNlIFx1Njc2NVx1Nzk4MVx1NzUyOFx1NUMwNlx1Njc4NFx1NUVGQVx1NTQwRVx1NzY4NFx1NjU4N1x1NEVGNlx1NTE5OVx1NTE2NVx1NzhDMVx1NzZEOFxyXG4gICAgICAgIHdyaXRlOiB0cnVlLFxyXG4gICAgICAgIC8vXHU5RUQ4XHU4QkE0XHU2MEM1XHU1MUI1XHU0RTBCXHVGRjBDXHU4MkU1IG91dERpciBcdTU3Mjggcm9vdCBcdTc2RUVcdTVGNTVcdTRFMEJcdUZGMENcdTUyMTkgVml0ZSBcdTRGMUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTZFMDVcdTdBN0FcdThCRTVcdTc2RUVcdTVGNTVcdTMwMDJcclxuICAgICAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICAgICAgICAvL2NodW5rIFx1NTkyN1x1NUMwRlx1OEI2Nlx1NTQ0QVx1NzY4NFx1OTY1MFx1NTIzNlxyXG4gICAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNTAwXHJcbiAgICB9XHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBcVIsU0FBUSxvQkFBbUI7QUFDaFQsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sY0FBYztBQUNyQixPQUFPLFlBQVk7QUFDbkIsT0FBTyxZQUFZO0FBQ25CLE9BQU8scUJBQXFCO0FBQzVCLFNBQVEsZUFBYztBQUN0QixTQUFRLDRCQUEyQjtBQUNuQyxPQUFPLGdCQUFnQjtBQUN2QixTQUFRLDJCQUEwQjtBQUNsQyxPQUFPLGdCQUFnQjtBQVZ2QixJQUFNLG1DQUFtQztBQVd6QyxJQUFNLFdBQVc7QUFDakIsSUFBTSxhQUFhO0FBQ25CLElBQU0sZUFBZTtBQUNyQixJQUFNLGVBQWU7QUFDckIsSUFBTSxlQUFlO0FBRXJCLElBQU0sYUFBYTtBQUVuQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixRQUFRO0FBQUEsSUFDSixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixLQUFLO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxzQkFBc0I7QUFBQSxRQUNsQixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxJQUFJO0FBQUEsTUFDUjtBQUFBLE1BQ0Esa0JBQWtCO0FBQUEsUUFDZCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsb0JBQW9CLG9CQUFvQjtBQUFBLFFBQ3hFLElBQUk7QUFBQSxNQUNSO0FBQUEsTUFDQSxtQkFBbUI7QUFBQSxRQUNmLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxxQkFBcUIscUJBQXFCO0FBQUEsUUFDMUUsSUFBSTtBQUFBLE1BQ1I7QUFBQSxNQUNBLGdCQUFnQjtBQUFBLFFBQ1osUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsSUFBSTtBQUFBLE1BQ1I7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2hCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxzQkFBc0Isc0JBQXNCO0FBQUEsUUFDNUUsSUFBSTtBQUFBLE1BQ1I7QUFBQSxNQUNBLG9CQUFvQjtBQUFBLFFBQ2hCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxzQkFBc0Isc0JBQXNCO0FBQUEsUUFDNUUsSUFBSTtBQUFBLE1BQ1I7QUFBQSxNQUNBLHNCQUFzQjtBQUFBLFFBQ2xCLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLElBQUk7QUFBQSxNQUNSO0FBQUEsTUFDQSxrQkFBa0I7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFNBQVMsQ0FBQyxTQUFTLEtBQUssUUFBUSxvQkFBb0Isb0JBQW9CO0FBQUEsUUFDeEUsSUFBSTtBQUFBLE1BQ1I7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsSUFBSTtBQUFBLE1BQ0EsUUFBUTtBQUFBO0FBQUEsUUFFSixhQUFhO0FBQUEsTUFDakI7QUFBQSxJQUNKLENBQUM7QUFBQSxJQUNELFdBQVc7QUFBQSxNQUNQLFNBQVMsQ0FBQyxLQUFLO0FBQUEsSUFDbkIsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBO0FBQUEsTUFFUCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxJQUNyQyxDQUFDO0FBQUEsSUFDRCxTQUFTO0FBQUEsSUFDVCxPQUFPLENBQUMsQ0FBQztBQUFBLElBQ1QsT0FBTztBQUFBLE1BQ0gsR0FBRztBQUFBO0FBQUEsTUFDSCxRQUFRO0FBQUEsTUFDUixrQkFBa0I7QUFBQSxNQUNsQixhQUFhO0FBQUEsSUFDakIsQ0FBQztBQUFBLElBQ0QscUJBQXFCO0FBQUEsTUFDakIsVUFBVSxDQUFDLFFBQVEsUUFBUSxJQUFJLEdBQUcsV0FBVyxDQUFDO0FBQUEsTUFDOUMsVUFBVTtBQUFBLElBQ2QsQ0FBQztBQUFBO0FBQUEsSUFFRCxnQkFBZ0I7QUFBQTtBQUFBLE1BRVosU0FBUztBQUFBLE1BQ1QsU0FBUztBQUFBLE1BQ1QsV0FBVztBQUFBLE1BQ1gsV0FBVztBQUFBLE1BQ1gsa0JBQWtCO0FBQUEsTUFDbEIsS0FBSztBQUFBLElBQ1QsQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDbkM7QUFBQSxJQUNBLFlBQVksQ0FBQyxPQUFPLFFBQVEsU0FBUyxPQUFPLE1BQU07QUFBQSxFQUN0RDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0gsZUFBZTtBQUFBLE1BQ1gsT0FBTztBQUFBLFFBQ0gsTUFBTSxRQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUN6QztBQUFBLElBQ0o7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNYLFVBQVU7QUFBQSxRQUNOLGNBQWM7QUFBQSxRQUNkLGVBQWU7QUFBQSxNQUNuQjtBQUFBLElBQ0o7QUFBQTtBQUFBLElBRUEsUUFBUTtBQUFBO0FBQUEsSUFFUixRQUFRO0FBQUE7QUFBQSxJQUVSLFdBQVc7QUFBQTtBQUFBLElBRVgsbUJBQW1CO0FBQUE7QUFBQSxJQUVuQixjQUFjO0FBQUE7QUFBQSxJQUVkLFdBQVc7QUFBQTtBQUFBO0FBQUEsSUFHWCxpQkFBaUIsQ0FBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLbEIsVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBSVYsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBR1IsT0FBTztBQUFBO0FBQUEsSUFFUCxhQUFhO0FBQUE7QUFBQSxJQUViLHVCQUF1QjtBQUFBLEVBQzNCO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
