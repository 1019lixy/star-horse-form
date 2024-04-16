export default {
    locale: localStorage.getItem('lang') || 'zh',        //默认显示的语言
    messages: {
        zh: require('./zh.js'),    //引入语言文件
        en: require('./en.js')
    }
}
