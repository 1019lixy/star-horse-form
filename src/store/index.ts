import {createPinia} from "pinia";
import piniaPersist from "pinia-plugin-persistedstate";

const piniaCompInstance = createPinia();
piniaCompInstance.use(piniaPersist);
// export const installStore = (app: App<Element>) => {
//     app.use(piniaInstance);
// }
export default piniaCompInstance;
