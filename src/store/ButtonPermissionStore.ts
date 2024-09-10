import {defineStore} from "pinia";
import {ref} from "vue";
import {RouteLocationNormalized} from "vue-router";
import {postRequest, userLogout} from "@/api/star_horse.ts";
import {getUserInfo} from "@/utils/auth.ts";
import {warning} from "@/utils/message.ts";

/**
 * 用户权限控制
 */
export const useButtonPermission = defineStore("buttonPermission", () => {
    const pageBtnPermisson = ref<any>({});
    const currentPermission = ref<any>({});
    // const route = useRoute();
    // // const router=useRouter();
    // const meta = route?.meta;
    // console.log(route, meta, router);
    const addRoute = async (route: RouteLocationNormalized) => {
        const meta: any = route.meta;
        return await getPagePermission(meta?.menuId);
        //    console.log(meta);
    }
    /**
     * 添加单个权限
     * @param menuId
     * @param data
     */
    const addPermission = (menuId: string, data: any) => {
        pageBtnPermisson.value[menuId] = data;
    }
    /**
     *
     * @param data
     */
    const addAllPermission = (data: any) => {
        pageBtnPermisson.value = data;
    }
    const getPagePermission = async (menuId: string) => {
        currentPermission.value = [];
        if (menuId) {
            menuId = menuId.split("_")[1];
            let permissons = pageBtnPermisson.value[menuId];
            // console.log(permissons);
            if (!permissons || permissons.length == 0) {
                const userId = getUserInfo()?.idUsersinfo;
                if (!userId) {
                    warning("Session 失效")
                    await userLogout([]);
                    return;
                }
                //没拿到则到数据库中去取
                await postRequest(`/system-config/system/resourcesEntity/permissionResources/${userId}/${menuId}`, {}).then(res => {
                    if (res.data.code) {
                        console.log(res.data.cnMessage);
                        return;
                    }
                    permissons = res.data.data;
                });
                if (permissons && permissons.length > 0) {
                    addPermission(menuId, permissons);
                } else {
                    console.log("没有页面按钮操作权限,请联系系统管理员授权");
                }
            }
            const permission: any = {};
            permissons?.forEach((item: any) => {
                permission[item.resCode] = item.resCode;
            });
            currentPermission.value = permission;
        }
        return currentPermission.value;
    }
    return {addPermission, addAllPermission, addRoute}
});
