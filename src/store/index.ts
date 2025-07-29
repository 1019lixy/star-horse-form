import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persistedstate';
// import piniaPluginReset from "pinia-plugin-reset";

const piniaCompInstance = createPinia();
piniaCompInstance.use(piniaPersist);
// piniaCompInstance.use(piniaPluginReset);
// export const installStore = (app: App<Element>) => {
//     app.use(piniaInstance);
// }
export default piniaCompInstance;
