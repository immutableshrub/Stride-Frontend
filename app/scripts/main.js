import '../styles/style.css'
import Logger from './utils/logger'
import intl from './intl/intl'
import SettingsStateModule from './modules/SettingsStateModule'
import WindowStateModule from './modules/WindowStateModule'
import DocumentStateModule from './modules/DocumentStateModule'
import UI from './ui/ui'
import uiIcons from './ui/theme/icons'
import uieControlbar from './ui/components/controlbar/controlbar'
import uieMenubar from './ui/components/menubar/menubar'
import CanvasModule from './modules/CanvasModule'
import ProfileStateModule from './modules/ProfileStateModule'
import SharedHomeUI from './ui/components/sharedHomeUI.js/sharedHomeUI'
import SimpleDialog from './ui/components/simpledialog/simpledialog'
import SimpleMenu from './ui/components/simplemenu/simplemenu'

import { version as uuidVersion, validate as uuidValidate } from 'uuid';

import cat from './cat'
import SharedStateModule from './modules/SharedStateModule'

new Logger();
setTimeout(init, 1500)

function init() {
    new SettingsStateModule()
    document.body.addEventListener('contextmenu', () => {
        return false;
    })
    const uiDocument = new UI(document.querySelector('div.app'));
    window.uiDocument = uiDocument;
    window.addEventListener('SystemStateEvent-BetaNotification', () => {
        betaWarning(window.uiDocument, () => {
            return false;
        })
    })
    loader(1);
    function kick() {
        const docState = '' | cat
        new WindowStateModule();
        new DocumentStateModule(docState);
        new uieMenubar(uiDocument);
        new uieControlbar(uiDocument);
        window.ProfileState = new ProfileStateModule();
        window.sharedState = new SharedStateModule;
        registerMenuBarItems()
        uiDocument.components.menubar.name = DocumentState.name;
        new CanvasModule(uiDocument);
        window.dispatchEvent(new Event('DocumentStateEvent-ReloadAllElements'));
        loader(0);
    }
    if (new URL(window.location.href).hash.split('#')[1] !== undefined) {
        try {
            const hash = (window.atob(new URL(window.location.href).hash.split('#')[1]))
            window.location.hash = '';
            new WindowStateModule();
            new DocumentStateModule();
            new uieMenubar(uiDocument);
            new uieControlbar(uiDocument);
            window.ProfileState = new ProfileStateModule();
            window.sharedState = new SharedStateModule(hash);
            registerMenuBarItems()
            uiDocument.components.menubar.name = DocumentState.name;
            new CanvasModule(uiDocument);
            window.dispatchEvent(new Event('DocumentStateEvent-ReloadAllElements'));
            loader(0);
        } catch { kick(); }
    } else {
        kick()
    }
}


//window.localStorage.clear();

function registerMenuBarItems() {
    WindowState.ui.menubar.forEach((tool, index) => {
        const toolAction = (e) => {
            switch (tool.type) {
                case 'documentCommand':
                    window.dispatchEvent(new CustomEvent(tool.event, {
                        detail: e
                    }));
                    break;
                case 'systemCommand':
                    window.dispatchEvent(new CustomEvent(tool.event, {
                        detail: e
                    }));
                    break;
                case 'dropdownMenu':
                    new SimpleMenu(uiDocument, [e.clientX, e.clientY, tool.pos], tool.items);
                    break;
            }
            return false;
        }
        if (tool.keyboardShortcut) {
            Mousetrap.bind(tool.keyboardShortcut, () => {
                if (!(tool.type == 'documentCommand' || tool.type == 'systemCommand')) {
                    uiDocument.components.menubar.fakeActiveItem(index);
                }
                toolAction();
            });
        }
        if (tool.type == 'spacer') {
            uiDocument.components.menubar.addItem('spacer' + index, '', '', 'spacer');
        } else { uiDocument.components.menubar.addItem(tool.id || 'tool' + index, tool.name, uiIcons[tool.icon.split('/')[0]][tool.icon.split('/')[1]], tool.type, toolAction, (tool.active || false)) }
    });
    Mousetrap.bind('up up down down left right left right b a enter', function () {
        console.log('mmm')
    });
}
function loader(num, text) {
    document.querySelector('main.loader[uie-ref="LoaderWrapper"]').setAttribute('data-state', num || 0);
    document.querySelector('main.loader[uie-ref="LoaderWrapper"]').setAttribute('data-loadingText', text || '');
}