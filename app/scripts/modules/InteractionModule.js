
const InteractionModule = {
    registerListeners(ccx) {
        //ccx.addEventListener('pointerdown', this.old.pointerDown);
        //ccx.addEventListener('pointermove', this.old.pointerMove);
        //ccx.addEventListener('pointerup', this.old.pointerUp);
        //ccx.addEventListener('pointercancel', this.old.pointerCancel);

        WindowState.ihs.supports.PointerEvents = typeof document.defaultView.PointerEvent !== "undefined";
        WindowState.ihs.supports.CoalescedEvents = WindowState.ihs.supports.PointerEvents ? document.defaultView.PointerEvent.prototype.getCoalescedEvents : undefined;

        if (WindowState.ihs.supports.PointerEvents == true) {
            ccx.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                switch (window.SettingsStateModule['flags.PointerEventHandler']) {
                    case 'UseLegacyHandler':
                        this.old.pointerDown(e);
                        break;
                    case 'UseTransitionalHandler':
                        this.adapters.pointerEvent(this, e, false)
                        break;
                }
                return false;
            });
            ccx.addEventListener('pointermove', (e) => {
                e.preventDefault();
                switch (window.SettingsStateModule['flags.PointerEventHandler']) {
                    case 'UseLegacyHandler':
                        this.old.pointerMove(e)
                        break;
                    case 'UseTransitionalHandler':
                        if (WindowState.ihs.supports.CoalescedEvents && window.SettingsStateModule['flags.CoalescedEventsEnabled'] !== 'Disabled') {
                            let colaesced = e.getCoalescedEvents()
                            colaesced.forEach((e, index) => {
                                this.adapters.pointerEvent(this, e, (index !== (colaesced.length - 1)))
                            })
                        } else {
                            this.adapters.pointerEvent(this, e, false)
                        }
                        break;
                }
                return false;
            });
            ccx.addEventListener('pointerup', (e) => {
                e.preventDefault();
                switch (window.SettingsStateModule['flags.PointerEventHandler']) {
                    case 'UseLegacyHandler':
                        this.old.pointerUp(e)
                        break;
                    case 'UseTransitionalHandler':
                        this.adapters.pointerEvent(this, e, false)
                        break;
                }
                return false;
            });
            ccx.addEventListener('pointercancel', (e) => {
                e.preventDefault();
                switch (window.SettingsStateModule['flags.PointerEventHandler']) {
                    case 'UseLegacyHandler':
                        this.old.pointerCancel(e);
                        break;
                    case 'UseTransitionalHandler':
                        this.adapters.pointerEvent(this, e, false)
                        break;
                }
                return false;
            });
            ccx.addEventListener('pointercancel', (e) => {
                e.preventDefault()
                console.log('Pointer moved out', e);
                return false;
            });
            ccx.addEventListener('contextmenu', (e) => {
                e.preventDefault()
                return false;
            });
            ccx.addEventListener('wheel', (e) => {
                e.preventDefault()
                WindowState.canvas.document.position.zoomScale += e.deltaY * 0.001;
                WindowState.canvas.document.position.zoomScale = Math.min(Math.max(0.5, WindowState.canvas.document.position.zoomScale), 4);
                uiDocument.components.canvas.ccx.scrollTo(WindowState.canvas.document.position.current[0], WindowState.canvas.document.position.current[1]);
                document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transition = '0.2s linear';
                document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transform = 'scale(' + WindowState.canvas.document.position.zoomScale + ')';
                return false;
            });
        } else {
            log.warn('InteractionModule', 'This browser dows not support pointer events. Falling back to legacy MouseEvents')
        }
    },
    adapters: {
        pointerEvent(thisPassed, e, isCoalescedEvent) {
            const newE = {
                event: e.type,
                id: e.pointerId,
                type: e.pointerType,
                button: e.button,
                detail: {
                    pressure: e.pressure,
                    size: {
                        x: e.width,
                        y: e.height
                    },
                    tilt: {
                        x: e.tiltX,
                        y: e.tiltY
                    }
                },
                position: {
                    x: (e.clientX / WindowState.canvas.document.position.zoomScale),
                    y: (e.clientY / WindowState.canvas.document.position.zoomScale),
                    movementX: e.movementX,
                    movementY: e.movementY
                },
                keys: {
                    ctrl: e.ctrlKey,
                    alt: e.altKey,
                    shift: e.shiftKey
                },
                isCoalescedEvent: isCoalescedEvent,
                raw: e
            };
            if (window.SettingsStateModule['flags.InteractionModuleDebugMode'] == 'LogEventsToConsole') {
                console.log(newE)
            } else if (window.SettingsStateModule['flags.InteractionModuleDebugMode'] == 'LogEventsToDisplay') {
                log.display(JSON.stringify(newE))
            } else if (window.SettingsStateModule['flags.InteractionModuleDebugMode'] == 'LogEventsToConsoleAndDisplay') {
                console.log(newE)
                log.display(JSON.stringify(newE))
            }
            thisPassed.handlers[e.type](newE, thisPassed);
        }
    },
    handlers: {
        pointerdown(e) {
            WindowState.ihs.pointers.push(e.id);
            e.raw.preventDefault();
            if (WindowState.ihs.pointers.length <= 1) {
                WindowState.ihs.pointerOrig = e.id;
                WindowState.ihs.offloader = '';
                if (WindowState.canvas.currentSettings.draws == true &&
                    WindowState.ui.currentState.isInteracting == false &&
                    WindowState.ihs.pointerdown == false &&
                    e.button == 0 &&
                    e.keys.ctrl == false && (
                        (SettingsStateModule['interaction.allowTouchDrawing'] == false && e.type !== 'touch') ||
                        (SettingsStateModule['interaction.allowTouchDrawing'] == true)
                    )) WindowState.ihs.offloader = 'Freehand';
                else if (WindowState.canvas.currentSettings.draws == true &&
                    WindowState.ui.currentState.isInteracting == false &&
                    WindowState.ihs.pointerdown == false &&
                    e.button == 5 &&
                    e.keys.ctrl == false && (
                        (SettingsStateModule['interaction.allowTouchDrawing'] == false && e.type !== 'touch') ||
                        (SettingsStateModule['interaction.allowTouchDrawing'] == true)
                    )) WindowState.ihs.offloader = 'Freehand';
                else if (WindowState.canvas.currentSettings.draws == true &&
                    WindowState.ui.currentState.isInteracting == false &&
                    WindowState.ihs.pointerdown == false &&
                    e.button == 2 &&
                    e.keys.ctrl == false && (
                        (SettingsStateModule['interaction.allowTouchDrawing'] == false && e.type !== 'touch') ||
                        (SettingsStateModule['interaction.allowTouchDrawing'] == true)
                    ) &&
                    SettingsStateModule['interaction.rightClickButtonAction'] == 'ephemeralStroke') WindowState.ihs.offloader = 'Freehand';
                else if (SettingsStateModule['interaction.penAlwaysDraws'] == true &&
                    WindowState.ui.currentState.isInteracting == false &&
                    WindowState.ihs.pointerdown == false &&
                    e.button == 0 &&
                    e.keys.ctrl == false &&
                    e.type == 'pen') WindowState.ihs.offloader = 'Freehand';
                else if (WindowState.canvas.currentSettings.draws == true &&
                    WindowState.ui.currentState.isInteracting == false &&
                    WindowState.ihs.pointerdown == false &&
                    e.button == 0 &&
                    e.keys.ctrl == true) WindowState.ihs.offloader = 'Pan';
                else if (WindowState.canvas.currentSettings.draws == false &&
                    WindowState.canvas.currentSettings.type == 'pan' &&
                    WindowState.ui.currentState.isInteracting == false &&
                    WindowState.ihs.pointerdown == false &&
                    e.button == 0 &&
                    e.keys.ctrl == false) WindowState.ihs.offloader = 'Pan';
                switch (WindowState.ihs.offloader) {
                    case 'Freehand':
                        WindowState.ui.currentState.isInteracting = true;
                        WindowState.canvas.document.position.isPanning = false;
                        uiDocument.components.menubar.barState = 0;
                        uiDocument.components.controlbar.barState = 0;
                        WindowState.canvas.document.position.faker = false;
                        if (e.button == 5) {
                            WindowState.canvas.document.position.faker = uiDocument.components.controlbar.selectedItem
                            uiDocument.components.controlbar.fakeActiveItem(4);
                        }
                        if (e.button == 0 && SettingsStateModule['interaction.penAlwaysDraws'] == true && e.type == 'pen') {
                            if (WindowState.canvas.currentSettings.type !== 'pen' && WindowState.canvas.currentSettings.type !== 'highlighter' && WindowState.canvas.currentSettings.type !== 'eraser') {
                                WindowState.canvas.currentSettings.type = 'pen';
                                uiDocument.components.controlbar.clickItem('tool2');
                            }
                        }
                        window.dispatchEvent(new CustomEvent('CanvasBuffer-CanvasToolFreehand-BeginDrawing', { detail: e }));
                        break;
                    case 'Pan':
                        WindowState.ui.currentState.isInteracting = true;
                        uiDocument.components.menubar.barState = 0;
                        uiDocument.components.controlbar.barState = 0;
                        WindowState.canvas.document.position.isPanning = true;
                        WindowState.canvas.document.position.faker = false;
                        e.raw.target.requestPointerLock();
                        if (e.keys.ctrl) {
                            WindowState.canvas.document.position.faker = uiDocument.components.controlbar.selectedItem
                            uiDocument.components.controlbar.fakeActiveItem(0);
                        }
                        WindowState.ihs.pointerPos[0] = e.position.movementX;
                        WindowState.ihs.pointerPos[1] = e.position.movementY;
                        break;
                }
            } else if (WindowState.ihs.pointers.length == 2) {
                WindowState.ui.currentState.isInteracting = true;
                uiDocument.components.menubar.barState = 0;
                uiDocument.components.controlbar.barState = 0;
                WindowState.canvas.document.position.isPanning = true;
                WindowState.canvas.document.position.faker = false;
                WindowState.canvas.document.position.faker = uiDocument.components.controlbar.selectedItem
                uiDocument.components.controlbar.fakeActiveItem(0);
                WindowState.ihs.pointerPos[2] = e.position.movementX;
                WindowState.ihs.pointerPos[3] = e.position.movementY;
            } else {
                console.log('Pointer down on more than two touches');
            }
        },
        pointermove(e) {
            e.raw.preventDefault();
            //console.log(WindowState.ihs.pointerPos)
            if (WindowState.ihs.pointerOrig == e.id && WindowState.ihs.pointers.length <= 1) {
                switch (WindowState.ihs.offloader) {
                    case 'Freehand':
                        WindowState.ui.currentState.isInteracting = true;
                        uiDocument.components.menubar.barState = 0;
                        uiDocument.components.controlbar.barState = 0;
                        WindowState.canvas.document.position.isPanning = false;
                        window.dispatchEvent(new CustomEvent('CanvasBuffer-CanvasToolFreehand-AddDrawingPoint', { detail: e }));
                        break;
                    case 'Pan':
                        if (e.isCoalescedEvent == false) {
                            if (document.pointerLockElement == null) {
                                e.raw.target.requestPointerLock();
                            }
                            WindowState.canvas.document.position.current[0] -= ((e.position.movementX / window.devicePixelRatio) / WindowState.canvas.document.position.zoomScale);
                            WindowState.canvas.document.position.current[1] -= ((e.position.movementY / window.devicePixelRatio) / WindowState.canvas.document.position.zoomScale);
                            uiDocument.components.canvas.ccx.scrollTo(WindowState.canvas.document.position.current[0], WindowState.canvas.document.position.current[1]);
                            document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transition = '0s linear';
                            document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transform = 'scale(' + WindowState.canvas.document.position.zoomScale + ')';
                        }
                        break;
                }
            } else if (WindowState.ihs.pointerOrig == e.id && WindowState.ihs.pointers.length == 2) {
                if (WindowState.ihs.offloader == 'Freehand') window.dispatchEvent(new CustomEvent('CanvasBuffer-CanvasToolFreehand-CancelDrawing', { detail: e }));
                if (e.isCoalescedEvent == false) {
                    WindowState.ihs.pointerPos[0] = e.position.x;
                    WindowState.ihs.pointerPos[1] = e.position.y;
                    WindowState.canvas.document.position.current[0] -= ((e.position.movementX / window.devicePixelRatio) / WindowState.canvas.document.position.zoomScale);
                    WindowState.canvas.document.position.current[1] -= ((e.position.movementY / window.devicePixelRatio) / WindowState.canvas.document.position.zoomScale);
                    //WindowState.ihs.pointerPrevZoom.push(Math.sqrt(Math.pow((WindowState.ihs.pointerPos[0] - WindowState.ihs.pointerPos[2]), 2) + Math.pow((WindowState.ihs.pointerPos[1] - WindowState.ihs.pointerPos[3]), 2)))
                    //WindowState.ihs.pointerPrevZoom.shift();
                    //console.log(Math.min(WindowState.ihs.pointerPrevZoom[0] - WindowState.ihs.pointerPrevZoom[1], 1))
                    //WindowState.canvas.document.position.zoomScale += Math.min(WindowState.ihs.pointerPrevZoom[0] - WindowState.ihs.pointerPrevZoom[1], 10) * -0.005;
                    //WindowState.canvas.document.position.zoomScale = Math.min(Math.max(0.5, WindowState.canvas.document.position.zoomScale), 4);
                    uiDocument.components.canvas.ccx.scrollTo(WindowState.canvas.document.position.current[0], WindowState.canvas.document.position.current[1]);
                    document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transition = '0s linear';
                    document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transform = 'scale(' + WindowState.canvas.document.position.zoomScale + ')';
                }
            } else if (WindowState.ihs.pointerOrig !== e.id && WindowState.ihs.pointers.length == 2) {
                if (WindowState.ihs.offloader == 'Freehand') window.dispatchEvent(new CustomEvent('CanvasBuffer-CanvasToolFreehand-CancelDrawing', { detail: e }));
                if (e.isCoalescedEvent == false) {
                    WindowState.ihs.pointerPos[2] = e.position.x;
                    WindowState.ihs.pointerPos[3] = e.position.y;
                    WindowState.canvas.document.position.current[0] -= ((e.position.movementX / window.devicePixelRatio) / WindowState.canvas.document.position.zoomScale);
                    WindowState.canvas.document.position.current[1] -= ((e.position.movementY / window.devicePixelRatio) / WindowState.canvas.document.position.zoomScale);
                    //WindowState.ihs.pointerPrevZoom.push(Math.sqrt(Math.pow((WindowState.ihs.pointerPos[0] - WindowState.ihs.pointerPos[2]), 2) + Math.pow((WindowState.ihs.pointerPos[1] - WindowState.ihs.pointerPos[3]), 2)))
                    //WindowState.ihs.pointerPrevZoom.shift();
                    //console.log(Math.min(WindowState.ihs.pointerPrevZoom[0] - WindowState.ihs.pointerPrevZoom[1], 1))
                    //WindowState.canvas.document.position.zoomScale += Math.min(WindowState.ihs.pointerPrevZoom[0] - WindowState.ihs.pointerPrevZoom[1], 10) * -0.005;
                    //WindowState.canvas.document.position.zoomScale = Math.min(Math.max(0.5, WindowState.canvas.document.position.zoomScale), 4);
                    uiDocument.components.canvas.ccx.scrollTo(WindowState.canvas.document.position.current[0], WindowState.canvas.document.position.current[1]);
                    document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transition = '0s linear';
                    document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transform = 'scale(' + WindowState.canvas.document.position.zoomScale + ')';
                }
            }
        },
        pointerup(e) {
            e.raw.preventDefault();
            WindowState.ihs.pointers = WindowState.ihs.pointers.filter(touch => touch !== e.id)
            if (WindowState.ihs.pointerOrig == e.id) {
                WindowState.ui.currentState.isInteracting = false;
                uiDocument.components.menubar.barState = 1;
                uiDocument.components.controlbar.barState = 1;
                switch (WindowState.ihs.offloader) {
                    case 'Freehand':
                        e.raw.preventDefault();
                        WindowState.ui.currentState.isInteracting = false;
                        uiDocument.components.menubar.barState = 1;
                        uiDocument.components.controlbar.barState = 1;
                        WindowState.canvas.document.position.isPanning = false;
                        window.dispatchEvent(new CustomEvent('CanvasBuffer-CanvasToolFreehand-EndDrawing', { detail: e }));
                        if (WindowState.canvas.document.position.faker !== false) {
                            uiDocument.components.controlbar.fakeActiveItem(WindowState.canvas.document.position.faker);
                            WindowState.canvas.document.position.faker = false;
                        }
                        WindowState.canvas.document.position.faker = false;
                        break;
                    case 'Pan':
                        e.raw.preventDefault();
                        document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transition = '0.5s cubic-bezier(.86, 0, .07, 1)';
                        if (document.pointerLockElement !== null) {
                            document.exitPointerLock();
                        }
                        WindowState.ui.currentState.isInteracting = false;
                        uiDocument.components.menubar.barState = 1;
                        uiDocument.components.controlbar.barState = 1;
                        if (WindowState.canvas.document.position.isPanning && WindowState.canvas.document.position.faker !== false) {
                            uiDocument.components.controlbar.fakeActiveItem(WindowState.canvas.document.position.faker);
                            WindowState.canvas.document.position.faker = false;
                        }
                        WindowState.canvas.document.position.faker = false;
                        WindowState.canvas.document.position.isPanning = false;
                        break;
                }
                WindowState.ihs.offloader = '';
            }
        },
        pointercancel(e) {
            e.raw.preventDefault();
            WindowState.ihs.pointers = WindowState.ihs.pointers.filter(touch => touch !== e.id)
            WindowState.ui.currentState.isInteracting = false;
            uiDocument.components.menubar.barState = 1;
            uiDocument.components.controlbar.barState = 1;
            WindowState.canvas.document.position.isPanning = false;
            WindowState.ihs.offloader = '';
            switch (WindowState.ihs.offloader) {
                case 'Freehand':
                    e.raw.preventDefault();
                    WindowState.ui.currentState.isInteracting = false;
                    uiDocument.components.menubar.barState = 1;
                    uiDocument.components.controlbar.barState = 1;
                    WindowState.canvas.document.position.isPanning = false;
                    window.dispatchEvent(new CustomEvent('CanvasBuffer-CanvasToolFreehand-CancelDrawing', { detail: e }));
                    if (WindowState.canvas.document.position.faker !== false) {
                        uiDocument.components.controlbar.fakeActiveItem(WindowState.canvas.document.position.faker);
                        WindowState.canvas.document.position.faker = false;
                    }
                    WindowState.canvas.document.position.faker = false;
                    break;
                case 'Pan':
                    e.raw.preventDefault();
                    document.querySelector('div[uie-ref="CanvasMountContainer"]').style.transition = '0.5s cubic-bezier(.86, 0, .07, 1)';
                    WindowState.ui.currentState.isInteracting = false;
                    uiDocument.components.menubar.barState = 1;
                    uiDocument.components.controlbar.barState = 1;
                    if (WindowState.canvas.document.position.isPanning && WindowState.canvas.document.position.faker !== false) {
                        uiDocument.components.controlbar.fakeActiveItem(WindowState.canvas.document.position.faker);
                        WindowState.canvas.document.position.faker = false;
                    }
                    WindowState.canvas.document.position.faker = false;
                    WindowState.canvas.document.position.isPanning = false;
                    break;
            }
        }
    },
    old: {
        pointerDown(e) {
            e.preventDefault();
            if (WindowState.canvas.currentSettings.draws && WindowState.ui.currentState.isInteracting == false && e.ctrlKey == false && e.altKey == false) {
                WindowState.ui.currentState.isInteracting = true;
                WindowState.canvas.document.position.isPanning = false;
                uiDocument.components.controlbar.barState = 0;
                window.dispatchEvent(new CustomEvent('CanvasBuffer-BeginDrawing', {
                    detail: {
                        e: e,
                        x: e.clientX,
                        y: e.clientY,
                        pointerId: e.pointerId,
                        pointerType: e.pointerType
                    }
                }));
            } else if ((WindowState.canvas.currentSettings.draws == false && WindowState.canvas.currentSettings.type == 'pan') || (WindowState.ui.currentState.isInteracting == false && e.ctrlKey == true && e.altKey == false)) {
                WindowState.ui.currentState.isInteracting = true;
                uiDocument.components.controlbar.barState = 0;
                WindowState.canvas.document.position.isPanning = true;
                WindowState.canvas.document.position.faker = false;
                if (e.ctrlKey) {
                    WindowState.canvas.document.position.faker = uiDocument.components.controlbar.selectedItem
                    uiDocument.components.controlbar.fakeActiveItem(0);
                }
            }
        },
        pointerMove(e) {
            e.preventDefault();
            if (WindowState.canvas.currentSettings.draws && WindowState.ui.currentState.isInteracting == true && WindowState.canvas.document.position.isPanning == false) {
                WindowState.ui.currentState.isInteracting = true;
                uiDocument.components.controlbar.barState = 0;
                WindowState.canvas.document.position.isPanning = false;
                window.dispatchEvent(new CustomEvent('CanvasBuffer-AddDrawingPoint', {
                    detail: {
                        e: e,
                        x: e.clientX,
                        y: e.clientY,
                        pointerId: e.pointerId,
                        pointerType: e.pointerType
                    }
                }));
            } else if (WindowState.canvas.document.position.isPanning == true) {
                WindowState.canvas.document.position.current[0] -= e.movementX;
                WindowState.canvas.document.position.current[1] -= e.movementY;
                uiDocument.components.canvas.ccx.scrollTo(WindowState.canvas.document.position.current[0], WindowState.canvas.document.position.current[1]);
            }
        },
        pointerUp(e) {
            e.preventDefault();
            if (WindowState.canvas.document.position.isPanning && WindowState.canvas.document.position.faker !== false) {
                uiDocument.components.controlbar.fakeActiveItem(WindowState.canvas.document.position.faker);
                WindowState.canvas.document.position.faker = false;
            }
            WindowState.canvas.document.position.faker = false;
            WindowState.ui.currentState.isInteracting = false;
            uiDocument.components.controlbar.barState = 1;
            WindowState.canvas.document.position.isPanning = false;
            window.dispatchEvent(new CustomEvent('CanvasBuffer-EndDrawing', {
                detail: {
                    e: e,
                    x: e.clientX,
                    y: e.clientY,
                    pointerId: e.pointerId,
                    pointerType: e.pointerType
                }
            }));
        },
        pointerCancel(e) {
            e.preventDefault();
            if (WindowState.canvas.document.position.isPanning && WindowState.canvas.document.position.faker !== false) {
                uiDocument.components.controlbar.fakeActiveItem(WindowState.canvas.document.position.faker);
                WindowState.canvas.document.position.faker = false;
            }
            WindowState.canvas.document.position.faker = false;
            WindowState.ui.currentState.isInteracting = false;
            uiDocument.components.controlbar.barState = 1;
            WindowState.canvas.document.position.isPanning = false;
            window.dispatchEvent(new CustomEvent('CanvasBuffer-CancelDrawing', {
                detail: {
                    e: e,
                    x: e.clientX,
                    y: e.clientY,
                    pointerId: e.pointerId,
                    pointerType: e.pointerType
                }
            }));
        },
    }
}

export default InteractionModule