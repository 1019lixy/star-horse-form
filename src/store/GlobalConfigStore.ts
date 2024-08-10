import {defineStore} from "pinia";
import {Config} from "@/api/settings.ts";

export const GlobalConfig: any = defineStore("GlobalConfig", {
    state: () => {
        return {
            configFormInfo: {} as any,
        }
    },
    getters: {
        /**
         * 获取数据
         * @param state
         */
        getConfigFormInfo: (state: any) => {
            if(Object.keys(state.configFormInfo).length==0){
                state.actions.clearAll();
            }
            return state.configFormInfo;
        },
    },
    actions: {
        /**
         *设置数据
         * @param data
         */
        setConfigFormInfo(data: any) {
            this.configFormInfo = data;
            localStorage.setItem("starHorseConfigInfo", JSON.stringify(data));
            Config.buttonStyle.value = data.buttonShowType || "dropdown";
            console.log(data, Config.buttonStyle.value);
            if (data.themeColor) {
                document.documentElement.style.setProperty('--star-horse-style', data.themeColor)
                document.documentElement.style.setProperty('--el-color-primary', data.themeColor)
                document.documentElement.style.setProperty('--el-select-input-color', data.themeColor)
                document.documentElement.style.setProperty('--el-pagination-button-color', data.themeColor)
                document.documentElement.style.setProperty('--el-tree-expand-icon-color', data.themeColor)
            }
        },
        /**
         * 清除所有Tab
         */
        clearAll() {
            let _this = this;
            _this.configFormInfo = {
                tagsView: 'Y',
                position: "left",
                menusCfg: "tradition",
            };
            let starHorseConfigInfo = localStorage.getItem("starHorseConfigInfo");
            if (starHorseConfigInfo) {
                _this.setConfigFormInfo(JSON.parse(starHorseConfigInfo));
            }
        },
    }
});
