import template from './template.html?raw'
import uiColors from '../../theme/colors';
import uiTheme from '../../theme/uiTheme';
import intl from '../../../intl/intl';
import SimpleMenu from '../simplemenu/simplemenu';

function createCustomElement() {
    return customElements.define('uie-controlbar',
        class extends HTMLElement {
            items = []
            shadowRootElement = null;

            state = null

            constructor() {
                log.debug('🧩 UI Element - controlbar', 'Preparing to add uie-controlbar element to UIDocument...', uiColors.purple);
                log.debug('🧩 UI Element - controlbar', 'Calling super...', uiColors.purple);
                super();
                const shadowRoot = this.attachShadow({ mode: 'open' });
                const templateFragment = document.createDocumentFragment();
                const containerDiv = document.createElement('div');
                let computedTemplate = template
                    .replace('var(--uiTheme-background-primary)', uiTheme.colors.background.primary)
                    .replace('var(--uiTheme-background-hover)', uiTheme.colors.background.hover)
                    .replace('var(--uiTheme-border-primary)', uiTheme.colors.border.primary)
                    .replace('var(--uiTheme-layout-margin-documentUI)', uiTheme.layout.margin.documentUI)
                    .replace('var(--uiTheme-animations-easing-primary)', uiTheme.animations.easing.primary);
                containerDiv.insertAdjacentHTML('afterbegin', computedTemplate)
                templateFragment.appendChild(containerDiv);
                shadowRoot.appendChild(templateFragment);
                this.shadowRootElement = shadowRoot.children[0].querySelector('aside[uie-ref="controlbar-outer"]');
                const shadowRootElementProxy = this.shadowRootElement;
                this.state = new Proxy({
                    active: 0,
                    focused: 0,
                    focusedState: 0,
                    barPosition: 0,
                    barState: 1,
                    currentColor: '#212121',
                    zoomState: 1,
                }, {
                    set: function (target, key, value) {
                        target[key] = value;
                        shadowRootElementProxy.setAttribute('uie-prop-' + key, value)
                        shadowRootElementProxy.querySelector('section[uie-ref="controlbar-toolSelector"]').style.setProperty('--uie-prop-' + key, value)

                        shadowRoot.children[0].querySelector('aside.uie-zoombar').setAttribute('uie-prop-' + key, value)
                        if (key == 'currentColor') {
                            shadowRootElementProxy.querySelector('section[uie-ref="controlbar-toolSelector"] button svg.currentColor path').setAttribute('fill', value)
                        }
                        if (key == 'zoomState') {
                            shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomState"]').innerHTML = (100 * value).toString().split('.')[0] + '%';
                        }
                        if (key == 'active') {
                            shadowRootElementProxy.querySelectorAll('section[uie-ref="controlbar-toolSelector"] button').forEach(el => {
                                el.setAttribute('isSelected', 0)
                                el.setAttribute('aria-selected', 'false')
                            })
                            shadowRootElementProxy.querySelector('section[uie-ref="controlbar-toolSelector"]').children[value].setAttribute('isSelected', 1);
                            shadowRootElementProxy.querySelector('section[uie-ref="controlbar-toolSelector"]').children[value].setAttribute('aria-selected', 'true')
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
                this.state.barPosition = window.SettingsStateModule['interface.dockPosition'] || 0;

                shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomIn"]').addEventListener('click', (event) => {
                    document.activeElement && document.activeElement.blur();
                    event.stopPropagation();
                    WindowState.canvas.document.position.zoomScale += ((-200 * 0.001) * -1);
                    WindowState.canvas.document.position.zoomScale = Math.min(Math.max(0.5, WindowState.canvas.document.position.zoomScale), 4);
                    uiDocument.components.canvas.ccx.scrollTo(WindowState.canvas.document.position.current[0], WindowState.canvas.document.position.current[1]);
                    document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transition = '0.5s cubic-bezier(.86, 0, .07, 1)';
                    document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transform = 'scale(' + WindowState.canvas.document.position.zoomScale + ')';
                    shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomState"]').innerHTML = (100 * WindowState.canvas.document.position.zoomScale).toString().split('.')[0] + '%';
                    return false;
                })
                shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomOut"]').addEventListener('click', (event) => {
                    document.activeElement && document.activeElement.blur();
                    event.stopPropagation();
                    WindowState.canvas.document.position.zoomScale += ((200 * 0.001) * -1);
                    WindowState.canvas.document.position.zoomScale = Math.min(Math.max(0.5, WindowState.canvas.document.position.zoomScale), 4);
                    uiDocument.components.canvas.ccx.scrollTo(WindowState.canvas.document.position.current[0], WindowState.canvas.document.position.current[1]);
                    document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transition = '0.5s cubic-bezier(.86, 0, .07, 1)';
                    document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transform = 'scale(' + WindowState.canvas.document.position.zoomScale + ')';
                    shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomState"]').innerHTML = (100 * WindowState.canvas.document.position.zoomScale).toString().split('.')[0] + '%';
                    return false;
                })
                shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomState"]').addEventListener('click', (event) => {
                    document.activeElement && document.activeElement.blur();
                    event.stopPropagation();
                    const zoomMenu = [
                        {
                            type: 'menuElement',
                            icon: 'ui/zoomReset',
                            onSelected() {
                                WindowState.canvas.document.position.zoomScale = 1;
                                WindowState.canvas.document.position.zoomScale = Math.min(Math.max(0.5, WindowState.canvas.document.position.zoomScale), 4);
                                uiDocument.components.canvas.ccx.scrollTo(WindowState.canvas.document.position.current[0], WindowState.canvas.document.position.current[1]);
                                document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transition = '0.5s cubic-bezier(.86, 0, .07, 1)';
                                document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transform = 'scale(' + WindowState.canvas.document.position.zoomScale + ')';
                                shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomState"]').innerHTML = (100 * WindowState.canvas.document.position.zoomScale).toString().split('.')[0] + '%';
                            },
                            name: intl.str('app.ui.zoom.resetZoom')
                        },
                        {
                            type: 'seperator'
                        },
                    ]
                    let zoomlevels = [50, 70, 90, 100, 125, 150, 175, 200, 300, 350, 400]
                    zoomlevels.forEach((zoomlevel) => {
                        zoomMenu.push({
                            type: 'menuElement',
                            icon: 'blank/blank',
                            onSelected() {
                                WindowState.canvas.document.position.zoomScale = (zoomlevel / 100);
                                WindowState.canvas.document.position.zoomScale = Math.min(Math.max(0.5, WindowState.canvas.document.position.zoomScale), 4);
                                uiDocument.components.canvas.ccx.scrollTo(WindowState.canvas.document.position.current[0], WindowState.canvas.document.position.current[1]);
                                document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transition = '0.5s cubic-bezier(.86, 0, .07, 1)';
                                document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transform = 'scale(' + WindowState.canvas.document.position.zoomScale + ')';
                                shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomState"]').innerHTML = (100 * WindowState.canvas.document.position.zoomScale).toString().split('.')[0] + '%';
                            },
                            name: zoomlevel + '%'
                        })
                    })
                    new SimpleMenu(window.uiDocument, [event.clientX, event.clientY, 3], zoomMenu);
                    return false;
                })
                shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomIn"]').addEventListener("contextmenu", (e) => { e.preventDefault(); return false; });
                shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomState"]').addEventListener("contextmenu", (e) => { e.preventDefault(); return false; });
                shadowRoot.children[0].querySelector('[uie-ref="controlbar-toolSelector-button"][uie-bind="zoomOut"]').addEventListener("contextmenu", (e) => { e.preventDefault(); return false; });
                log.success('🧩 UI Element - controlbar', 'Created new uie-controlbar custom element.', uiColors.purple);
            }

            addItem(id, name, icon, type, onSelected, active, repeats, showArrow, disableOpacity) {
                if (type == 'spacer') {
                    const itemRef = this.items.push({
                        id: id,
                        name: '',
                        icon: '',
                        type: '',
                    });
                    const itemtemplate = this.shadowRoot.children[0].querySelector('template[uie-template="controlbar-tool"]').content.cloneNode(true);
                    const controlbarRef = this.shadowRoot.children[0].querySelector('section[uie-ref="controlbar-toolSelector"]');
                    itemtemplate.querySelector('button').setAttribute('isSpacer', 1);
                    itemtemplate.querySelector('button').setAttribute('tabindex', -1);
                    controlbarRef.appendChild(itemtemplate);
                } else {
                    log.debug('🧩 UI Element - controlbar', 'Preparing to create new uie-controlbar item', uiColors.purple);
                    const itemRef = this.items.push({
                        id: id,
                        name: name,
                        icon: icon,
                        type: type,
                    });
                    const itemtemplate = this.shadowRoot.children[0].querySelector('template[uie-template="controlbar-tool"]').content.cloneNode(true);
                    const controlbarRef = this.shadowRoot.children[0].querySelector('section[uie-ref="controlbar-toolSelector"]');
                    itemtemplate.querySelector('button').setAttribute('controlbar-itemid', id);
                    if (type == 'workspaceCommand') itemtemplate.querySelector('button').setAttribute('isWorkspaceTool', 1);
                    itemtemplate.querySelector('button').setAttribute('isSelected', 0);
                    itemtemplate.querySelector('button').setAttribute('aria-selected', 'false');
                    itemtemplate.querySelector('button').setAttribute('aria-label', name);
                    itemtemplate.querySelector('button').setAttribute('title', name);
                    if (showArrow == true) {
                        itemtemplate.querySelector('button').setAttribute('showArrow', 1);
                    }
                    if (disableOpacity == true) {
                        itemtemplate.querySelector('button').setAttribute('disableOpacity', 1);
                    }
                    itemtemplate.querySelector('div[uie-ref="controlbar-toolSelector-toolicon"]').insertAdjacentHTML('afterbegin', icon)
                    controlbarRef.appendChild(itemtemplate);
                    const element = controlbarRef.querySelector('button[controlbar-itemid="' + id + '"]');
                    const itemIndex = [...element.parentElement.children].indexOf(element);
                    let repeatInterval = null;
                    let repeatDelay = null;
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
                        event.preventDefault();
                        document.activeElement && document.activeElement.blur();
                        if (repeatDelay !== null) clearTimeout(repeatDelay);
                        if (repeatInterval !== null) clearInterval(repeatInterval);
                        if ((element.getAttribute('isSelected') == 0 && type !== 'documentCommand') && (element.getAttribute('isSelected') == 0 && type !== 'systemCommand') && (element.getAttribute('isSelected') == 0 && type !== 'dropdownMenu')) {
                            event.stopPropagation();
                            this.state.active = itemIndex;
                            log.display(name + " is now ready.")
                            if (this.state.barPosition == 1) {
                                onSelected(new PointerEvent("pointerdown", { clientX: event.clientX + 315, clientY: event.clientY }));
                            } else {
                                onSelected(event)
                            }
                        }
                        return false;
                    });
                    element.addEventListener('pointercancel', (event) => {
                        if (repeatDelay !== null) clearTimeout(repeatDelay);
                        if (repeatInterval !== null) clearInterval(repeatInterval);
                    })
                    element.addEventListener('pointerdown', (event) => {
                        event.preventDefault()
                        if (repeats) {
                            if (repeatDelay !== null) clearTimeout(repeatDelay);
                            if (repeatInterval !== null) clearInterval(repeatInterval);
                            repeatDelay = setTimeout(() => {
                                repeatInterval = setInterval(() => {
                                    onSelected(event);
                                }, 100);
                            }, 500)
                        }
                        return false;
                    })
                    element.addEventListener("contextmenu", (e) => { e.preventDefault(); return false; });
                    element.addEventListener('click', (event) => {
                        document.activeElement && document.activeElement.blur();
                        event.stopPropagation();
                        if (repeatDelay !== null) clearTimeout(repeatDelay);
                        if (repeatInterval !== null) clearInterval(repeatInterval);

                        if (element.getAttribute('isSelected') == 0) {
                            if (type == 'documentCommand' || type == 'systemCommand' || type == 'dropdownMenu') {
                                if (this.state.barPosition == 1) {
                                    onSelected(new PointerEvent("pointerdown", { clientX: event.clientX + 315, clientY: event.clientY }));
                                } else {
                                    onSelected(event)
                                }
                                this.state.active = this.state.active;
                            } else {
                                this.state.active = itemIndex;
                                log.display(name + " is now ready.")
                                if (this.state.barPosition == 1) {
                                    onSelected(new PointerEvent("pointerdown", { clientX: event.clientX + 315, clientY: event.clientY }));
                                } else {
                                    onSelected(event)
                                }
                            }
                        }
                    });
                    if (active) element.click();
                }
                log.debug('🧩 UI Element - controlbar', 'Successfully created new uie-controlbar ' + type + ' item: ' + id + ' as ' + name, uiColors.purple);
            }

            set barPosition(val) {
                this.state.barPosition = val;
            }

            set barState(val) {
                this.state.barState = val;
            }
            set currentColor(val) {
                this.state.currentColor = val;
            }

            set zoomScale(val) {
                this.state.zoomState = val;
            }

            get selectedItem() {
                return this.state.active
            }

            clickItem(id) {
                this.shadowRoot.children[0].querySelector('section[uie-ref="controlbar-toolSelector"]').querySelector('button[controlbar-itemid="' + id + '"]').click();
            }

            fakeActiveItem(val) {
                this.state.active = val
            }
            updateItem(id, icon) {
                const controlbarRef = this.shadowRoot.children[0].querySelector('section[uie-ref="controlbar-toolSelector"]');
                controlbarRef.querySelector('button[controlbar-itemid="' + id + '"]').querySelector('div[uie-ref="controlbar-toolSelector-toolicon"]').innerHTML = "";
                controlbarRef.querySelector('button[controlbar-itemid="' + id + '"]').querySelector('div[uie-ref="controlbar-toolSelector-toolicon"]').insertAdjacentHTML('afterbegin', icon);
            }
        }
    );
}

class uieControlbar {
    constructor(uiDocument) {
        log.debug('🧩 UI Element - controlbar', 'Preparing to add uie-controlbar custom element...', uiColors.purple);
        if (!customElements.get('uie-controlbar')) createCustomElement();
        if (!uiDocument.attachmentPoints.ui.contains(uiDocument.attachmentPoints.ui.querySelector('uie-controlbar'))) {
            uiDocument.components.controlbar = uiDocument.attachmentPoints.ui.appendChild(document.createElement('uie-controlbar'))
            log.success('🧩 UI Element - controlbar', 'Successfully added new uie-controlbar element to UIDocument', uiColors.purple);
        }
    }
}

export default uieControlbar;