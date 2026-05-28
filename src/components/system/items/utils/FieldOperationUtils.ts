import {getDesignFormStore, postRequest, SearchParams, uuid,} from "star-horse-lowcode";
import {computed} from "vue";

const formData = computed(() => getDesignFormStore().formData);
const numField: Array<string> = [
    "minlength",
    "maxLength",
    "step",
    "rows",
    "height",
    "width",
    "columns",
    "gutter",
    "limit",
    "precision",
    "min",
    "max",
    "highThreshold",
    "lowThreshold",
    "multipleLimit",
];

/**
 * 处理默认值
 * @param type
 */
const getDefaultVal = (type: string) => {
    if (type == "number" || type == "slider" || type == "rate") {
        return undefined;
    } else if (type == "checkbox" || type == "transfer") {
        return [];
    } else {
        return "";
    }
};

/**
 * 复制字段
 * @param data
 * @param type
 */
export function fieldCopy(data: any, type: string) {
    const reData = JSON.parse(JSON.stringify(data));
    //如果数据没有索引，则初始化索引
    const ms = getDesignFormStore().getFieldDataIndex();
    const mvData: any = {};
    const tempId = uuid();
    mvData["id"] = "Id" + tempId;
    // console.log(reData);
    /**
     * 处理preps
     */
    const preps = reData.preps;
    mvData["preps"] = {};
    for (const key in preps) {
        const temp = preps[key];
        if (numField.includes(temp.fieldName)) {
            try {
                mvData.preps[temp.fieldName] = parseInt(temp.defaultValues);
            } catch (e) {
                mvData.preps[temp.fieldName] = null;
            }
        } else {
            mvData.preps[temp.fieldName] = temp.defaultValues;
        }
    }
    mvData.preps["id"] = mvData["id"];
    mvData.preps["label"] = reData.itemName;
    mvData.preps["itemNameLabel"] = reData.itemName;
    mvData.preps["name"] = "field_" + tempId.substring(0, 6);
    formData.value[reData.preps.fieldName] = getDefaultVal(reData.itemType);
    mvData["compType"] = type;
    mvData["fieldName"] = mvData.preps["name"];
    mvData["itemType"] = reData.itemType;
    if (reData.itemType == "box") {
        mvData.rowNums = 1;
        mvData.columnNums = 1;
        mvData.preps["elements"] = [
            {
                id: uuid(),
                rowIndex: 1,
                columns: [{id: uuid(), cellVisible: true, colIndex: 1, colspan: 24, items: []}],
            },
        ];
    } else if (reData.itemType == "table") {
        mvData.preps["elements"] = [
            {id: uuid(), colIndex: 1, columns: 1, items: []},
        ];
    } else if (reData.itemType == "dytable") {
        mvData.rowNums = 1;
        mvData.columnNums = 1;
        mvData.preps["elements"] = [
            {
                id: uuid(),
                colIndex: 1,
                columns: [
                    {id: uuid(), cellVisible: true, colIndex: 1, colspan: 1, rowspan: 1, items: []},
                ],
            },
        ];
    } else if (reData.itemType == "condition") {
        mvData.preps["children"] = [];
        mvData.preps["items"] = [];
    }
    return mvData;
}

export function compFieldInit() {
    const url = "/userdb-manage/userdb/dynamicFormItems/getAllByCondition";
    const allFormDataList: Array<any> = [];
    const assignData = (datas: any) => {
        datas.forEach((item: any) => {
            allFormDataList.push({
                name: item.itemName,
                value: item.itemType,
            });
        });
    };

    // 合并为一次请求，查询所有分类的数据
    const queryAllData = () => {
        const params: SearchParams[] = [
            /* {
                    propertyName: "category",
                    operation: "in",
                    value: [1, 2, 3] // 一次性获取所有三个分类的数据
                  },*/
            {
                propertyName: "isDel",
                value: 0,
            },
        ];
        const query = {
            fieldList: params,
            orderBy: [{fieldName: "dataSort", orderBy: "asc"}],
        };
        return new Promise((resolve) => {
            postRequest(url, query).then((res) => {
                resolve(res.data?.data);
            });
        });
    };

    // 发送一次请求，然后在前端进行数据分类
    return queryAllData().then((allData: any) => {
        // 按category字段对数据进行分类
        const containerRes =
            allData?.filter((item: any) => item.category === 2) || [];
        const itemsRes = allData?.filter((item: any) => item.category === 1) || [];
        const selfItemsRes =
            allData?.filter((item: any) => item.category === 3) || [];

        // 处理数据，保持原有逻辑
        assignData(containerRes);
        assignData(itemsRes);
        assignData(selfItemsRes);

        getDesignFormStore().setContainerList(containerRes);
        getDesignFormStore().setFormDataList(itemsRes);
        getDesignFormStore().setSelfFormDataList(selfItemsRes);
        getDesignFormStore().setAllFormDataList(allFormDataList);
    });
}
