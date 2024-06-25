import {defineStore} from "pinia";
import {warning} from "@/utils/message";

export const DynamicForm: any = defineStore("DynamicForm", {
    state: () => {
        return {
            dataForm: {} as any,
            selectData: null as any,
            dataId: null as any
        }
    },
    getters: {
        /**
         * 获取选中的数据
         * @param state
         */
        getSelectData: (state: any) => {
            return state.selectData;
        },
        /**
         * 获取数据
         * @param state
         */
        getDataForm: (state: any) => {
            return state.dataForm;
        },
        /**
         * 获取数据Id
         * @param state
         */
        getDataId: (state: any) => {
            return state.dataId;
        }
    },
    actions: {
        /**
         *选中数据
         * @param data
         */
        setSelectData(data: Object | Array<object>) {
            this.selectData = data;
        },
        /**
         * 赋值
         * @param dataId 数据Id
         */
        setDataId(dataId: Number | String) {
            this.dataId = dataId;
        },
        /**
         * 存数据
         * @param data
         */
        setDataForm(data: object) {
            this.dataForm = {...data};
        },
        /**
         * 向集合添加数据
         * @param batchName
         * @param data
         */
        addBatchData(batchName: string, data: any) {
            let _this = this;
            let batchDatas: Array<any> = _this.dataForm[batchName] as Array<any>;
            if (!batchDatas || batchDatas.length == 0) {
                _this.dataForm[batchName] = [];
                batchDatas = _this.dataForm[batchName];
            }
            batchDatas.push(data);
        },
        /**
         * 清除视图
         * @param fieldName
         */
        delField(fieldName: string) {
            delete this.dataForm[fieldName];
        },
        /**
         * 删除集合内指定的所有属性
         * @param batchName 集合名称
         * @param fieldName  属性名称
         * @param rowIndex 要删除属性所在的行 从1开始  -1 表示删除所有的属性
         */
        delBatchField(batchName: string, fieldName: string, rowIndex: number = -1) {
            let batchDatas = this.dataForm[batchName];
            if (!batchDatas || batchDatas.length == 0) {
                return;
            }
            if (batchDatas instanceof Object) {
                delete batchDatas[fieldName];
            } else {
                if (rowIndex > 0) {
                    delete batchDatas[rowIndex - 1][fieldName];
                } else {
                    batchDatas.forEach((item: any) => {
                        delete item[fieldName];
                    });
                }
            }
        },
        /**
         * 设置指定属性的值
         * @param fieldName
         * @param value
         */
        addOrUpdateField(fieldName: string, value: any) {
            this.dataForm[fieldName] = value;
        },
        /**
         * 在集合里新增或者修改属性的值
         * @param batchName 集合名称
         * @param fieldName 属性名称
         * @param value 值
         * @param rowIndex 集合索引 从1开始 -1 表示在所有的数据中新增或者修改指定的值
         */
        batchAddOrUpdateField(batchName: string, fieldName: string, value: any, rowIndex: number = -1) {
            let batchDatas = this.dataForm[batchName];
            if (!batchDatas || batchDatas.length == 0) {
                this.dataForm[batchName] = [];
                batchDatas = this.dataForm[batchName];
            }
            if (batchDatas instanceof Object) {
                batchDatas[fieldName] = value;
            } else {
                if (rowIndex > 0) {
                    batchDatas[rowIndex - 1][fieldName] = value;
                } else {
                    batchDatas.forEach((item: any) => {
                        item[fieldName] = value;
                    });
                }
            }
        },
        /**
         * 重命名属性，
         * @param sourceField 原来的属性名
         * @param distField 新的属性名
         * @param newValue  新的值
         */
        renameField(sourceField: string, distField: string, newValue?: any) {
            if (Object.keys(this.dataForm).includes(distField)) {
                warning("新的属性名已存在，不能进行修改");
                return;
            }
            let bakeValue = this.dataForm[sourceField];
            delete this.dataForm[sourceField];
            this.dataForm[distField] = newValue ? newValue : bakeValue;
        },
        /**
         * 重命名集合属性，
         * @param batchName 集合名称
         * @param sourceField 原来的属性名
         * @param distField 新的属性名
         * @param newValue  新的值
         * @param rowIndex 指定重命名集合索引 从1开始 ，-1 表示重命名所有属性
         */
        batchRenameField(batchName: string, sourceField: string, distField: string, newValue?: any, rowIndex: number = -1) {
            let batchDatas = this.dataForm[batchName];
            if (!batchDatas || batchDatas.length == 0) {
                this.batchAddOrUpdateField(batchName, distField, newValue, rowIndex);
                return;
            }
            let dataFun = (data: any, sourceField: string, distField: string, newValue?: any) => {
                if (Object.keys(data).includes(distField)) {
                    warning("新的属性名已存在，不能进行修改");
                    return false;
                }
                let bakeValue: any = data[sourceField];
                delete this.dataForm[sourceField];
                this.dataForm[distField] = newValue || bakeValue;
                return true;
            };
            if (batchDatas instanceof Object) {
                dataFun(batchDatas, sourceField, distField, newValue);
            } else {
                if (rowIndex > 0) {
                    dataFun(batchDatas[rowIndex - 1], sourceField, distField, newValue);
                } else {
                    batchDatas.forEach((item: any) => {
                        let result = dataFun(item, sourceField, distField, newValue);
                        if (!result) {
                            return false;
                        }
                    });
                }
            }
        },
        /**
         * 获取指定属性的值
         * @param fieldName 属性名称
         */
        getFieldValue(fieldName: string) {
            return this.dataForm[fieldName];
        },
        /**
         * 获取集合指定属性的数据
         * @param batchName 集合名称
         * @param fieldName 属性名称
         * @param rowIndex 指定获取集合索引数据 从1开始，-1表示获取所有
         */
        getBatchFieldValue(batchName: string, fieldName: string, rowIndex: number = -1) {
            let batchDatas = this.dataForm[batchName];
            if (!batchDatas) {
                return;
            }
            if (batchDatas instanceof Object) {
                return batchDatas[fieldName];
            } else {
                if (rowIndex > 0) {
                    return batchDatas[rowIndex - 1][fieldName];
                } else {
                    return batchDatas.map((item: any) => item[fieldName]);
                }
            }
        },
        /**
         * 清除所有Tab
         */
        clearAll() {
            this.dataForm = {};
        },
    }
});
