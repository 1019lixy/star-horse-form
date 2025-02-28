/**
 * 解析动态表单中的子节点数据是否需要合并到父节点中
 * @param props
 * @param dataForm
 */
export function dynamicFormAnalysis(props: any, dataForm: any) {
  //props.globalCondition 有属性不是子表，需要额外封装
  const globalCondition = props.globalCondition;
  let dataList: any = [] | {};
  if (!globalCondition || globalCondition.length == 0) {
    return dataList;
  }
  for (const key in globalCondition) {
    const temp = globalCondition[key];
    //如果非子表
    if ("N" == temp.subFormFlag) {
      const data = dataForm[temp.tableName];
      delete dataForm[temp.tableName];
      if (data instanceof Array) {
        data.forEach((item) => {
          dataList.push({ ...item, ...dataForm });
        });
      } else {
        dataList = { ...dataList, ...data, ...dataForm };
      }
    }
  }
}
