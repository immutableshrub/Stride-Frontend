import langs from './langs'

const intl = {
    lang() {
        return langs[window.navigator.language.split('-')[0]].name || 'English';
    },
    str(id) {
        if (langs[window.navigator.language.split('-')[0]]) {
            return langs[window.navigator.language.split('-')[0]].strings[id];
        }
        else {
            return langs['en'].strings[id];
        }
    },
}

export default intl;