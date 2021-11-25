import uiColors from './theme/colors';

class UI {
    UIMountElement = null;
    constructor(mountEl) {
        log.debug('🧩 UI Agent', 'UI Agent is initalising...', uiColors.purple);
        const UIDocument = {
            attachmentPoints: {
                base: this.UIMountElement,
                ui: null,
                canvas: null
            },
            components: {}
        };
        this.UIMountElement = mountEl;
        mountEl.innerHTML = '';
        const UIMountContainer = document.createElement('div');
        const CanvasMountContainer = document.createElement('div');
        UIMountContainer.setAttribute('uie-ref', 'UIMountContainer');
        CanvasMountContainer.setAttribute('uie-ref', 'CanvasMountContainer');
        UIDocument.attachmentPoints.ui = this.UIMountElement.appendChild(UIMountContainer)
        UIDocument.attachmentPoints.canvas = this.UIMountElement.appendChild(CanvasMountContainer)
        log.debug('🧩 UI Agent', 'Mounted to dom', uiColors.purple);
        window.UI = UIDocument;
        log.success('🧩 UI Agent', 'UI Agent has initalised', uiColors.purple);
        return UIDocument;
    }
}

export default UI;