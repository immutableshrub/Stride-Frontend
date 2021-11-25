import uiColors from "../ui/theme/colors";

const CanvasToolFreehand = {
    cix: null,
    line: null,
    pointerId: null,
    points: [],
    colPoints: [],
    pos: [0, 0],
    docPos: [0, 0],
    stroke: {},
    pointTypes: [0, 0, 0],
    timeStamps: [],
    ephemeral: false,
    attach(cix) {
        this.cix = cix
        window.addEventListener('CanvasBuffer-CanvasToolFreehand-BeginDrawing', function (e) {
            if (!this.pointerId) {
                let timeStampStart = window.performance.now();
                this.pointerId = e.detail.id;
                this.points = [];
                this.colPoints = [];
                this.pos = [];
                this.stroke = {};
                this.pointTypes = [0, 0, 0, 0];
                this.timeStamps = [];
                this.ephemeral = false;
                this.docPos = WindowState.canvas.document.position.current;
                //cix.rect(10, 10).move(e.detail.position.x, e.detail.position.y).fill('#ff0000');
                this.points.push([e.detail.position.x, e.detail.position.y]);
                this.colPoints.push([e.detail.position.x, e.detail.position.y]);
                this.pointTypes[1]++;
                this.pointTypes[3]++;
                if (window.SettingsStateModule['flags.CoalescedEventsEnabled'] !== 'Disabled') this.colPoints.push([e.detail.position.x, e.detail.position.y]);
                this.pos = [e.detail.position.x, e.detail.position.y];
                switch (WindowState.canvas.currentSettings.type) {
                    case 'pen':
                        this.stroke = { color: WindowState.canvas.currentSettings.color, width: WindowState.canvas.currentSettings.width, linecap: 'round', linejoin: 'round' }
                        break;
                    case 'highlighter':
                        this.stroke = { color: '#f3e62f85', width: WindowState.canvas.currentSettings.width, linecap: 'square', linejoin: 'round' }
                        break;
                    case 'eraser':
                        this.stroke = { color: WindowState.canvas.document.background[1], width: 50, linecap: 'round', linejoin: 'round' }
                        break;
                }
                if (e.detail.button == 2 && SettingsStateModule['interaction.rightClickButtonAction'] == 'ephemeralStroke') {
                    this.ephemeral = true;
                    this.stroke = { color: '#eb4034', width: 5, linecap: 'round', linejoin: 'round' }
                }
                if (e.detail.button == 5) {
                    this.stroke = { color: WindowState.canvas.document.background[1], width: 50, linecap: 'round', linejoin: 'round' }
                }
                this.line = cix.polyline(this.points).fill('none').stroke(this.stroke)
                if (this.ephemeral == true) {
                    this.line.opacity(0.5)
                }
                let runTime = window.performance.now() - timeStampStart;
                this.timeStamps.push();
                if (window.SettingsStateModule['flags.forceSpeedSVGRendring'] !== 'auto') {
                    this.line.attr('shape-rendering', window.SettingsStateModule['flags.forceSpeedSVGRendring'])
                }
            }
        })
        window.addEventListener('CanvasBuffer-CanvasToolFreehand-AddDrawingPoint', function (e) {
            if (this.pointerId == e.detail.id) {
                let timeStampStart = window.performance.now();
                //cix.rect(10, 10).move(e.detail.position.x, e.detail.position.y).fill('#00ff00');
                if (e.detail.isCoalescedEvent == true && window.SettingsStateModule['flags.CoalescedEventsEnabled'] == 'Disabled') {
                    //this.points.push([e.detail.position.x, e.detail.position.y]);
                    //this.line.plot(this.points);
                    this.pointTypes[2]++;
                    this.pointTypes[3]++;
                } else if (e.detail.isCoalescedEvent == true && window.SettingsStateModule['flags.CoalescedEventsEnabled'] == 'EnabledOnlyCDX') {
                    //this.points.push([e.detail.position.x, e.detail.position.y]);
                    this.colPoints.push([e.detail.position.x, e.detail.position.y]);
                    this.line.plot(this.points);
                    this.pointTypes[1]++;
                    this.pointTypes[3]++;
                } else if (e.detail.isCoalescedEvent == true && window.SettingsStateModule['flags.CoalescedEventsEnabled'] == 'Enabled') {
                    this.points.push([e.detail.position.x, e.detail.position.y]);
                    this.colPoints.push([e.detail.position.x, e.detail.position.y]);
                    this.line.plot(this.points);
                    this.pointTypes[1]++;
                    this.pointTypes[3]++;
                } else if (e.detail.isCoalescedEvent == false) {
                    this.points.push([e.detail.position.x, e.detail.position.y]);
                    this.colPoints.push([e.detail.position.x, e.detail.position.y]);
                    this.line.plot(this.points);
                    this.pointTypes[0]++;
                    this.pointTypes[3]++;
                }
                if (this.pos[0] > e.detail.position.x) this.pos[0] = e.detail.position.x;
                if (this.pos[1] > e.detail.position.y) this.pos[1] = e.detail.position.y;
                let runTime = window.performance.now() - timeStampStart;
                this.timeStamps.push();
                if (runTime > 4 && window.SettingsStateModule['flags.forceSpeedSVGRendring'] == 'auto') {
                    this.line.attr('shape-rendering', 'optimizeSpeed');
                    log.debug('🧩 Canvas CanvasBuffer-CanvasToolFreehandModule', 'Performing rendering mode switchover to optimizeSpeed', uiColors.blue_d);
                }
                /*
                const thisTimestamp =window.performance.now() - timeStampStart; 
                this.timeStamps.push(thisTimestamp);
                const colPointTotal = (Math.round((((this.pointTypes[1] + this.pointTypes[2]) / this.pointTypes[3]) + Number.EPSILON) * 1000000) / 1000000);
                const timeStampAverage = timeStamps.reduce((a, v, i) => (a * i + v) / (i + 1));

                log.display('Latency CURRENT: ' + (Math.round((thisTimestamp + Number.EPSILON) * 1000000) / 1000000) + 'ms\nLatency MAXIMUM: ' +  (Math.round((Math.max(...timeStamps) + Number.EPSILON) * 1000000) / 1000000) + 'ms\nLatency AVERAGE: ' + (Math.round((timeStampAverage + Number.EPSILON) * 1000000) / 1000000) + 'ms\nCoalesced AVEGE: ' + colPointTotal + '%');
                */
            }
        })
        window.addEventListener('CanvasBuffer-CanvasToolFreehand-EndDrawing', function (e) {
            if (this.pointerId == e.detail.id) {
                let timeStampStart = window.performance.now();
                //cix.rect(10, 10).move(e.detail.position.x, e.detail.position.y).fill('#0000ff');
                this.points.push([e.detail.position.x, e.detail.position.y]);
                this.line.plot(this.points);
                if (window.SettingsStateModule['flags.CoalescedEventsEnabled'] !== 'Disabled') this.points = this.colPoints;
                if (this.pos[0] > e.detail.position.x) this.pos[0] = e.detail.position.x;
                if (this.pos[1] > e.detail.position.y) this.pos[1] = e.detail.position.y;
                this.points.forEach((point, index) => {
                    this.points[index] = [(point[0] - this.pos[0]), (point[1] - this.pos[1]),]
                })
                if (this.ephemeral == false) {
                    window.dispatchEvent(new CustomEvent('DocumentStateEvent-AddElement', {
                        detail: {
                            renderer: 'penstroke',
                            type: WindowState.canvas.currentSettings.type,
                            position: [(this.pos[0] + this.docPos[0]), (this.pos[1] + this.docPos[1])],
                            data: {
                                stroke: this.stroke,
                                points: this.points
                            },
                            source: 'self'
                        }
                    }));
                    this.line.remove();
                } else {
                    const line = this.line;
                    setTimeout(() => {
                        line.remove();
                    }, 1250);
                    line.animate(250, 1000, 'now').opacity(0);
                }
                const colPointTotal = (Math.round((((this.pointTypes[1] + this.pointTypes[2]) / this.pointTypes[3]) + Number.EPSILON) * 1000000) / 1000000) * 100;
                this.timeStamps.push(window.performance.now() - timeStampStart);
                const timeStampAverage = timeStamps.reduce((a, v, i) => (a * i + v) / (i + 1));
                log.debug('🧩 Canvas CanvasBuffer-CanvasToolFreehandModule', this.pointTypes[0] + ' Normal Points, ' + this.pointTypes[1] + ' Coalesced, ' + this.pointTypes[2] + ' Coalesced and skipped for a total of ' + this.pointTypes[3] + ' (' + colPointTotal + '% Coalesced)', uiColors.blue_d);
                log.debug('🧩 Canvas CanvasBuffer-CanvasToolFreehandModule', 'The average time to process a point was: ' + timeStampAverage + 'ms (Min: ' + Math.min(...timeStamps) + 'ms, Max: ' + Math.max(...timeStamps) + 'ms)', uiColors.blue_d);
                if (colPointTotal < 5 && timeStampAverage < 2 && Math.max(...timeStamps) < 5) {
                    log.info('🧩 Canvas CanvasBuffer-CanvasToolFreehandModule', 'This device is a good canidate for providing Coalesced events to the CIX.', uiColors.blue_d);
                }
                this.cix = null;
                this.pointerId = null;
                this.points = [];
                this.colPoints = [];
                this.pos = [0, 0];
                this.docPos = [0, 0];
                this.stroke = {};
                this.pointTypes = [0, 0, 0];
                this.timeStamps = [];
                this.line = null;
            }
        })
        window.addEventListener('CanvasBuffer-CanvasToolFreehand-CancelDrawing', function (e) {
            this.cix = null;
            this.line = null;
            this.pointerId = null;
            this.points = [];
            this.colPoints = [];
            this.pos = [0, 0];
            this.docPos = [0, 0];
            this.stroke = {};
            this.pointTypes = [0, 0, 0];
            this.timeStamps = [];
            cix.clear()
        })
        log.debug('🧩 Canvas CanvasBuffer-CanvasToolFreehandModule', 'Successfully created the canvasBuffer Freehand', uiColors.blue_d);
    }
}

export default CanvasToolFreehand