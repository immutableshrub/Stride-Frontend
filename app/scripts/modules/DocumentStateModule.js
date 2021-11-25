import { v4 as uuidv4 } from 'uuid';
import uiColors from '../ui/theme/colors';

class DocumentStateModule {
    redoStack = []
    documentState = {
        id: uuidv4(),
        name: 'Untitled Document',
        size: [1000000, 1000000],
        background: ['color', '#f3f6f9'],
        sharedSettings: {
            isShared: false,
            sharedID: null,
        },
        elements: []
    };
    constructor(documentPotentialState) {
        log.debug("📦 Document State Manager", "Document State Manager is initalising...", uiColors.pink)
        if (documentPotentialState) {
            log.info("📦 Document State Manager", "Document State Manager is loading document " + documentPotentialState.id, uiColors.pink);
            console.log(documentPotentialState)
            this.documentState = documentPotentialState;
            console.log(this.DocumentState)
        } else {
            log.info("📦 Document State Manager", "Document State Manager is creating new document", uiColors.pink);
            this.documentState = {
                id: uuidv4(),
                name: 'Untitled Document',
                size: [1000000, 1000000],
                elements: []
            }
        }
        window.DocumentState = this.documentState;
        this.redoStack = [];
        window.RedoStack = this.redoStack;
        window.addEventListener('DocumentStateEvent-ReloadAllElements', function () {
            log.debug("📦 Document State Manager", "Reloading...", uiColors.pink)
            DocumentState.elements.forEach((item) => {
                window.dispatchEvent(new CustomEvent('CanvasDisplayEvent-AddElement', {
                    detail: {
                        data: item,
                        source: window.ProfileState.userProfile
                    }
                }))
            });
        }, false);
        window.addEventListener('DocumentStateEvent-AddElement', function (e) {
            log.debug("📦 Document State Manager", "Recieved new element from " + e.detail.source, uiColors.pink)
            const element = {
                id: uuidv4(),
                renderer: e.detail.renderer,
                type: e.detail.type,
                position: {
                    x: e.detail.position[0],
                    y: e.detail.position[1]
                },
                data: e.detail.data
            }
            DocumentState.elements.push(element);
            log.debug("📦 Document State Manager", "Saved element " + element.id + " to DocumentState.", uiColors.pink)
            window.dispatchEvent(new CustomEvent('CanvasDisplayEvent-AddElement', {
                detail: {
                    data: element,
                    source: window.ProfileState.userProfile
                }
            }))

            console.log(e.detail)
            if (!e.detail.remote) {
                window.dispatchEvent(new CustomEvent('SharedStateRelay-DSMG-ioComm', {
                    detail: {
                        name: 'CanvasDisplayEvent-AddElement',
                        args: {
                            data: element,
                            source: window.ProfileState.userProfile.id
                        }
                    }
                }))
            }
        }, false);
        window.addEventListener('DocumentStateEvent-DocumentUndo', function (e) {
            if (DocumentState.elements.length !== 0) {
                const element = DocumentState.elements.pop();
                log.debug("📦 Document State Manager", "Undoing 1 change to element " + element.id, uiColors.pink)
                log.display("Undoing 1 change.")
                RedoStack.push(element);
                window.dispatchEvent(new CustomEvent('CanvasDisplayEvent-RemoveElement', {
                    detail: element.id
                }))
                window.dispatchEvent(new CustomEvent('SharedStateRelay-DSMG-ioComm', {
                    detail: {
                        name: 'CanvasDisplayEvent-RemoveElement',
                        args: element.id
                    }
                }))
            }
        }, false);
        window.addEventListener('DocumentStateEvent-DocumentRedo', function (e) {
            if (RedoStack.length !== 0) {
                const element = RedoStack.pop();
                log.debug("📦 Document State Manager", "Redoing 1 change to element " + element.id, uiColors.pink)
                log.display("Redoing 1 change.")
                DocumentState.elements.push(element);
                window.dispatchEvent(new CustomEvent('CanvasDisplayEvent-AddElement', {
                    detail: {
                        data: element,
                        source: 'selfredo'
                    }
                }))

                window.dispatchEvent(new CustomEvent('SharedStateRelay-DSMG-ioComm', {
                    detail: {
                        name: 'CanvasDisplayEvent-AddElement',
                        args: {
                            data: element,
                            source: window.ProfileState.userProfile.id
                        }
                    }
                }))
            }
        }, false);
        window.addEventListener('DocumentStateEvent-DocumentClearAll', function (e) {
            DocumentState.elements = [];
            window.dispatchEvent(new CustomEvent('CanvasDisplayEvent-Clean'))

            window.dispatchEvent(new CustomEvent('SharedStateRelay-DSMG-ioComm', {
                detail: {
                    name: 'CanvasDisplayEvent-Clean',
                }
            }))
        }, false);
        log.success("📦 Document State Manager", "Successfully initalised a new DocumentStateManager for document " + DocumentState.id, uiColors.pink)
    }
}

export default DocumentStateModule;