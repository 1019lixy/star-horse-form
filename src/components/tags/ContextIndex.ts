import ContextMenu from '@/components/tags/ContextMenu.vue'
import {ElDropdown} from 'element-plus'
import type {RouteLocationNormalizedLoaded} from 'vue-router'

export interface ContextMenuExpose {
    elDropdownMenuRef: InstanceType<typeof ElDropdown>
    tagItem: RouteLocationNormalizedLoaded
}

export {ContextMenu}
