import uiColors from "../ui/theme/colors";

const CanvasBuffer = {
    cix: null,
    line: null,
    pointerId: null,
    points: [],
    pos: [0, 0],
    docPos: [0, 0],
    stroke: {},
    attach(cix) {
        this.cix = cix
        window.addEventListener('CanvasBuffer-BeginDrawing', function (e) {
            if (!this.pointerId) {
                this.pointerId = e.detail.pointerId;
                this.points = [];
                this.pos = [];
                this.stroke = {};
                this.docPos = WindowState.canvas.document.position.current;
                //cix.rect(10, 10).move(e.detail.x, e.detail.y).fill('#ff0000');
                this.points.push([e.detail.x, e.detail.y]);
                this.pos = [e.detail.x, e.detail.y];
                switch (WindowState.canvas.currentSettings.type) {
                    case 'pen':
                        this.stroke = { color: WindowState.canvas.currentSettings.color, width: WindowState.canvas.currentSettings.width, linecap: 'round', linejoin: 'round' }
                        break;
                    case 'highlighter':
                        this.stroke = { color: WindowState.canvas.currentSettings.color, width: WindowState.canvas.currentSettings.width, linecap: 'square', linejoin: 'round' }
                        break;
                    case 'eraser':
                        this.stroke = { color: '#ffffff', width: 10, linecap: 'round', linejoin: 'round' }
                        break;
                }
                this.line = cix.polyline(this.points).fill('none').stroke(this.stroke)
            }
        })
        window.addEventListener('CanvasBuffer-AddDrawingPoint', function (e) {
            if (this.pointerId == e.detail.pointerId) {
                //cix.rect(10, 10).move(e.detail.x, e.detail.y).fill('#00ff00');
                this.points.push([e.detail.x, e.detail.y]);
                this.line.plot(this.points);
                if (this.pos[0] > e.detail.x) this.pos[0] = e.detail.x;
                if (this.pos[1] > e.detail.y) this.pos[1] = e.detail.y;
            }
        })
        window.addEventListener('CanvasBuffer-EndDrawing', function (e) {
            if (this.pointerId == e.detail.pointerId) {
                //cix.rect(10, 10).move(e.detail.x, e.detail.y).fill('#0000ff');
                this.points.push([e.detail.x, e.detail.y]);
                this.line.plot(this.points);
                if (this.pos[0] > e.detail.x) this.pos[0] = e.detail.x;
                if (this.pos[1] > e.detail.y) this.pos[1] = e.detail.y;
                this.points.forEach((point, index) => {
                    this.points[index] = [(point[0] - this.pos[0]), (point[1] - this.pos[1]),]
                })
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
                this.points = [];
                this.pos = [];
                this.docPos = [];
                this.pointerId = null;
                this.line = null;
                cix.clear()
            }
        })
        window.addEventListener('CanvasBuffer-CancelDrawing', function (e) {
            this.points = [];
            this.pos = [];
            this.docPos = [];
            this.pointerId = null;
            this.line = null;
            cix.clear()
        })
        log.debug('🧩 Canvas CanvasBufferModule', 'Successfully created the canvasBuffer', uiColors.teal);
    }
}

export default CanvasBuffer