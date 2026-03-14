import { App } from 'vue';

// 按需导入star-horse-lowcode中的组件
export function fixStarHorseComponents(app: App) {
  try {
    // 基础组件
    import('star-horse-lowcode').then(({ 
      StarHorseDialog, StarHorseForm, StarHorseFormItem, StarHorseFormList, 
      StarHorseFormTable, StarHorseIcon, StarHorseItem, StarHorseJsonEditor, 
      StarHorsePopover, StarHorseSearchComp, StarHorseStaticTable, 
      StarHorseTableColumn, StarHorseTableComp, StarHorseTableViewColumn, 
      StarHorseTree, ShDynamicForm, ShForm, ShTableListColumn, 
      StarHorseDataSelector, StarHorseDataView, StarHorseDataViewItems, 
      StarHorseDataViewTable, StarHorseDraggable 
    }) => {
      // 注册基础组件
      StarHorseDialog && app.component('StarHorseDialog', StarHorseDialog);
      StarHorseForm && app.component('StarHorseForm', StarHorseForm);
      StarHorseFormItem && app.component('StarHorseFormItem', StarHorseFormItem);
      StarHorseFormList && app.component('StarHorseFormList', StarHorseFormList);
      StarHorseFormTable && app.component('StarHorseFormTable', StarHorseFormTable);
      StarHorseIcon && app.component('StarHorseIcon', StarHorseIcon);
      StarHorseItem && app.component('StarHorseItem', StarHorseItem);
      StarHorseJsonEditor && app.component('StarHorseJsonEditor', StarHorseJsonEditor);
      StarHorsePopover && app.component('StarHorsePopover', StarHorsePopover);
      StarHorseSearchComp && app.component('StarHorseSearchComp', StarHorseSearchComp);
      StarHorseStaticTable && app.component('StarHorseStaticTable', StarHorseStaticTable);
      StarHorseTableColumn && app.component('StarHorseTableColumn', StarHorseTableColumn);
      StarHorseTableComp && app.component('StarHorseTableComp', StarHorseTableComp);
      StarHorseTableViewColumn && app.component('StarHorseTableViewColumn', StarHorseTableViewColumn);
      StarHorseTree && app.component('StarHorseTree', StarHorseTree);
      ShDynamicForm && app.component('ShDynamicForm', ShDynamicForm);
      ShForm && app.component('ShForm', ShForm);
      ShTableListColumn && app.component('ShTableListColumn', ShTableListColumn);
      StarHorseDataSelector && app.component('StarHorseDataSelector', StarHorseDataSelector);
      StarHorseDataView && app.component('StarHorseDataView', StarHorseDataView);
      StarHorseDataViewItems && app.component('StarHorseDataViewItems', StarHorseDataViewItems);
      StarHorseDataViewTable && app.component('StarHorseDataViewTable', StarHorseDataViewTable);
      StarHorseDraggable && app.component('StarHorseDraggable', StarHorseDraggable);
    });

    // 系统组件
    import('star-horse-lowcode').then(({ 
      StarHorseButtonList, StarHorseEditor, StarHorseMenu, 
      StarHorseSidebar, StarHorseSvg, ContentMenu, PageConfig, SvgLoader 
    }) => {
      // 注册系统组件
      StarHorseButtonList && app.component('StarHorseButtonList', StarHorseButtonList);
      StarHorseEditor && app.component('StarHorseEditor', StarHorseEditor);
      StarHorseMenu && app.component('StarHorseMenu', StarHorseMenu);
      StarHorseSidebar && app.component('StarHorseSidebar', StarHorseSidebar);
      StarHorseSvg && app.component('StarHorseSvg', StarHorseSvg);
      ContentMenu && app.component('ContentMenu', ContentMenu);
      PageConfig && app.component('PageConfig', PageConfig);
      SvgLoader && app.component('SvgLoader', SvgLoader);
    });

    // 表单容器组件
    import('star-horse-lowcode').then(({ 
      BoxContainer, CardContainer, CollapseContainer, 
      DytableContainer, GroupContainer, SplitterContainer, 
      TabContainer, TableContainer, BoxCol, DytableCol 
    }) => {
      // 注册表单容器组件
      BoxContainer && app.component('box-container', BoxContainer);
      CardContainer && app.component('card-container', CardContainer);
      CollapseContainer && app.component('collapse-container', CollapseContainer);
      DytableContainer && app.component('dytable-container', DytableContainer);
      GroupContainer && app.component('group-container', GroupContainer);
      SplitterContainer && app.component('splitter-container', SplitterContainer);
      TabContainer && app.component('tab-container', TabContainer);
      TableContainer && app.component('table-container', TableContainer);
      BoxCol && app.component('box-col', BoxCol);
      DytableCol && app.component('dytable-col', DytableCol);
    });

    // 表单项目组件
    import('star-horse-lowcode').then(({ 
      AreaItem, AudioItem, AutocompleteItem, BarcodeItem, 
      ButtonItem, CascadeItem, CheckboxItem, ColorItem, 
      CronItem, DatapickerItem, DatetimeItem, DepartItem, 
      DialogItem, DividerItem, DrawerItem, EmptyItem, 
      HtmlItem, HtmleditorItem, IconItem, ImageItem, 
      InputItem, JsonArrayItem, JsonItem, MarkdownItem, 
      NumberItem, NumberRangeItem, PageSelectItem, PasswordItem, 
      QrcodeItem, RadioItem, RateItem, SelectItem, 
      SignatureItem, SliderItem, StarhorseFormItem, SwitchItem, 
      TagItem, TextItem, TextareaItem, TimeItem, 
      TimePickerItem, TransferItem, TselectItem, UploadItem, 
      UserItem, UsercompItem, ViewMarkdownItem, DialogInputItem, 
      UnknownItem 
    }) => {
      // 注册表单项目组件
      AreaItem && app.component('area-item', AreaItem);
      AudioItem && app.component('audio-item', AudioItem);
      AutocompleteItem && app.component('autocomplete-item', AutocompleteItem);
      BarcodeItem && app.component('barcode-item', BarcodeItem);
      ButtonItem && app.component('button-item', ButtonItem);
      CascadeItem && app.component('cascade-item', CascadeItem);
      CheckboxItem && app.component('checkbox-item', CheckboxItem);
      ColorItem && app.component('color-item', ColorItem);
      CronItem && app.component('cron-item', CronItem);
      DatapickerItem && app.component('datapicker-item', DatapickerItem);
      DatetimeItem && app.component('datetime-item', DatetimeItem);
      DepartItem && app.component('depart-item', DepartItem);
      DialogItem && app.component('dialog-item', DialogItem);
      DividerItem && app.component('divider-item', DividerItem);
      DrawerItem && app.component('drawer-item', DrawerItem);
      EmptyItem && app.component('empty-item', EmptyItem);
      HtmlItem && app.component('html-item', HtmlItem);
      HtmleditorItem && app.component('htmleditor-item', HtmleditorItem);
      IconItem && app.component('icon-item', IconItem);
      ImageItem && app.component('image-item', ImageItem);
      InputItem && app.component('input-item', InputItem);
      JsonArrayItem && app.component('json-array-item', JsonArrayItem);
      JsonItem && app.component('json-item', JsonItem);
      MarkdownItem && app.component('markdown-item', MarkdownItem);
      NumberItem && app.component('number-item', NumberItem);
      NumberRangeItem && app.component('number-range-item', NumberRangeItem);
      PageSelectItem && app.component('page-select-item', PageSelectItem);
      PasswordItem && app.component('password-item', PasswordItem);
      QrcodeItem && app.component('qrcode-item', QrcodeItem);
      RadioItem && app.component('radio-item', RadioItem);
      RateItem && app.component('rate-item', RateItem);
      SelectItem && app.component('select-item', SelectItem);
      SignatureItem && app.component('signature-item', SignatureItem);
      SliderItem && app.component('slider-item', SliderItem);
      StarhorseFormItem && app.component('starhorse-form-item', StarhorseFormItem);
      SwitchItem && app.component('switch-item', SwitchItem);
      TagItem && app.component('tag-item', TagItem);
      TextItem && app.component('text-item', TextItem);
      TextareaItem && app.component('textarea-item', TextareaItem);
      TimeItem && app.component('time-item', TimeItem);
      TimePickerItem && app.component('time-picker-item', TimePickerItem);
      TransferItem && app.component('transfer-item', TransferItem);
      TselectItem && app.component('tselect-item', TselectItem);
      UploadItem && app.component('upload-item', UploadItem);
      UserItem && app.component('user-item', UserItem);
      UsercompItem && app.component('usercomp-item', UsercompItem);
      ViewMarkdownItem && app.component('view-markdown-item', ViewMarkdownItem);
      DialogInputItem && app.component('dialog-input-item', DialogInputItem);
      UnknownItem && app.component('unknown-item', UnknownItem);
    });

    console.log('star-horse-lowcode组件注册成功');
  } catch (error) {
    console.error('star-horse-lowcode组件注册失败:', error);
  }
}
