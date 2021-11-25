import template from './template.html?raw'
import uiColors from '../../theme/colors';
import uiTheme from '../../theme/uiTheme';
import intl from '../../../intl/intl';

function createCustomElement() {
    return customElements.define('uie-menubar',
        class extends HTMLElement {
            items = []
            shadowRootElement = null;
            state = null
            constructor() {
                log.debug('🧩 UI Element - menubar', 'Preparing to add uie-menubar element to UIDocument...', uiColors.purple);
                log.debug('🧩 UI Element - menubar', 'Calling super...', uiColors.purple);
                super();
                const shadowRoot = this.attachShadow({ mode: 'open' });
                const templateFragment = document.createDocumentFragment();
                const containerDiv = document.createElement('div');
                let computedTemplate = template
                    .replace('var(--uiTheme-background-primary)', uiTheme.colors.background.primary)
                    .replace('var(--uiTheme-background-hover)', uiTheme.colors.background.hover)
                    .replace('var(--uiTheme-border-primary)', uiTheme.colors.border.primary)
                    .replace('var(--uiTheme-layout-margin-documentUI)', uiTheme.layout.margin.documentUI)
                    .replace('var(--uiTheme-animations-easing-primary)', uiTheme.animations.easing.primary)
                    .replace('VITE_APP_ICON_URL', new URL('../../../../styles/static/logos/Stride_Mark.svg', import.meta.url).href);
                containerDiv.insertAdjacentHTML('afterbegin', computedTemplate)
                templateFragment.appendChild(containerDiv);
                shadowRoot.appendChild(templateFragment);
                this.shadowRootElement = shadowRoot.children[0].querySelector('aside[uie-ref="menubar-outer"]');
                const shadowRootElementProxy = this.shadowRootElement;
                this.state = new Proxy({
                    active: 0,
                    focused: 0,
                    focusedState: 0,
                    barState: 1
                }, {
                    set: function (target, key, value) {
                        target[key] = value;
                        shadowRootElementProxy.setAttribute('uie-prop-' + key, value)
                        shadowRootElementProxy.querySelector('section[uie-ref="menubar-toolSelector"]').style.setProperty('--uie-prop-' + key, value)
                        if (key == 'active') {
                            shadowRootElementProxy.querySelectorAll('section[uie-ref="menubar-toolSelector"] button').forEach(el => {
                                el.setAttribute('isSelected', 0)
                                el.setAttribute('aria-selected', 'false')
                            })
                            //shadowRootElementProxy.querySelector('section[uie-ref="menubar-toolSelector"]').children[value].setAttribute('isSelected', 1);
                            //shadowRootElementProxy.querySelector('section[uie-ref="menubar-toolSelector"]').children[value].setAttribute('aria-selected', 'true')
                        }
                        return true;
                    }
                });
                shadowRootElementProxy.addEventListener('pointerout', (event) => {
                    this.state.focused = -1;
                });
                shadowRootElementProxy.addEventListener('focusout', (event) => {
                    this.state.focused = -1;
                });
                log.success('🧩 UI Element - menubar', 'Created new uie-menubar custom element.', uiColors.purple);
            }

            addItem(id, name, icon, type, onSelected, active) {
                if (type == 'spacer') {
                    const itemRef = this.items.push({
                        id: id,
                        name: '',
                        icon: '',
                        type: '',
                    });
                    const itemtemplate = this.shadowRoot.children[0].querySelector('template[uie-template="menubar-tool"]').content.cloneNode(true);
                    const menubarRef = this.shadowRoot.children[0].querySelector('section[uie-ref="menubar-toolSelector"]');
                    itemtemplate.querySelector('button').setAttribute('isSpacer', 1);
                    itemtemplate.querySelector('button').setAttribute('tabindex', -1);
                    menubarRef.appendChild(itemtemplate);
                } else {
                    log.debug('🧩 UI Element - menubar', 'Preparing to create new uie-menubar item', uiColors.purple);
                    const itemRef = this.items.push({
                        id: id,
                        name: name,
                        icon: icon,
                        type: type,
                    });
                    const itemtemplate = this.shadowRoot.children[0].querySelector('template[uie-template="menubar-tool"]').content.cloneNode(true);
                    const menubarRef = this.shadowRoot.children[0].querySelector('section[uie-ref="menubar-toolSelector"]');
                    itemtemplate.querySelector('button').setAttribute('menubar-itemid', id);
                    if (type == 'workspaceCommand') itemtemplate.querySelector('button').setAttribute('isWorkspaceTool', 1);
                    itemtemplate.querySelector('button').setAttribute('isSelected', 0);
                    itemtemplate.querySelector('button').setAttribute('aria-selected', 'false');
                    itemtemplate.querySelector('button').setAttribute('aria-label', name);
                    itemtemplate.querySelector('button').setAttribute('title', name);
                    itemtemplate.querySelector('div[uie-ref="menubar-toolSelector-toolicon"]').insertAdjacentHTML('afterbegin', icon)
                    menubarRef.appendChild(itemtemplate);
                    const element = menubarRef.querySelector('button[menubar-itemid="' + id + '"]');
                    const itemIndex = [...element.parentElement.children].indexOf(element);
                    element.addEventListener('pointermove', (event) => {
                        event.preventDefault()
                        this.state.focused = itemIndex;
                        if (element.getAttribute('isSelected') == 1) {
                            log.display(name + " is ready.")
                        } else {
                            log.display(name)
                        }
                    });
                    element.addEventListener('focus', (event) => {
                        this.state.focused = itemIndex;
                        if (element.getAttribute('isSelected') == 1) {
                            log.display(name + " is ready.")
                        } else {
                            log.display(name)
                        }
                    });
                    element.addEventListener('pointerup', (event) => {
                        document.activeElement && document.activeElement.blur();
                        if ((element.getAttribute('isSelected') == 0 && type !== 'documentCommand') && (element.getAttribute('isSelected') == 0 && type !== 'systemCommand') && (element.getAttribute('isSelected') == 0 && type !== 'dropdownMenu')) {
                            event.stopPropagation();
                            this.state.active = itemIndex;
                            log.display(name + " is now ready.")
                            onSelected(event);
                        }
                    });
                    element.addEventListener('click', (event) => {
                        document.activeElement && document.activeElement.blur();
                        event.stopPropagation();
                        if (element.getAttribute('isSelected') == 0) {
                            if (type == 'documentCommand' || type == 'systemCommand' || type == 'dropdownMenu') {
                                onSelected(event);
                                this.state.active = this.state.active;
                            } else {
                                this.state.active = itemIndex;
                                log.display(name + " is now ready.")
                                onSelected(event);
                            }
                        }
                    });
                    if (active) element.click();
                }
                log.debug('🧩 UI Element - menubar', 'Successfully created new uie-menubar ' + type + ' item: ' + id + ' as ' + name, uiColors.purple);
            }

            set name(val) {
                this.shadowRoot.children[0].querySelector('p[uie-ref="menubar-documentName"]').innerText = val;
            }

            set barState(val) {
                this.state.barState = val;
            }

            updateItem(id, icon) {
                const menubarRef = this.shadowRoot.children[0].querySelector('section[uie-ref="menubar-toolSelector"]');
                menubarRef.querySelector('button[menubar-itemid="' + id + '"]').querySelector('div[uie-ref="menubar-toolSelector-toolicon"]').innerHTML = "";
                menubarRef.querySelector('button[menubar-itemid="' + id + '"]').querySelector('div[uie-ref="menubar-toolSelector-toolicon"]').insertAdjacentHTML('afterbegin', icon);
            }
        }
    );
}

class uieMenubar {
    constructor(uiDocument) {
        log.debug('🧩 UI Element - menubar', 'Preparing to add uie-menubar custom element...', uiColors.purple);
        if (!customElements.get('uie-menubar')) createCustomElement();
        if (!uiDocument.attachmentPoints.ui.contains(uiDocument.attachmentPoints.ui.querySelector('uie-menubar'))) {
            uiDocument.components.menubar = uiDocument.attachmentPoints.ui.appendChild(document.createElement('uie-menubar'))
            log.success('🧩 UI Element - menubar', 'Successfully added new uie-menubar element to UIDocument', uiColors.purple);
        }
    }
}

export default uieMenubar;