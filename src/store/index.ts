import {createPinia} from "pinia";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
const piniaInstance = createPinia();
piniaInstance.use(piniaPluginPersistedstate);
// export const installStore = (app: App<Element>) => {
//     app.use(piniaInstance);
// }
export default piniaInstance;
