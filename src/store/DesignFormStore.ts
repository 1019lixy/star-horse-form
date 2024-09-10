import {defineStore} from "pinia";
import {SearchParams} from "@/components/types/Params";
import {loadData} from "@/api/sh_api.ts";

export const DesignForm: any = defineStore("DesignForm", {
    state: () => {
        return {
            /**
             * 容器组件列表
             */
            containerList: [],
            /**
             * 表单组件列表
             */
            formDataList: [],
            /**
             * 自定义组件列表
             */
            selfFormDataList: [],
            allFormDataList: [] as Array<any>,
            /**
             * 表单信息
             */
            formInfo: {},
            /**
             * 设计器里的组件列表
             */
            compList: [] as Array<any>,
            /**
             * 表单属性列表
             */
            formData: {},
            /**
             * 当前组件
             */
            currentComp: {} || [],
            /**
             * 当前组件的类型
             */
            currentItemType: "",
            /**
             * 当前组件类别
             */
            currentCompCategory: "",
            /**
             * 父组件类型
             */
            parentCompType: "",
            /**
             * 当前组件Id
             */
            currentItemId: "",
            /**
             * 当前子组件Id
             */
            currentSubItemId: "",
            /**
             * 是否编辑
             */
            isEdit: false,
            refresh: 0,
            /**
             * 当前选中元素的属性
             */
            currentFormPreps: {},
            /**
             * 当前拖动中的元素
             */
            draggingItem: {},
            /**
             *历史记录
             */
            historyRecord: {
                index: -1,
                maxStep: 20,
                datas: [],
            },
        }
    },
    getters: {
        getContainerList(state) {
            return state.containerList;
        },
        getFormDataList(state) {
            return state.formDataList;
        },
        getSelfFormDataList(state) {
            return state.selfFormDataList;
        },
        getAllFormDataList(state) {
            return state.allFormDataList;
        },
        getFormInfo(state) {
            return state.formInfo;
        },
        getCurrentSubItemId(state) {
            return state.currentSubItemId;
        },
        getCompList(state) {
            return state.compList;
        },
        getFormData(state) {
            return state.formData;
        },
        getCurrentComp(state) {
            return state.currentComp;
        },
        getCurrentItemType(state) {
            return state.currentItemType;
        },
        getParentCompType(state) {
            return state.parentCompType;
        },
        getCurrentItemId(state) {
            return state.currentItemId;
        },
        getIsEdit(state) {
            return state.isEdit;
        },
        getCurrentFormPreps(state) {
            return state.currentFormPreps;
        },
        getDraggingItem(state) {
            return state.draggingItem;
        },
        getCurrentCompCategory(state) {
            return state.currentCompCategory;
        },
        getRefresh(state) {
            return state.refresh;
        }
    },
    actions: {
        /**
         * 添加历史记录
         * @param reOrUnDoFlag 是否点击按钮时触发
         */
        addHistoryRecord(reOrUnDoFlag: boolean) {
            const _this = this;
            if (reOrUnDoFlag || _this.compList.length == 0) {
                return;
            }

            const record = _this.historyRecord;
            const recordData: any = {
                complist: _this.compList,
                currentCompCategory: _this.currentCompCategory,
                currentItemId: _this.currentItemId,
                parentCompType: _this.parentCompType,
                currentItemType: _this.currentItemType,
                currentFormPreps: _this.currentFormPreps,
            }
            record.index = -1;
            record.datas.splice(0, 0, JSON.stringify(recordData));
            //数据只存20条，当大于20条时，删除最旧的一条
            if (record.datas.length > record.maxStep) {
                record.datas.splice(record.datas.length - 1, 1);
            }
        },
        /**
         * 下一步
         */
        redo() {
            const record = this.historyRecord;
            //数据本身就是最新的
            if (record.index < 0) {
                return;
            }
            record.index = record.index - 1;
            this.reAndUnDo();

        },

        reAndUnDo() {
            const _this = this;
            const record = this.historyRecord;
            const data = JSON.parse(record.datas[record.index]);
            this.setCompList(data.complist);
            _this.currentCompCategory = data.currentCompCategory;
            _this.currentItemId = data.currentItemId;
            _this.parentCompType = data.parentCompType;
            _this.currentItemType = data.currentItemType;
            _this.currentFormPreps = data.currentFormPreps;
        },

        /**
         * 上一步
         */
        undo() {
            const record = this.historyRecord;
            console.log(record);
            record.index = record.index < 0 ? 1 : record.index + 1;
            //上一步大于已存在的数据量
            if (record.index > record.datas.length) {
                record.index = record.datas.length - 1;
            }
            //达到最大步骤，取允许的最大数据
            if (record.index > record.maxStep) {
                record.index = record.maxStep;
            }
            this.reAndUnDo();
        },
        /**
         * 激活组件的数下
         * @param data 数据
         * @param itemType 数据类型
         * @param parentCompType 父组件类型
         */
        selectItem(data: any, itemType: string, parentCompType: string) {
            const _this = this;
            _this.currentCompCategory = data.compType;
            _this.currentItemId = data?.id;
            _this.parentCompType = parentCompType;
            _this.currentItemType = itemType || data.itemType;
            _this.currentFormPreps = data.preps || data;
        },
        /**
         * 刷新页面
         */
        setRefresh() {
            this.refresh++;
        },
        /**
         * 选中子组件
         * @param subItemId
         */
        setSubItemId(subItemId: string) {
            this.currentSubItemId = subItemId;
        },
        /**
         * 设置表单信息
         * @param formInfo
         */
        setFormInfo(formInfo: any) {
            const _this = this;
            _this.formInfo = {
                ..._this.formInfo,
                ...formInfo
            };
        },
        setCompList(compList: Array<any>) {
            this.compList = compList;
        },

        /**
         * 手动添加组件
         * @param comp
         */
        addComp(comp: any) {
            //如果已存在，则要过滤掉,不能重复添加
            const _this = this;
            if (comp instanceof Array) {
                _this.compList = [..._this.compList, ...comp];
            } else {
                _this.compList.push(comp);
            }
        },
        setFormData(formData: any) {
            this.formData = formData
        },
        setIsEdit(isEdit: boolean) {
            this.isEdit = isEdit;
        },
        setCurrentComp(currentComp: object) {
            this.currentComp = currentComp;
        },
        setCurrentItemType(currentItemType: string) {
            this.currentItemType = currentItemType;
        },
        setParentCompType(parentCompType: string) {
            this.parentCompType = parentCompType;
        },
        setCurrentItemId(currentItemId: string) {
            this.currentItemId = currentItemId;
        },
        setCurrentFormPreps(currentFormPreps: any) {
            this.currentFormPreps = currentFormPreps["preps"] || currentFormPreps;
        },
        /**
         * 正在拖动中的组件
         * @param draggingItem
         */
        setDraggingItem(draggingItem: any) {
            this.draggingItem = draggingItem;
        },
        /**
         * 删除数据
         */
        removePromise() {
            const _this = this;
            const comps = _this.compList;
            for (let i = 0; i < comps.length; i++) {
                const temp = comps[i];
                if (temp instanceof Promise) {
                    temp.then(res => {
                        if (res instanceof Array) {
                            comps.splice(i, 1, ...res);
                        } else {
                            comps.splice(i, 1, res);
                        }
                    })
                }
            }
            // _this.compList = [...JSON.parse(JSON.stringify(comps))];
        },
        /**
         * 清除所有数据
         */
        clearAll(initComp: boolean = true) {
            const _this = this;
            const ms = new Date().getTime();
            _this.isEdit = true;
            _this.currentFormPreps = {};
            _this.currentItemType = "";
            _this.currentComp = {};
            _this.currentItemId = "";
            _this.currentItemType = "";
            _this.parentCompType = "";
            _this.currentCompCategory = "";
            _this.formInfo = {
                rules: "",
                inline: "N",
                labelPosition: "left",
                labelWidth: "",
                labelSuffix: "",
                hideRequiredAsterisk: "N",
                requireAsteriskPosition: "left",
                showMessage: "Y",
                inlineMessage: "N",
                statusIcon: "N",
                primaryKeyPolicy: "manual",
                createTable: "Y",
                validateOnRuleChange: "Y",
                size: "default",
                disabled: "N",
                scrollToError: "N",
                formId: "id" + ms,
                tbName: "tb" + ms
            };
            _this.compList = [];
            _this.formData = {index: 1};
            _this.historyRecord = {
                index: -1,
                maxStep: 20,
                datas: []
            };
            if (initComp) {
                const url = "/userdb-manage/userdb/dynamicFormItems/getAllByCondition";
                const initContainer = async () => {
                    const params: SearchParams[] = [{
                        propertyName: "category",
                        value: 2
                    }, {
                        propertyName: "isDel",
                        value: 0
                    }];
                    const query = {
                        fieldList: params,
                        orderBy: [{fieldName: "dataSort", ascOrDesc: "asc"}]
                    }
                    const result = await loadData(url, query);
                    _this.containerList = result.data;
                };
                const initItems = async () => {
                    const params: SearchParams[] = [{
                        propertyName: "category",
                        value: 1
                    }, {
                        propertyName: "isDel",
                        value: 0
                    }];
                    const query = {
                        fieldList: params,
                        orderBy: [{fieldName: "dataSort", ascOrDesc: "asc"}]
                    }
                    const result = await loadData(url, query);
                    _this.formDataList = result.data;
                };
                const initSelfItems = async () => {
                    const params: SearchParams[] = [{
                        propertyName: "category",
                        value: 3
                    }, {
                        propertyName: "isDel",
                        value: 0
                    }];
                    const query = {
                        fieldList: params,
                        orderBy: [{fieldName: "dataSort", ascOrDesc: "asc"}]
                    }
                    const result = await loadData(url, query);
                    _this.selfFormDataList = result.data;
                };
                const init = async () => {
                    const _this = this;
                    await initContainer();
                    await initItems();
                    await initSelfItems();
                    const temp: Array<any> = [];
                    if (_this.formDataList) {
                        temp.push(..._this.formDataList);
                    }
                    if (_this.selfFormDataList) {
                        temp.push(..._this.selfFormDataList);
                    }
                    temp.forEach((item: any) => {
                        _this.allFormDataList.push({
                            name: item.itemName,
                            value: item.itemType
                        })
                    });
                };
                init();
            }
        },
    }
});
