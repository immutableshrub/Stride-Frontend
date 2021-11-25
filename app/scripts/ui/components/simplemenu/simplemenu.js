import './simplemenu.css'
import uiIcons from '../../theme/icons';
class SimpleMenu {
    constructor(uiDocument, pos, items) {
        const container = document.createElement('div');
        container.classList.add('uie-simplemenu');
        container.addEventListener('click', (e) => {
            uiDocument.attachmentPoints.ui.removeChild(container);
        })
        let menuCont = container.appendChild(document.createElement('div'));
        menuCont.classList.add('uie-simplemenu-cont');
        menuCont.style.left = pos[0] + 'px';
        menuCont.style.top = pos[1] + 'px';
        menuCont.setAttribute('pos', pos[2] || 1);
        items.forEach(item => {
            switch (item.type) {
                case 'menuElement': {
                    let menuItem = menuCont.appendChild(document.createElement('div'));
                    menuItem.insertAdjacentHTML('afterbegin', uiIcons[item.icon.split('/')[0]][item.icon.split('/')[1]].replace('#212121', item.iconColor || '#212121'));
                    let menuItemText = menuItem.appendChild(document.createElement('p'));
                    menuItemText.innerText = item.name;
                    menuItem.addEventListener('click', item.onSelected);
                    menuCont.appendChild(menuItem);
                    break;
                }
                case 'seperator': {
                    menuCont.appendChild(document.createElement('hr'));
                    break;
                }
            }
        });
        uiDocument.attachmentPoints.ui.appendChild(container);
        return function destroy() {
            uiDocument.attachmentPoints.ui.removeChild(container);
        }
    }
}

export default SimpleMenu;