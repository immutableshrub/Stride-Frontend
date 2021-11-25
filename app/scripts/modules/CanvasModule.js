import { SVG, extend as SVGextend, Element as SVGElement } from '@svgdotjs/svg.js'
import uiColors from '../ui/theme/colors';
import uiIcons from '../ui/theme/icons';
import Mousetrap from 'mousetrap';
import CanvasBuffer from '../buffers/canvasBuffer';
import DisplayBuffer from '../buffers/displayBuffer';
import CanvasTool from '../tools/CanvasTool';
import InteractionModule from './InteractionModule';
import '../../styles/uie-canvasContainerModule.css'
import SimpleMenu from '../ui/components/simplemenu/simplemenu';

class CanvasModule {
    ccx = null; // canvas container
    cdx = null; // canvas display layer
    cix = null; // canvas interaction layer
    constructor(uiDocument) {
        log.debug('🧩 Canvas Base Module', 'Creating SVGJS instance', uiColors.teal);
        const container = document.createElement('div');
        container.setAttribute('uie-ref', 'canvasContinerModule');
        this.ccx = uiDocument.attachmentPoints.canvas.appendChild(container);
        this.cdx = SVG().addTo('[uie-ref="canvasContinerModule"]').size(WindowState.canvas.document.size[0], WindowState.canvas.document.size[1]);
        this.cix = SVG().addTo('[uie-ref="canvasContinerModule"]').size(WindowState.canvas.document.size[0], WindowState.canvas.document.size[1]);
        if (WindowState.canvas.document.background[0] == 'color') {
            this.cdx.css('background-color', WindowState.canvas.document.background[1])
        }
        uiDocument.components.canvas = {
            ccx: this.ccx,
            cdx: this.cdx,
            cix: this.cix
        };
        this.ccx.scrollTo(WindowState.canvas.document.position.current[0], WindowState.canvas.document.position.current[1]);
        this.registerTools();
        InteractionModule.registerListeners(this.ccx);
        CanvasBuffer.attach(this.cix);
        DisplayBuffer.attach(this.cdx)
        CanvasTool(this.cix)
        log.success('🧩 Canvas Base Module', 'Successfully created SVGJS instance', uiColors.teal);
    }

    registerTools() {
        WindowState.ui.toolbox.forEach((tool, index) => {
            const toolAction = (e) => {
                switch (tool.type) {
                    case 'workspaceCommand':
                        WindowState.canvas.currentSettings.type = tool.inputType;
                        WindowState.canvas.currentSettings.draws = tool.draws;
                        if (tool.draws && tool.inputType !== 'eraser') {
                            WindowState.canvas.currentSettings.width = tool.width;
                        }
                        break;
                    case 'documentCommand':
                        window.dispatchEvent(new CustomEvent(tool.event));
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
                        uiDocument.components.controlbar.fakeActiveItem(index);
                    }
                    toolAction();
                });
            }
            if (tool.type == 'spacer') {
                uiDocument.components.controlbar.addItem('spacer' + index, '', '', 'spacer');
            } else { uiDocument.components.controlbar.addItem(tool.id || 'tool' + index, tool.name, uiIcons[tool.icon.split('/')[0]][tool.icon.split('/')[1]], tool.type, toolAction, (tool.active || false), (tool.repeats || false), (tool.showArrow || false), (tool.disableOpacity || false)) }
        });
        window.addEventListener('DocumentStateEvent-DocumentSettingsChanged', () => {
            uiDocument.components.controlbar.currentColor = WindowState.canvas.currentSettings.color
        })
    }


}

export default CanvasModule;