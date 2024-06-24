# StarHorseDevops UI
## 功能描述
> 1、认证模块
>>该模块主要有业务系统模块、部门模块、菜单配置模块、角色模块、权限模块、用户模块、审计模块和白名单模块；
>><br/>截止目前认证模块个功能已完成并可支持生产运行。
>>
>2、数据查询模块
>>该模块的主要业务模块有：数据库配置、数据库授权、数据查询、在线建表、数据备份和还原。
>><br/>截止目前该模块还剩下在线建表、数据备份和还原模块没有完成。
>>
>3、动态建模模块
>>该模块主要业务模块有：可视化表单、数据源表单、动态视图。
>><br/>截止目前该模块已完成所有主体功能，目前还存在表单组件动态数据源问题还没有解决。
>>
>4、持续集成
>>
>5、持续部署
>>
>6、在线运维
>
### 数据
#### 常见问题
* 刷新浏览器页面丢失问题
> location / {
> try_files $uri $uri/ @router;
> index index.html index.htm;
> }
> #对应上面的@router，主要原因是路由的路径资源并不是一个真实的路径，所以无法找到具体的文件
> #因此需要rewrite到index.html中，然后交给路由在处理请求资源
> location @router {
> rewrite ^.*$ /index.html last;
> }
>
>
>
> codemirrors 升级 升级前依赖备份：
"codemirror": "5.64.0",
"codemirror-editor-vue3": "^2.3.0",
> js-beautify": "^1.14.7",
> dev 依赖
"@codemirror/buildhelper": "^1.0.0",
"@types/codemirror": "^5.60.9",
"@types/js-beautify": "^1.14.0",
>
>  "@codemirror/gutter": "^0.19.9",
"@codemirror/history": "^0.19.2",
"@codemirror/lang-java": "^6.0.1",
"@codemirror/lang-javascript": "^6.2.1",
"@codemirror/lang-python": "^6.1.3",
"@codemirror/lang-sql": "^6.5.4",
"@codemirror/theme-one-dark": "^6.1.2",
"codemirror": "^6.0.1",
##package 中插件版本检测工具
npm install -g npm-check-updates
ncu -- 检查最新版本
ncu -u  更新版本
ncu -m  检查devDependencies 中的版本
## 开发清单
1、目前系统没有对外提供网关接口，第三方数据没法通过http方式或者MQ方式进来；
如果开发此功能，需考虑字段映射，以及业务关系映射（一个接口处理关联表的数据信息）
2、当前运维模块需要由Python实现，由于是第一个即将实践的Python项目，技术选型需要做更多调研
3、Ansible 目前处于半吊子水平，对Windows这块的管理目前还没有调通，
4、虽然兼容性还不错，数据量大的时候怎么考虑数据的查询性能
5、动态建模，已支持mysql/mariadb,postgrel,oracle,sqlserver，目前关联数据还没有处理
6、现有后端需要构建一个企业总线模块为第三方接口交互做解耦，后期无需刻意去处理已有的业务模块
7、对于流水线，虽然在规划内，但是近期可能无法去实现
8、手动部署工具需进一步完善，JDK升级后不能正确打印日志
9、流程引擎 虽然有简单的实现，但没有具体的业务绑定，后面需要与动态建模绑定起来
10、脚本，这属于是运维的必须品，需要和运维模块同步进行
11、数据库在线备份需要进一步处理
###知识点
动态绑定事件 v-on:["事件名称"]
