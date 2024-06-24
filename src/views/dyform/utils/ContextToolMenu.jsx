import {ElDropdown, ElDropdownItem} from 'element-plus'

// ContextMenu挂载的Vue实例
let app = null;
let timer = null; // timer
const ContextMenuTool = ({node: Node}) => {
    const label = node.prop('label')
    return (
        <ElDropdown trigger="contextmenu">
            <ElDropdownItem>复制</ElDropdownItem>
            <ElDropdownItem>粘贴</ElDropdownItem>
            <ElDropdownItem>删除</ElDropdownItem>
        </ElDropdown>
    )
}


export default {
    ContextMenuTool
}
