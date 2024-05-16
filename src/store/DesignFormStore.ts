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
            /**
             * 表单信息
             */
            formInfo: {},

            /**
             * 设计器里得组件列表
             */
            compList: [] as Array<any>,
            /**
             * 表达属性列表
             */
            formFieldList: {},
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
             * 是否编辑
             */
            isEdit: false,
            /**
             * 当前选中元素的属性
             */
            currentFormPreps: {},
            /**
             * 当前拖动中的元素
             */
            draggingItem: {},
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
        getFormInfo(state) {
            return state.formInfo;
        },
        getCompList(state) {
            return state.compList;
        },
        getFormFieldList(state) {
            return state.formFieldList;
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
        }
    },
    actions: {
        /**
         * 激活组件的数下
         * @param data 数据
         * @param itemType 数据类型
         * @param parentCompType 父组件类型
         */
        selectItem(data: any, itemType: string, parentCompType: string) {
            console.log(data, itemType, parentCompType);
            let _this = this;
            _this.currentCompCategory = data.compType;
            _this.currentItemId = data?.id;
            _this.parentCompType = parentCompType;
            _this.currentItemType = itemType || data.itemType;
            _this.currentFormPreps = data.preps || data;
        },
        /**
         * 设置表单信息
         * @param formInfo
         */
        setFormInfo(formInfo: any) {
            this.formInfo = formInfo;
        },
        setCompList(compList: Array<any>) {
            this.compList = compList;
        },
        setFormFieldList(formFieldList: any) {
            this.formFieldList = formFieldList
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
         * 清除所有数据
         */
        clearAll(initComp: boolean = true) {
            let _this = this;
            let ms = new Date().getTime();
            _this.isEdit = true;
            _this.currentFormPreps = {};
            _this.currentItemType = "";
            _this.currentComp = {};
            _this.currentItemId = "";
            _this.currentItemType = "";
            _this.parentCompType = "";
            _this.formInfo = {
                rules: "",
                inline: "no",
                labelPosition: "left",
                labelWidth: "",
                labelSuffix: "",
                hideRequiredAsterisk: "no",
                requireAsteriskPosition: "left",
                showMessage: "yes",
                inlineMessage: "no",
                statusIcon: "no",
                createTable: "yes",
                validateOnRuleChange: "yes",
                size: "small",
                disabled: "no",
                scrollToError: "no",
                formId: "id" + ms,
                tbName: "tb" + ms
            };
            _this.compList = [];
            _this.formFieldList = {index: 1};
            if (initComp) {
                const url = "/userdb-manage/userdb/dynamicFormItems/getAllByCondition";
                const initContainer = async () => {
                    let params: SearchParams[] = [{
                        propertyName: "category",
                        value: 2
                    }];
                    let {data, error} = await loadData(url, params);
                    _this.containerList = data;
                };
                const initItems = async () => {
                    let params: SearchParams[] = [{
                        propertyName: "category",
                        value: 1
                    }];
                    let {data, error} = await loadData(url, params);
                    _this.formDataList = data;
                };
                const initSelfItems = async () => {
                    let params: SearchParams[] = [{
                        propertyName: "category",
                        value: 3
                    }];
                    let {data, error} = await loadData(url, params);
                    _this.selfFormDataList = data;
                };
                const init = async () => {
                    await initContainer();
                    await initItems();
                    await initSelfItems();

                };
                init();
            }
        },
    }
});