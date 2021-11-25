import uiColors from "../ui/theme/colors";

const DisplayBuffer = {
    cdx: null,
    attach(cdx) {
        this.cdx = cdx
        window.addEventListener('CanvasDisplayEvent-Clean', function (e) {
            log.debug('🧩 Canvas DisplayBufferModule', 'Cleaning Canvas ', uiColors.teal);
            cdx.find('*').remove();
        }, false);
        window.addEventListener('CanvasDisplayEvent-RemoveElement', function (e) {
            const id = e.detail;
            log.debug('🧩 Canvas DisplayBufferModule', 'Removing element ' + id, uiColors.teal);
            cdx.find('[id="' + id + '"]').remove();
        }, false);
        window.addEventListener('CanvasDisplayEvent-AddElement', function (e) {
            const element = e.detail.data;
            const source = e.detail.source;
            var object = null;
            log.debug('🧩 Canvas DisplayBufferModule', 'Inserting element ' + element.id + ' at position ' + element.position.x + ':' + element.position.y + ' using renderer ' + element.renderer + ' (Source: ' + source + ')', uiColors.teal);
            if (cdx.find('[id="' + element.id + '"]').length > 0) {
                cdx.find('[id="' + element.id + '"]').remove();
            }
            switch (element.renderer) {
                case 'penstroke':
                    log.debug('🧩 Canvas DisplayBufferModule - Penstroke Renderer', 'Inserting element ' + element.id, uiColors.teal);
                    if (source !== window.ProfileState.userProfile) {
                        object = cdx.polyline(element.data.points).fill('none').stroke(element.data.stroke).move(element.position.x, element.position.y).attr('id', element.id).attr('vector-effect', 'non-scaling-stroke')
                        //object.attr({ opacity: '0' })
                        //object.animate(500, 0, 'now').attr({ opacity: '1' })
                    } else {
                        object = cdx.polyline(element.data.points).fill('none').stroke(element.data.stroke).move(element.position.x, element.position.y).attr('id', element.id).attr('vector-effect', 'non-scaling-stroke')
                    }
                    break;
            }
            if (source == 'selfredo') {
                object.attr({ opacity: '0' })
                object.animate(50, 0, 'now').attr({ opacity: '1' })
            }
        }, false);
    }
}

export default DisplayBuffer;