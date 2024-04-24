import {createPinia} from "pinia";
import piniaPluginPersist from 'pinia-plugin-persist';
import {App} from "vue";

const piniaInstance = createPinia();
piniaInstance.use(piniaPluginPersist);
export const installStore = (app: App<Element>) => {
    app.use(piniaInstance);
}
export default piniaInstance;