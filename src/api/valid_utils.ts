import {SelectOption} from "@/components/types/SearchProps";

const validTypes: any = [
    {message: "邮箱格式非法", value: "email", pattern: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/},
    {message: "手机号格式非法", value: "phone", pattern: /^1[3456789]\d{9}$/},
    {message: "身份证非法", value: "idCard", pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/},
    {message: "只能是数字", value: "digit", pattern: /^[0-9]*$/},
    {message: "IP格式不正确", value: "ip", pattern: /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}$/},
    {message: "URL格式不正确", value: "url", pattern: /^((https?|ftp|file):\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/},
    {message: "域名格式不正确", value: "domain", pattern: /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?$/},
    {message: "结束日期须大于开始日期", value: "endGtStart", pattern: /^[0-9]*$/},
    {message: "只能是字母", value: "letter", pattern: /^[a-zA-Z]*$/},
    {message: "只能是字母或数字", value: "letterDigit", pattern: /^[a-zA-Z0-9]*$/},
    {message: "只能是字母、数字和下划线", value: "letterDigitUnderline", pattern: /^[a-zA-Z0-9_]*$/},
    {message: "只能是字母、数字、下划线和中横线", value: "letterDigitUnderlineHyphen", pattern: /^[a-zA-Z0-9_\-]*$/},
];

export const validRulesList: Array<SelectOption> = [
    {name: "邮箱", value: "email"},
    {name: "手机号", value: "phone"},
    {name: "身份证", value: "idCard"},
    {name: "数字", value: "digit"},
    {name: "字母", value: "letter"},
    {name: "IP", value: "ip"},
    {name: "URL", value: "url"},
    {name: "域名", value: "domain"},
    {name: "结束日期须大于开始日期", value: "endGtStart"},
    {name: "字母或数字", value: "letterDigit"},
    {name: "字母、数字和下划线", value: "letterDigitUnderline"},
    {name: "字母、数字、下划线和中横线", value: "letterDigitUnderlineHyphen"},
    {name: "自定义", value: "custom"}
];

/**
 * 获取验证类型
 * @param type
 */
export function getValidType(type: any) {
    for (let i = 0; i < validTypes.length; i++) {
        if (validTypes[i].value === type) {
            return validTypes[i]
        }
    }
    return {}
}
