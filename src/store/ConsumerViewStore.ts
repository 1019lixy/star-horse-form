import {defineStore} from "pinia";
export const ConsumerView: any = defineStore("ConsumerView", {
    state: () => {
        return {
            tableList: {} as Object,
            dbConfigId: ""
        }
    },
    getters: {
        /**
         * 获取表数据
         * @param state
         */
        getTableList: (state: any) => {
            return state.tableList;
        },
        getDbConfigId: (state: any) => {
            return state.dbConfigId;
        }
    },
    actions: {
        /**
         *赋值
         * @param tableName 表名
         * @param data 字典列表
         */
        addTableInfo(tableName: string, data: Object | Array<object>) {
            this.tableList[tableName] = data;
        },
        /**
         * 设置数据库配置id
         *
         * @param dbConfigId
         */
        setDbConfigId(dbConfigId: string) {
            this.dbConfigId = dbConfigId;
        },
        /**
         * 根据表名获取字段信息
         * @param tableName 表名
         */
        getTableInfo(tableName: string) {
            return this.tableList[tableName];
        },
        /**
         * 清除所有Tab
         */
        clearAll() {
            this.tableList = {};
        },
    },
    persist: true
});
