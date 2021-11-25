import settingsSchema from "../schema/settingsSchema";
import uiColors from '../ui/theme/colors';
import uiIcons from "../ui/theme/icons";
import { storageAvailable } from "../utils/helpers";
import SimpleDialog from "../ui/components/simpledialog/simpledialog";
import '../../styles/SettingsStateDialog.css'
import intl from "../intl/intl";
import aboutDialogHTMLProvider from '../ui/components/simpledialog/aboutdialog.html?raw';
import SharedHomeUI from "../ui/components/sharedHomeUI.js/sharedHomeUI";

import { v4 as uuidv4 } from "uuid";

class SettingsStateModule {
    DefaultSettingState = {}
    localStorageSettings = {
        settingsBundleVersion: undefined
    };
    constructor() {
        this.DefaultSettingState = {};
        this.DefaultSettingState['settingsBundleVersion'] = settingsSchema.settingsBundleVersion;
        settingsSchema.settings.forEach((setting) => {
            if (setting.prop == 'setting') {
                this.DefaultSettingState[setting.id] = setting.default;
            } else {
                return;
            }
        })
        let storageStatus = storageAvailable();
        console.log(storageStatus)
        let mergedState = this.DefaultSettingState;
        if (storageStatus[0] == 1 && localStorage.getItem('localStorageSettings') == null) {
            localStorage.setItem('localStorageSettings', window.btoa(JSON.stringify(this.DefaultSettingState)));
        } else if (storageStatus[0] == 1 && localStorage.getItem('localStorageSettings') != null) {
            this.localStorageSettings = JSON.parse(window.atob(localStorage.getItem('localStorageSettings')));
            if (this.localStorageSettings.settingsBundleVersion.split('.')[0] == this.DefaultSettingState['settingsBundleVersion'].split('.')[0]) {
                console.log(this.localStorageSettings)
                mergedState = Object.assign(this.DefaultSettingState, this.localStorageSettings);
            } else {
                localStorage.setItem('localStorageSettings', window.btoa(JSON.stringify(this.DefaultSettingState)));
                log.debug('⚙️ Settings State Module', 'Successfully Migrated SettingsBundle from ' + this.localStorageSettings.settingsBundleVersion + ' to ' + this.DefaultSettingState.settingsBundleVersion, uiColors.red);
                mergedState = this.DefaultSettingState;
            }
        }
        const proxyObj = new Proxy(mergedState, {
            set: function (target, key, value) {
                target[key] = value;
                localStorage.setItem('localStorageSettings', window.btoa(JSON.stringify(window.SettingsStateModule)));
                return true
            }
        });
        window.SettingsStateModule = proxyObj;
        localStorage.setItem('localStorageSettings', window.btoa(JSON.stringify(proxyObj)));
        window.addEventListener('SystemStateEvent-SettingsModule-SettingsDialog', () => {
            showSettingDialog();
        });
    }
}

function buildSettingsStateDialog(htmlElement) {
    let settingsStateForm = document.createElement('form');
    settingsSchema.settings.forEach((setting) => {
        if (setting.prop == 'setting') {
            let formControl = document.createElement('fieldset');
            const settingtempID = uuidv4();
            let legend = document.createElement('legend')
            legend.innerHTML = setting.group + ': ' + setting.name;
            if (setting.default !== window.SettingsStateModule[setting.id]) {
                let resetButton = legend.appendChild(document.createElement('button'))
                resetButton.innerHTML = uiIcons.ui.reset;
                resetButton.addEventListener('click', () => {
                    window.SettingsStateModule[setting.id] = setting.default;
                    htmlElement.innerHTML = '';
                    buildSettingsStateDialog(htmlElement);
                });
            }
            formControl.appendChild(legend);
            //formControl.appendChild(document.createElement('code')).innerHTML = setting.id;
            switch (setting.type) {
                case 'boolean': {
                    let bounding = formControl.appendChild(document.createElement('div'));
                    let box = bounding.appendChild(document.createElement('input'))
                    let label = bounding.appendChild(document.createElement('label'))
                    box.setAttribute('type', 'checkbox')
                    box.setAttribute('id', settingtempID)
                    box.setAttribute('name', setting.id)
                    if (window.SettingsStateModule[setting.id] == true) box.setAttribute('checked', window.SettingsStateModule[setting.id])
                    label.innerText = setting.description;
                    label.setAttribute('for', settingtempID)
                    box.addEventListener('change', (event) => {
                        window.SettingsStateModule[setting.id] = event.target.checked;
                        htmlElement.innerHTML = '';
                        buildSettingsStateDialog(htmlElement);
                    });
                    break;
                }
                case 'string': {
                    let label = formControl.appendChild(document.createElement('label'))
                    let input = formControl.appendChild(document.createElement('input'))
                    input.setAttribute('type', 'text')
                    input.setAttribute('id', settingtempID)
                    input.setAttribute('name', setting.id)
                    input.setAttribute('value', window.SettingsStateModule[setting.id])
                    label.innerText = setting.description;
                    label.setAttribute('for', settingtempID)
                    input.addEventListener('change', (event) => {
                        window.SettingsStateModule[setting.id] = event.target.value;
                        htmlElement.innerHTML = '';
                        buildSettingsStateDialog(htmlElement);
                    });
                    break;
                }
                case 'enum': {
                    let label = formControl.appendChild(document.createElement('label'))
                    let select = formControl.appendChild(document.createElement('select'))
                    select.setAttribute('id', settingtempID)
                    select.setAttribute('name', setting.id)
                    setting.options.forEach((option, index) => {
                        let optGroup = select.appendChild(document.createElement('optgroup'))
                        if (index == 0) {
                            optGroup.setAttribute('label', setting.name);
                            let disabledOptEl = optGroup.appendChild(document.createElement('option'))
                            disabledOptEl.setAttribute('disabled', 'true');
                        } else {
                            optGroup.setAttribute('label', ' ');
                        }
                        let optionElement = optGroup.appendChild(document.createElement('option'))
                        let optionDescription = optGroup.appendChild(document.createElement('option'))
                        optionElement.setAttribute('value', option.value)
                        optionElement.innerText = option.name
                        optionDescription.innerText = option.description
                        optionDescription.setAttribute('disabled', 'true');
                        if (option.value == window.SettingsStateModule[setting.id]) {
                            optionElement.setAttribute('selected', 'selected')
                        }
                    })
                    label.innerText = setting.description;
                    label.setAttribute('for', settingtempID)
                    select.addEventListener('change', (event) => {
                        window.SettingsStateModule[setting.id] = event.target.value;
                        htmlElement.innerHTML = '';
                        buildSettingsStateDialog(htmlElement);
                    });
                    break;
                }
            }
            settingsStateForm.appendChild(formControl);
        } else if (setting.prop == 'header') {
            settingsStateForm.appendChild(document.createElement('h3')).innerHTML = setting.name;
        }
    });

    htmlElement.appendChild(settingsStateForm);
}

function showSettingDialog() {
    new SimpleDialog(uiDocument, {
        title: intl.str('app.header.more.settings'),
        icon: uiIcons.ui.cog,
        canClose: true,
        largeDialog: true,
        body: '<div class="settingDialogReplace" uie-ref="settingDialogReplace"></div>',
        buttons: [{
            type: 'primary',
            text: 'About',
            callback: (e) => {
                setTimeout(() => {
                    new SimpleDialog(window.uiDocument, {
                        title: intl.str('app.header.more.about'),
                        icon: uiIcons.ui.beaker,
                        canClose: true,
                        body: aboutDialogHTMLProvider,
                        buttons: []
                    });
                }, 510)
            },
            close: true
        }, {
            type: 'primary',
            text: 'Clear saved data',
            callback: (e) => {
                let sharedHUI = new SharedHomeUI(window.uiDocument);
                sharedHUI.setScreen(0);
                setTimeout(() => {
                    try {
                        window.localStorage.clear();
                    } finally {
                        window.location.reload();
                    }
                }, 3000);
            },
            close: false
        }, {
            type: 'primary',
            text: 'Reset all to default',
            callback: (e) => {
                e.target.innerText = 'Resetting...';
                e.target.disabled = true;
                settingsSchema.settings.forEach((setting) => {
                    window.SettingsStateModule[setting.id] = setting.default;
                })
                document.querySelector('.settingDialogReplace').innerHTML = '';
                buildSettingsStateDialog(document.querySelector('.settingDialogReplace'));
                e.target.innerText = 'Successfully reset settings.';
                setTimeout(() => {
                    e.target.innerText = 'Reset all to default';
                    e.target.disabled = false;
                }, 3000);
            },
            close: false
        }],
    });
    buildSettingsStateDialog(document.querySelector('.settingDialogReplace'));
}

export default SettingsStateModule;

