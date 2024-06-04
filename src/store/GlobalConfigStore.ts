import {defineStore} from "pinia";
import {Config} from "@/api/settings";

export const GlobalConfig: any = defineStore("GlobalConfig", {
    state: () => {
        return {
            configFormInfo: {} as Object,
        }
    },
    getters: {
        /**
         * 获取数据
         * @param state
         */
        getConfigFormInfo: (state: any) => {
            return state.configFormInfo;
        },

    },
    actions: {
        /**
         *设置数据
         * @param data
         */
        setConfigFormInfo(data: Object) {
            this.configFormInfo = data;
            localStorage.setItem("starHorseConfigInfo", JSON.stringify(data));

            Config.buttonStyle.value = data.buttonShowType || "dropdown";
            console.log(data,Config.buttonStyle.value);
            if (data.themeColor) {
                document.documentElement.style.setProperty('--star-horse-style', data.themeColor)
                document.documentElement.style.setProperty('--el-color-primary', data.themeColor)
            }
        },

        /**
         * 清除所有Tab
         */
        clearAll() {
            let _this = this;
            _this.configFormInfo = {
                tagsView: 'yes'
            };
            let starHorseConfigInfo = localStorage.getItem("starHorseConfigInfo");
            if (starHorseConfigInfo) {
                _this.setConfigFormInfo(JSON.parse(starHorseConfigInfo));
            }
        },
    }
});
