import {flow_zh} from './translations.js';

export default function customTranslate(template, replacements) {
    replacements = replacements || {};
    // Translate
    template = flow_zh[template] || template;
    // Replace
    return template.replace(/{([^}]+)}/g, function (_, key) {
        return replacements[key] || '{' + key + '}';
    });
}
