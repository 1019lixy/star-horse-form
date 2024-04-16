import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import progress from 'vite-plugin-progress'
import vueJsx from "@vitejs/plugin-vue-jsx"
import inject from "@rollup/plugin-inject"
import {resolve} from "path";
import {createSvgIconsPlugin} from 'vite-plugin-svg-icons'

const cmsHost = "http://localhost:8848/"
const systemHost = "http://localhost:8749/"
const workflowHost = "http://localhost:8899/"
const continusHost = "http://localhost:8859/"
const dbSearchHost = "http://localhost:7759/"
const userDbHost = "http://localhost:7758/"
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8880,
    host: true,
    open: true,
    hmr: true,
    proxy: {
      "/system-config-dev": {
        target: systemHost,
        changeOrigin: true,
        withCredentials: true,
        ws: true
      },
      "/system-config": {
        target: systemHost,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/system-config/, '/system-config-dev'),
        withCredentials: true,
        ws: true
      },

      "/lee-cms": {
        target: cmsHost,
        changeOrigin: true,
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
        rewrite: (path) => path.replace(/^\/dbsearch-manage/, '/dbsearch-manage-dev'),
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
        rewrite: (path) => path.replace(/^\/userdb-manage/, '/userdb-manage-dev'),
        ws: true
      },

    }
  },
  plugins: [
    vue({
      script: {
        // 开启 defineModel
        defineModel: true
      }
    }),
    progress(),
    vueJsx({}),
    inject({
      $: "jquery", // 这里会自动载入 node_modules 中的 jquery
      jQuery: "jquery",
      "windows.jQuery": "jquery",
      "windows.$": "jquery",
    }),
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/icons')],
      symbolId: 'icon-[dir]-[name]',
    }),
    /* AutoImport({
         resolvers:[ElementPlusResolver]
     }),*/
    /*  Components({
          resolvers:[ElementPlusResolver]
      })*/
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    },
    extensions: ['.js', '.vue', '.json', '.ts',".jsx"]
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html")
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
    terserOptions: {},
    //设置为 false 来禁用将构建后的文件写入磁盘
    write: true,
    //默认情况下，若 outDir 在 root 目录下，则 Vite 会在构建时清空该目录。
    emptyOutDir: true,
    //启用/禁用 brotli 压缩大小报告
    brotliSize: true,
    //chunk 大小警告的限制
    chunkSizeWarningLimit: 500
  }
})
