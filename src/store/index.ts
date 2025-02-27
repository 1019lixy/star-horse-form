import {createPinia} from 'pinia';
import piniaPersist from 'pinia-plugin-persistedstate';

const piniaInstance = createPinia();
piniaInstance.use(piniaPersist);
// export const installStore = (app: App<Element>) => {
//     app.use(piniaInstance);
// }
export default piniaInstance;
