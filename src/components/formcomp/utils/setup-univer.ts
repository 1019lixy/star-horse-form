import {createUniver, defaultTheme, LocaleType, LogLevel, merge, Tools, UniverInstanceType} from '@univerjs/presets'
import {UniverSheetsCollaborationPreset} from '@univerjs/presets/preset-sheets-collaboration'
import sheetsCollaborationEnUs from '@univerjs/presets/preset-sheets-collaboration/locales/zh-CN'
import {UniverSheetsConditionalFormattingPreset} from '@univerjs/presets/preset-sheets-conditional-formatting'
import sheetsConditionalFormattingEnUs from '@univerjs/presets/preset-sheets-conditional-formatting/locales/zh-CN'
import {UniverSheetsCorePreset} from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUs from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import {UniverSheetsDataValidationPreset} from '@univerjs/presets/preset-sheets-data-validation'
import sheetsDataValidationEnUs from '@univerjs/presets/preset-sheets-data-validation/locales/zh-CN'
import {UniverSheetsFilterPreset} from '@univerjs/presets/preset-sheets-filter'
import sheetsFilterEnUs from '@univerjs/presets/preset-sheets-filter/locales/zh-CN'
import {UniverSheetsFindReplacePreset} from '@univerjs/presets/preset-sheets-find-replace'
import sheetsFindReplaceEnUs from '@univerjs/presets/preset-sheets-find-replace/locales/zh-CN'
import {UniverSheetsHyperLinkPreset} from '@univerjs/presets/preset-sheets-hyper-link'
import sheetsHyperLinkEnUs from '@univerjs/presets/preset-sheets-hyper-link/locales/zh-CN'
import {UniverSheetsSortPreset} from '@univerjs/presets/preset-sheets-sort'
import sheetsSortEnUs from '@univerjs/presets/preset-sheets-sort/locales/zh-CN'
import {UniverSheetsThreadCommentPreset} from '@univerjs/presets/preset-sheets-thread-comment'
import sheetsThreadCommentEnUs from '@univerjs/presets/preset-sheets-thread-comment/locales/zh-CN'
import {UniverSheetsCrosshairHighlightPlugin} from '@univerjs/sheets-crosshair-highlight'
import UniverSheetsCrosshairHighlightEnUS from '@univerjs/sheets-crosshair-highlight/locale/zh-CN'
import {UniverSheetsZenEditorPlugin} from '@univerjs/sheets-zen-editor'
import sheetsZenEditorEnUs from '@univerjs/sheets-zen-editor/locale/zh-CN'
import {UniverDocsCollaborationPreset} from '@univerjs/presets/preset-docs-collaboration'
import docsCollaborationZhCN from '@univerjs/presets/preset-docs-collaboration/locales/zh-CN'

import {UniverDocsCorePreset} from '@univerjs/presets/preset-docs-core'
import docsCoreZhCN from '@univerjs/presets/preset-docs-core/locales/zh-CN'

import {UniverDocsDrawingPreset} from '@univerjs/presets/preset-docs-drawing'
import docsDrawingZhCN from '@univerjs/presets/preset-docs-drawing/locales/zh-CN'

import '@univerjs/presets/lib/styles/preset-docs-core.css'
import '@univerjs/presets/lib/styles/preset-docs-collaboration.css'
import '@univerjs/presets/lib/styles/preset-docs-drawing.css'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'
import '@univerjs/presets/lib/styles/preset-sheets-filter.css'
import '@univerjs/presets/lib/styles/preset-sheets-collaboration.css'
import '@univerjs/presets/lib/styles/preset-sheets-thread-comment.css'
import '@univerjs/presets/lib/styles/preset-sheets-conditional-formatting.css'
import '@univerjs/presets/lib/styles/preset-sheets-data-validation.css'
import '@univerjs/presets/lib/styles/preset-sheets-find-replace.css'
import '@univerjs/presets/lib/styles/preset-sheets-hyper-link.css'
import '@univerjs/presets/lib/styles/preset-sheets-sort.css'

export function setupUniver(container: any) {

    const collaboration = undefined

    const {univerAPI, univer} = createUniver({
        locale: LocaleType.ZH_CN,
        locales: {
            [LocaleType.ZH_CN]: Tools.deepMerge(
                {},
                sheetsCoreEnUs,
                sheetsCollaborationEnUs,
                sheetsThreadCommentEnUs,
                sheetsConditionalFormattingEnUs,
                sheetsDataValidationEnUs,
                sheetsFilterEnUs,
                sheetsFindReplaceEnUs,
                sheetsHyperLinkEnUs,
                sheetsSortEnUs,
                sheetsZenEditorEnUs,
                UniverSheetsCrosshairHighlightEnUS,
            ),
        },
        collaboration,
        logLevel: LogLevel.VERBOSE,
        theme: defaultTheme,
        presets: [
            UniverSheetsCorePreset({
                container: container,
                header: true,
            }),
            ...(collaboration ? [UniverSheetsCollaborationPreset()] : []),
            UniverSheetsThreadCommentPreset({
                collaboration,
            }),
            UniverSheetsConditionalFormattingPreset(),
            UniverSheetsDataValidationPreset(),
            UniverSheetsFilterPreset(),
            UniverSheetsFindReplacePreset(),
            UniverSheetsSortPreset(),
            UniverSheetsHyperLinkPreset(),
        ],
        plugins: [
            UniverSheetsCrosshairHighlightPlugin,
            UniverSheetsZenEditorPlugin,
        ],
    })

    // univer.registerPlugin(UniverSheetsChartPlugin)
    // univer.registerPlugin(UniverSheetsChartUIPlugin)

    univer.createUnit(UniverInstanceType.UNIVER_SHEET, {})

    return univerAPI
}

export function docSetupUniver(container: any) {
    const {univerAPI} = createUniver({
        locale: LocaleType.ZH_CN,
        locales: {
            zhCN: merge(
                {},
                docsCoreZhCN,
                docsCollaborationZhCN,
                docsDrawingZhCN,
            ),
        },
        theme: defaultTheme,
        collaboration: true,
        presets: [
            UniverDocsCorePreset({
                container: container,
                collaboration: true,
            }),
            UniverDocsCollaborationPreset(),
            UniverDocsDrawingPreset({collaboration: true}),
        ],
    })


    return univerAPI;
}
