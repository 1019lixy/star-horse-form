/**
 * 检查对象是否需要创建
 * @param dataForm 数据对象
 * @param item 表单属性
 * @param index 索引
 * @param parentIndex 父索引
 * @param prefix 前缀
 */
export function checkObject(dataForm: any, item: any, index: number, parentIndex: number, prefix: string) {
    return index + 1;
}


export function getFormData(item: any, dataForm: any, prefix: string, parentIndex: number, index: number) {
    if (item.subFormFlag == "Y") {
        if (item && item.objectName) {
            console.log("checkObject", item.objectName);
            if (!Object.keys(dataForm).includes(item.objectName)) {
                dataForm[item.objectName] = [{}];
            }
        }
        let dataIndex = getDataIndex(item, prefix, parentIndex, index);
        let len = dataForm[item.objectName].length;
        if (dataIndex >= len) {
            dataForm[item.objectName].push({});
            dataIndex = len - 1;
        }
        return dataForm[item.objectName][dataIndex];
    }
    return dataForm;
}

/**
 * 获取表单数据索引
 * @param data
 * @param prefix
 * @param parentIndex
 * @param index
 */
export function getDataIndex(data: any, prefix: string, parentIndex: number, index: number) {
    let pronPrefix: number = 0;
    if (prefix && prefix.length > 0) {
        if (data.subFormFlag == "Y") {
            pronPrefix = (parentIndex > -1 ? 0 : index);
        } else {
            pronPrefix = parentIndex;
        }
    } else if (data.subFormFlag == "Y") {
        //如果父表大于0,说明当前是父表的子表，应该用父表的索引
        pronPrefix = parentIndex > 0 ? parentIndex : index;
    } else {
        pronPrefix = -1;
    }
    return pronPrefix;
}



