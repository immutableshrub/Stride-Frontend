import { v4 as uuidv4 } from 'uuid';
import uiColors from '../ui/theme/colors';
import SimpleDialog from '../ui/components/simpledialog/simpledialog';
import intl from '../intl/intl';
import uiIcons from '../ui/theme/icons';

import { Rabbit, enc, SHA3 } from 'crypto-js';

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
        data: ''
    };
    constructor(documentPotentialState) {
        const currentID = window.ProfileState.userProfile.id
        log.debug("📦 Document State Manager", "Document State Manager is initalising...", uiColors.pink)
        window.DocumentState = this.documentState;
        const generators = {
            opid() {
                return 'lll-yxxxxxxxx'.replace(/[lxy]/g, function (c) {
                    var r = (Math.random() * 16) | 0,
                        v = c == 'x' ? r : (r & 0x3) | c == 'l' ? r : (r & 0x3) | 'e';
                    return v.toString(16);
                });
            },
            uuid() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = (Math.random() * 16) | 0,
                        v = c == 'x' ? r : (r & 0x3) | 0x8;
                    return v.toString(16);
                });
            }
        }


        let ops = [];

        const selfState = {
            fwr: [],
            bwr: [],
        }


        const opsHandlers = {
            register(evts, fn) {
                evts.split(',').forEach(evt => {
                    this.events[evt].push(fn);
                });
                return fn;
            },
            apply(evt, data) {
                this.events[evt].forEach((e) => {
                    e(data);
                });
                this.events.all.forEach((e) => {
                    e(data);
                });
            },
            events: {
                all: [],
                ins: [],
                mod: [],
                del: [],
                rvt: [],
                pch: [],
                pca: []
            },
        };

        const opsFunctions = {
            ins(objData) {
                let opData = {
                    op: 'insert',
                    id: 'o' + generators.opid(),
                    el: 'e' + generators.opid(),
                    ts: Date.now(),
                    by: currentID,
                    data: objData
                };
                ops.push(opData);
                this.pcg(opData);
                opsHandlers.apply('ins', opData);
                return opData;
            },
            mod(opID, objData) {
                let opData = {
                    op: 'modify',
                    id: 'o' + generators.opid(),
                    el: opID,
                    ts: Date.now(),
                    by: currentID,
                    data: objData
                };
                ops.push(opData);
                this.pcg(opData);
                opsHandlers.apply('mod', opData);
                return opData;
            },
            del(opID) {
                let opData = {
                    op: 'delete',
                    id: 'o' + generators.opid(),
                    el: opID,
                    ts: Date.now(),
                    by: currentID,
                };
                ops.push(opData);
                this.pcg(opData);
                opsHandlers.apply('del', opData);
                return opData;
            },
            rvt(actorID, opID) {
                let opData = {
                    op: 'revert',
                    id: 'o' + generators.opid(),
                    ts: Date.now(),
                    by: actorID,
                    data: { oid: opID },
                };
                ops.push(opData);
                this.pcg(opData);
                opsHandlers.apply('rvt', opData);
                return opData;
            },
            pcg(op) {
                let opPatch = JSON.stringify({
                    id: 'p' + generators.opid(),
                    ts: Date.now(),
                    actorID: currentID,
                    patchContents: op
                });
                let hash = this.utils.hash(opPatch)
                opsHandlers.apply('pch', hash + ',' + window.btoa(opPatch));
                return opPatch;
            },
            pca(pkt) {
                ////console.log('ess')
                let decoded = pkt.split(',')
                let pach = window.atob(decoded[1])
                if (decoded[0] == this.utils.hash(pach)) {
                    let pack = JSON.parse(pach);
                    if (pack.actorID != this.currentID) {
                        //this.caretaker.align();
                        ops.push(pack.patchContents);
                        //this.caretaker.align();
                        opsHandlers.apply('pca');
                        return true;
                    }
                } else {
                    //console.log('es')
                }
            },
            generate() {
                let doc = new Map();
                //this.caretaker.align();
                let fltOps = this.caretaker.flatten();
                //console.log(fltOps);
                fltOps.forEach(op => {
                    switch (op.op) {
                        case 'insert':
                            doc.set(op.el, {
                                oi: op.id,
                                ct: op.ts,
                                ut: op.ts,
                                by: op.by,
                                data: op.data,
                            });
                            break;
                        case 'modify':
                            const docEl = doc.get(op.el);
                            docEl.data = { ...docEl.data, ...op.data };
                            docEl.ut = op.ts;
                            doc.set(op.el, docEl);
                            break;
                        case 'delete':
                            doc.delete(op.el);
                            break;
                    }
                });
                return doc;
            },
            caretaker: {
                align() {
                    ops.sort((a, b) => a.ts - b.ts);
                },
                flatten() {
                    //never apply this to ops. ever. I MEAN IT.
                    let modOps = ops.slice().reverse();
                    let transforms = {
                        reverts: [],
                        dels: [],
                    }
                    modOps.forEach(op => {
                        if (op.op === 'revert' && !transforms.reverts.includes(op.id)) {
                            transforms.reverts.push(op.data.oid);
                        }
                    })
                    modOps = modOps.filter(opi => !transforms.reverts.includes(opi.id));
                    modOps.forEach(op => {
                        if (op.op === 'delete') {
                            transforms.dels.push(op.el);
                        }
                    })
                    modOps = modOps.filter(opi => !transforms.dels.includes(opi.el));
                    modOps = modOps.filter(opi => opi.op !== 'revert');
                    return modOps.slice().reverse();
                },
            },
            utils: {
                hash(str) {
                    var hash = 0, i, chr;
                    if (str.length === 0) return hash;
                    for (i = 0; i < str.length; i++) {
                        chr = str.charCodeAt(i);
                        hash = ((hash << 5) - hash) + chr;
                        hash |= 0; // Convert to 32bit integer
                    }
                    return hash;
                }
            }
        }

        const slfFunctions = {
            addOp(op) {
                selfState.fwr.push(op.id);
            },
            undo() {
                let op = selfState.fwr.pop();
                selfState.bwr.push(opsFunctions.rvt(currentID, op).id);
            },
            redo() {
                let op = selfState.bwr.pop();
                selfState.fwr.push(opsFunctions.rvt(currentID, op).id);
            }
        }

        opsHandlers.register('ins,mod,del', (opData) => {
            if (opData.by === currentID) {
                slfFunctions.addOp(opData);
            }
        });

        opsHandlers.register('all', () => {
            let docGenerate = opsFunctions.generate();
            window.dispatchEvent(new CustomEvent('CanvasDisplayEvent-Clean'))
            docGenerate.forEach((doc, id) => {
                window.dispatchEvent(new CustomEvent('CanvasDisplayEvent-AddElement', {
                    detail: {
                        data: {
                            id: id,
                            ...doc.data
                        },
                        source: doc.by
                    }
                }))
            });
        });

        opsHandlers.register('pch', (e) => {
            window.dispatchEvent(new CustomEvent('SharedStateRelay-DSMG-ioComm', {
                detail: {
                    name: 'DocumentStateModule-DSMG-ioComm',
                    args: e,
                }
            }))
        });

        window.addEventListener('DocumentStateModule-DSMG-ioComm', function (e) {
            //console.log(e)
            opsFunctions.pca(e.detail)
        }, false);

        window.addEventListener('DocumentStateEvent-AddElement', function (e) {
            let id = opsFunctions.ins({
                renderer: e.detail.renderer,
                type: e.detail.type,
                position: {
                    x: e.detail.position[0],
                    y: e.detail.position[1]
                },
                data: e.detail.data
            });
        }, false);

        window.addEventListener('DocumentStateEvent-DocumentUndo', function (e) {
            slfFunctions.undo();
        }, false);
        window.addEventListener('DocumentStateEvent-DocumentRedo', function (e) {
            slfFunctions.redo();
        }, false);
        window.addEventListener('DocumentStateEvent-DocumentClearAll', function (e) {
        }, false);

        //console.log(this)
        //window.OTDocument_Export = opsFunctions.export.bind(this);
        //window.OTDocument_Import = opsFunctions.import.bind(this);

        window.OTDocument_Export = () => {
            //console.log(ops)
            let exp = JSON.stringify({
                ts: Date.now(),
                content: ops
            });
            let hash = opsFunctions.utils.hash(exp)
            return hash + ',' + window.btoa(exp);
        };
        window.OTDocument_Import = (ple) => {
            let pkt = ple.split(',')
            //console.log(ple, pkt)
            let opst = window.atob(pkt[1]);
            if (pkt[0] == opsFunctions.utils.hash(opst)) {
                ops = JSON.parse(opst).content;
                return true;
            } else {
                return false;
            }
        };

        window.addEventListener('DocumentStateEvent-DocumentClearAll', function (e) {
            new SimpleDialog(window.uiDocument, {
                title: intl.str('app.header.more.clearAllStrokes'),
                icon: uiIcons.pens.eraseScreen,
                canClose: true,
                largeDialog: false,
                body: intl.str('app.header.more.clearAllStrokesFailed'),
                buttons: [{
                    type: 'primary',
                    text: intl.str('app.ui.OKaction'),
                    callback: (e) => { },
                    close: true
                }],
            });
        }, false);

        window.addEventListener('DocumentStateEvent-File-Export', function (e) {
            const key = ''
            const name = window.DocumentState.name;
            const fname = name + '.bctx';

            const rawData = Rabbit.encrypt(OTDocument_Export(), key).toString();

            const nameEncode = new TextEncoder().encode(name);
            const textencode = new TextEncoder().encode(rawData);
            const dataHash = new TextEncoder().encode(SHA3(rawData, { outputLength: 512 }));
            const generationDate = Uint8Array.from(Date.now().toString().padStart(20, '0'))

            const view = new Uint8Array(textencode.length + dataHash.length + 500)

            //         view.set([5, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0)
            //version            |     |           |  
            // as               major  |           |
            //                         minor       |
            //                                     patch

            view.set([0, 1, 0, 0, 0, 4, 0, 0, 1, 5], 0);
            view.set(generationDate, 10)
            view.set(nameEncode, 100);
            view.set(dataHash, 300);
            view.set(textencode, 500);

            const dv = new DataView(view.length + 1);

            view.forEach((bytes, index) => {
                dv.setUint8(index + 1, bytes);
            })

            const fdownloadURL = URL.createObjectURL(new File([dv], fname, {
                type: "application/octet-stream",
            }));

            const downloadElm = document.createElement('a')
            downloadElm.setAttribute('href', fdownloadURL);
            downloadElm.setAttribute('download', fname);
            downloadElm.click();

            //console.log(enc.Utf8.stringify(rabbit.decrypt(enc.Hex.stringify(data), '')));
        })
        document.querySelector('title').innerText = this.documentState.name + ' - Stride';

    }
}

export default DocumentStateModule;