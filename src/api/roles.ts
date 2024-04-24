import {getRequest, postRequest} from "@/api/star_horse.js";

/**
 * 获取角色菜单
 * @param roleId
 */
export async function loadRolesMenus(idRolesinfo: Number) {
    let roleMenus: any = [];
    await getRequest(`/system-config/system/rolesinfoEntity/roleAuthorityPageList/${idRolesinfo}`).then(res => {
        if (res.data.code != 0) {
            console.warn(res.data.cnMessage);
        } else {
            let redata = res.data.data;
            roleMenus = redata;
        }
    }).catch(err => console.error(err));
    return roleMenus;
};

/**
 * 分配角色菜单
 * @param roleId
 * @param menuIds
 */
export function submitMenus(roleId: Number, menuIds: Array<Number>) {
    postRequest(`/system-config/system/rolesMenusinfo/roleMenuAuthority/${roleId}`, menuIds).then(res => {
        if (res.data.data) {

        }
    });
}