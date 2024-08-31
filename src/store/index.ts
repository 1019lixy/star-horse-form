import {createPinia} from "pinia";
import piniaPersist from 'pinia-plugin-persist';

const piniaInstance = createPinia();
piniaInstance.use(piniaPersist);
// export const installStore = (app: App<Element>) => {
//     app.use(piniaInstance);
// }
export default piniaInstance;
