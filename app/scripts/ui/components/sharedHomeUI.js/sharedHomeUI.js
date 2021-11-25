import template from './template.html?raw'

class SharedHomeUI {
    el = null;
    constructor(uiDocument) {
        let container = document.createElement('div');
        container.classList.add('uie-sharedhomeui');
        container.insertAdjacentHTML('afterbegin', template);
        this.el = uiDocument.attachmentPoints.ui.appendChild(container);
        this.el.querySelector('main').classList.remove('hidden');
    }
    setScreen(scr) {
        this.el.querySelector('main').setAttribute('data-state', scr);
    }
    destroy() {
        this.el.remove();
    }
}

export default SharedHomeUI;