import { loadData, SelectOption } from "star-horse-lowcode";

const validUrl: string = "/userdb-manage/redirect/valid";

/**
 * 获取打印机列表
 */
export async function printerList(): Promise<Array<SelectOption>> {
  const getData = {
    type: "getPrinter",
  };
  const options: Array<SelectOption> = [];
  //创建一个实例
  const ws = new WebSocket("ws://127.0.0.1:55333");
  //用于指定连接成功后的回调函数
  ws.onopen = (_evt) => {
    console.log("Connection open ...");
    ws.send(JSON.stringify(getData));
  };
  //用于指定连接关闭后的回调函数
  ws.onclose = (_event) => {
    // let _code: number = event.code;
    // let _reason: string = event.reason;
    // let _wasClean: boolean = event.wasClean;
  };
  //
  return await new Promise((resolve, reject) => {
    //用于指定收到服务器数据后的回调函数
    ws.onmessage = (event) => {
      const data = event.data;
      const printers = JSON.parse(data)["data"];
      if (printers) {
        printers.forEach((item: any) => {
          options.push({ name: item, value: item });
        });
        resolve(options);
      } else {
        reject("获取打印机失败");
      }
    };
  });
}

/**
 * 验证接口，并取回数据
 * @param url
 * @param params 参数
 * @param dataType 数据类型 FORM,JSON 默认JSON
 * @param httpMethod 接口请求方式 POST,GET,PUT,DELETE
 */
export async function validDataUrl(
  url: string,
  params?: any,
  dataType: string = "JSON",
  httpMethod: string = "POST",
) {
  const checkParams: any = {
    url,
    httpMethod: httpMethod.toUpperCase(),
    dataType,
    params: params,
  };
  const data = await loadData(validUrl, checkParams);
  return { ...data };
}
