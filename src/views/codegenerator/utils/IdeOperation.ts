import { postRequest } from "@/api/star_horse.ts";
import { SelectOption } from "@/components/types/SearchProps";

const templateListUrl: string = "/code-generator/dynamic/code/templateList";
const loadTemplateUrl: string = "/code-generator/dynamic/code/loadTemplate";

/**
 * 加载模板列表
 */
export async function templateList() {
  const optionList: SelectOption[] = [];
  await postRequest(templateListUrl, {}).then((res: any) => {
    if (res.data.code) {
      console.log("加载模板列表异常:" + res.data.cnMessage);
    } else {
      const redata = res.data.data;
      for (const key in redata) {
        optionList.push({
          name: redata[key],
          value: key
        });
      }
    }
  });
  return optionList;
}

/**
 * 加载模板信息
 * @param templateCode 模板编码
 * @param packageName 包名
 * @param className 类名
 */
export async function loadTemplate(templateCode: string, packageName: string, className: string) {
  let sourceCode: string = "";
  await postRequest(loadTemplateUrl, {
    templateCode,
    packageName,
    className
  }).then((res: any) => {
    if (res.data.code) {
      console.log("加载模板代码异常:" + res.data.cnMessage);
    } else {
      sourceCode = res.data.data;
    }
  });
  return sourceCode;
}
