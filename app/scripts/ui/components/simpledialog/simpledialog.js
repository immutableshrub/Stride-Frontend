import template from './template.html?raw'
import uiIcons from '../../theme/icons';

class SimpleDialog {
    constructor(uiDocument, opts) {
        const config = Object.assign({
            title: '',
            icon: '',
            canClose: true,
            largeDialog: false,
            body: '',
            buttons: [/*{
                type: 'primary',
                text: 'OK',
                callback: () => { alert('closed') }
            }*/],
        }, opts);
        const container = document.createElement('div');
        container.classList.add('uie-simpledialog');
        container.insertAdjacentHTML('afterbegin', template);
        container.querySelector('[uie-ref="header"]').innerHTML = config.icon + '<span>' + config.title + '</span>';
        container.querySelector('[uie-ref="body"]').innerHTML = config.body;
        if (config.largeDialog == true) container.classList.add('uie-simplelargedialog');

        if (config.buttons.length > 0) {
            config.buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.classList.add('uie-simpledialog-button');
                btn.innerHTML = button.text;
                if (button.close) {
                    btn.addEventListener('click', button.callback);
                    btn.addEventListener('click', () => {
                        uiDocument.attachmentPoints.ui.querySelector('main.uie-dialog[uie-ref="dialogBackdrop"]').classList.add('hidden');
                        setTimeout(() => {
                            uiDocument.attachmentPoints.ui.querySelector('div.uie-simpledialog').remove();
                        }, 500)
                    });
                } else {
                    btn.addEventListener('click', button.callback);
                }
                container.querySelector('[uie-ref="buttons"]').appendChild(btn);
            })
        } else {
            container.querySelector('[uie-ref="buttons"]').remove();
        }
        if (config.canClose == false) container.querySelector('section[uie-ref="dialogElement"] header button[uie-ref="close"]').style.display = 'none';
        container.querySelector('section[uie-ref="dialogElement"] header button[uie-ref="close"]').innerHTML = uiIcons.ui.dismiss;
        container.querySelector('section[uie-ref="dialogElement"] header button[uie-ref="close"]').addEventListener('click', () => {
            uiDocument.attachmentPoints.ui.querySelector('main.uie-dialog[uie-ref="dialogBackdrop"]').classList.add('hidden');
            setTimeout(() => {
                uiDocument.attachmentPoints.ui.querySelector('div.uie-simpledialog').remove();
            }, 500)
        });
        uiDocument.attachmentPoints.ui.appendChild(container);
        window.requestAnimationFrame(() => {
            uiDocument.attachmentPoints.ui.querySelector('div.uie-simpledialog > main').classList.remove('hidden');
        })
        return container;
    }
}

export default SimpleDialog;