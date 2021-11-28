class OTDocument {
    ops = [];
    currentID = '';

    utils = {
        generators: {
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
        },
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
    handlers = {
        register(evts, fn) {
            evts.split(',').forEach(evt => {
                this.handlers.events[evt].push(fn);
            });
            this.handlers.apply = (evt, data) => {
                this.handlers.events[evt].forEach((e) => {
                    e(data);
                });
                this.handlers.events.all.forEach((e) => {
                    e(data);
                });
            }
            return fn;
        },
        apply(evt, data) { },
        events: {
            all: [],
            ins: [],
            mod: [],
            del: [],
            rvt: [],
            pch: [],
            pca: [],
        },
    }
    ins(objData) {
        let opData = {
            op: 'insert',
            id: 'o' + this.utils.generators.opid(),
            el: 'e' + this.utils.generators.opid(),
            ts: Date.now(),
            by: this.currentID,
            data: objData
        };
        this.ops.push(opData);
        this.pcg(opData);
        this.handlers.apply('ins', opData);
        return opData;
    }
    mod(opID, objData) {
        let opData = {
            op: 'modify',
            id: 'o' + this.utils.generators.opid(),
            el: opID,
            ts: Date.now(),
            by: this.currentID,
            data: objData
        };
        this.ops.push(opData);
        this.pcg(opData);
        this.handlers.apply('mod', opData);
        return opData;
    }
    del(opID) {
        let opData = {
            op: 'delete',
            id: 'o' + this.utils.generators.opid(),
            el: opID,
            ts: Date.now(),
            by: this.currentID,
        };
        this.ops.push(opData);
        this.pcg(opData);
        this.handlers.apply('del', opData);
        return opData;
    }
    rvt(opID) {
        let opData = {
            op: 'revert',
            id: 'o' + this.utils.generators.opid(),
            ts: Date.now(),
            by: this.currentID,
            data: { oid: opID },
        };
        this.ops.push(opData);
        this.pcg(opData);
        this.handlers.apply('rvt', opData);
        return opData;
    }
    pcg(op) {
        let opPatch = JSON.stringify({
            id: 'p' + this.utils.generators.opid(),
            ts: Date.now(),
            actorID: this.currentID,
            patchContents: op
        });
        let hash = this.utils.hash(opPatch)
        this.handlers.apply('pch', hash + ',' + btoa(opPatch));
        return opPatch;
    }
    pca(pkt) {
        let decoded = pkt.split(',')
        let pach = atob(decoded[1])
        if (decoded[0] == this.utils.hash(pach)) {
            let pack = JSON.parse(pach);
            if (pack.actorID != this.currentID) {
                this.align();
                this.ops.push(pack.patchContents);
                this.align();
                this.handlers.apply('pca');
                return true;
            }
        }
    }
    generate() {
        let doc = new Map();
        let fltOps = this.flatten();
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
    }
    export() {
        let exp = JSON.stringify({
            ts: Date.now(),
            content: ops
        });
        let hash = this.utils.hash(opPatch)
        return hash + ',' + btoa(opPaexptch);
    }
    import(pkt) {
        let opst = atob(pkt[1]);
        if (pkt[0] == this.utils.hash(pkt[1])) {
            ops = JSON.parse(opst).content;
            return true;
        } else {
            return false;
        }
    }
    align() {
        this.ops.sort((a, b) => a.ts - b.ts);
    }
    flatten() {
        //never apply this to ops. ever. I MEAN IT.
        let modOps = this.ops.slice().reverse();
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
    }

    constructor(id, data) {
        this.ops = [];
        this.currentID = id;

        if (data) {
            this.import(data);
        }

        this.ins = this.ins.bind(this);
        this.mod = this.mod.bind(this);
        this.del = this.del.bind(this);
        this.rvt = this.rvt.bind(this);
        this.pca = this.pca.bind(this);
        this.import = this.import.bind(this);
        this.export = this.export.bind(this);
        this.registerEvents = this.handlers.register.bind(this);
        this.generate = this.generate.bind(this);
    }
}

export default OTDocument