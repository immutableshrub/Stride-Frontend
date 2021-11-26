class Noti {
    notiEl = null;
    constructor(text, icon) {
        this.notiEl = document.createElement('figure');
        this.notiEl.classList.add('noti');
    }
}

function createNotibarrier() {
    const container = document.createElement('aside');
    container.classList.add('noti-cont');
    document.body.appendChild(container);
}