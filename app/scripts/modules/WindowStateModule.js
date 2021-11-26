import intl from "../intl/intl";
import SimpleDialog from "../ui/components/simpledialog/simpledialog";
import aboutDialogHTMLProvider from '../ui/components/simpledialog/aboutdialog.html?raw';
import uiIcons from "../ui/theme/icons";

class WindowStateModule {
    windowState = {
        ihs: {
            supports: {
                PointerEvents: false
            },
            CoalescedEventsEnabled: false,
            pointerdown: false,
            offloader: '',
            pointers: [],
            pointerOrig: 0,
            pointerPos: [0, 0, 0, 0],
            pointerPrevZoom: [0, 0]
        },
        ui: {
            currentState: {
                isInteracting: false
            },
            menubar: [
                {
                    type: 'systemCommand',
                    id: 'sys-managecollaboration',
                    icon: 'ui/people',
                    event: 'SystemStateEvent-CollaborationModule-ManagePeopleButton',
                    name: intl.str('app.header.managePeople')
                },
                {
                    type: 'spacer'
                },
                {
                    type: 'systemCommand',
                    id: 'sys-cloud',
                    icon: 'cloud/offline',
                    event: 'SystemStateEvent-CollaborationModule-ManageCloudButton',
                    name: intl.str('app.notice.cloud')
                },
                {
                    type: 'dropdownMenu',
                    id: 'dd-system',
                    icon: 'ui/more',
                    name: intl.str('app.header.more'),
                    pos: 2,
                    items: [
                        {
                            type: 'menuElement',
                            icon: 'pens/eraseScreen',
                            onSelected() {
                                window.dispatchEvent(new CustomEvent('DocumentStateEvent-DocumentClearAll'));
                            },
                            name: intl.str('app.header.more.clearAllStrokes')
                        },
                        {
                            type: 'seperator',
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/cog',
                            onSelected() {
                                window.dispatchEvent(new CustomEvent('SystemStateEvent-SettingsModule-SettingsDialog'))
                            },
                            name: intl.str('app.header.more.settings')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/info',
                            onSelected() {
                                new SimpleDialog(uiDocument, {
                                    title: intl.str('app.header.more.about'),
                                    icon: uiIcons.ui.beaker,
                                    canClose: true,
                                    body: aboutDialogHTMLProvider,
                                    buttons: []
                                });
                            },
                            name: intl.str('app.header.more.about')
                        },
                    ]
                }
            ],
            toolbox: [
                {
                    type: 'workspaceCommand',
                    draws: false,
                    inputType: 'pan',
                    icon: 'interaction/move',
                    name: intl.str('app.tool.pan'),
                    keyboardShortcut: ['g', 'G']
                },
                {
                    type: 'spacer'
                },
                {
                    type: 'workspaceCommand',
                    draws: true,
                    inputType: 'pen',
                    icon: 'pens/pen',
                    name: intl.str('app.tool.pen'),
                    width: 5,
                    active: true,
                    keyboardShortcut: ['p', 'P']
                },
                {
                    type: 'workspaceCommand',
                    draws: true,
                    inputType: 'highlighter',
                    icon: 'pens/highlighter',
                    name: intl.str('app.tool.highlighter'),
                    width: 20,
                    keyboardShortcut: ['h', 'H']
                },
                {
                    type: 'workspaceCommand',
                    draws: true,
                    inputType: 'eraser',
                    icon: 'pens/eraser',
                    name: intl.str('app.tool.eraser'),
                    keyboardShortcut: ['e', 'E']
                },
                {
                    type: 'spacer'
                },
                {
                    type: 'dropdownMenu',
                    icon: 'ui/color',
                    name: intl.str('app.tool.colorList.changeColor'),
                    pos: 4,
                    showArrow: true,
                    disableOpacity: true,
                    items: [
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#181a24',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#181a24';
                            },
                            name: intl.str('app.tool.colorList.black')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#C62828',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#C62828';
                            },
                            name: intl.str('app.tool.colorList.red')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#AD1457',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#AD1457';
                            },
                            name: intl.str('app.tool.colorList.pink')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#6A1B9A',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#6A1B9A';
                            },
                            name: intl.str('app.tool.colorList.purple')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#283593',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#283593';
                            },
                            name: intl.str('app.tool.colorList.indigo')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#1565C0',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#1565C0';
                            },
                            name: intl.str('app.tool.colorList.blue')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#00838F',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#00838F';
                            },
                            name: intl.str('app.tool.colorList.cyan')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#00695C',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#00695C';
                            },
                            name: intl.str('app.tool.colorList.teal')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#2E7D32',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#2E7D32';
                            },
                            name: intl.str('app.tool.colorList.green')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#9E9D24',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#9E9D24';
                            },
                            name: intl.str('app.tool.colorList.lime')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#F9A825',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#F9A825';
                            },
                            name: intl.str('app.tool.colorList.yellow')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/circle',
                            iconColor: '#EF6C00',
                            onSelected() {
                                WindowState.canvas.currentSettings.color = '#EF6C00';
                            },
                            name: intl.str('app.tool.colorList.orange')
                        },
                    ]
                },
                {
                    type: 'spacer'
                },
                {
                    type: 'documentCommand',
                    icon: 'actions/undo',
                    event: 'DocumentStateEvent-DocumentUndo',
                    name: intl.str('app.action.undo'),
                    keyboardShortcut: ['command+z', 'ctrl+z'],
                    repeats: true
                },
                {
                    type: 'documentCommand',
                    icon: 'actions/redo',
                    event: 'DocumentStateEvent-DocumentRedo',
                    name: intl.str('app.action.redo'),
                    keyboardShortcut: ['command+y', 'ctrl+y'],
                    repeats: true
                }
            ]
        },
        canvas: {
            document: {
                size: [1000000, 1000000],
                background: ['color', '#f3f6f9'],
                position: {
                    current: [500000, 500000],
                    isPanning: false,
                    faker: false,
                    zoomScale: 1,
                }
            },
            currentSettings: new Proxy({
                draws: true,
                type: 'pen',
                width: 5,
                color: '#181a24'
            }, {
                set(target, key, value) {
                    target[key] = value
                    window.dispatchEvent(new CustomEvent('DocumentStateEvent-DocumentSettingsChanged'));
                    return true;
                }
            })
        }
    }
    constructor() {
        window.WindowState = this.windowState;
    }
}

export default WindowStateModule;

