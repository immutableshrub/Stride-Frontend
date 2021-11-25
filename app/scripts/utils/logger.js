import uiColors from '../ui/theme/colors'
import Mousetrap from 'mousetrap'

class Logger {
    #logList = [];
    constructor() {
        this.#pushLog(1, "📑 Logger", "Logger is initalising...", uiColors.greys[4])
        this.#logList = []
        const container = document.createElement('p');
        container.classList.add('logger-display');
        container.classList.add('hidden');
        document.body.appendChild(container);
        Mousetrap.bind('shift+`', (e) => {
            e.preventDefault();
            document.querySelector('p.logger-display').classList.toggle('hidden')
            document.querySelector('p.logger-display').innerText = 'Toggled output visibility.\nTo show/hide, press SHIFT+`'
            return false;
        })
        window.log = this;
        this.#pushLog(3, "📑 Logger", "Logger has been initalised", uiColors.greys[4])
    }
    #pushLog(level, module, desc, color) {
        let obj = {
            time: Date.now(),
            level: level,
            module: module,
            desc: desc,
            color: color
        }
        this.#logList.push(obj)
        switch (level) {
            case 1:
                console.debug(
                    "%c⬤ %cVERBOSE %c" + module + "%c ⬤ %c" + desc,
                    "color: " + uiColors.teal,
                    "color: " + uiColors.greys[4] + "; font-size: small;",
                    "display: inline-block ; background-color: " + (color || uiColors.greys[2]) + " ; color: #ffffff ; font-weight: bold ; padding: 3px 7px 3px 7px ; border-radius: 3px 3px 3px 3px;",
                    "color: #ffffff00;",
                    ""
                );
                break;
            case 2:
                console.log(
                    "%c⬤ %cINFO    %c" + module + "%c ⬤ %c" + desc,
                    "color: " + uiColors.blue_d,
                    "color: " + uiColors.greys[4] + "; font-size: small;",
                    "display: inline-block ; background-color: " + (color || uiColors.greys[2]) + " ; color: #ffffff ; font-weight: bold ; padding: 3px 7px 3px 7px ; border-radius: 3px 3px 3px 3px;",
                    "color: #ffffff00;",
                    ""
                );
                break;
            case 3:
                console.info(
                    "%c⬤ %cSUCCESS %c" + module + "%c ⬤ %c" + desc,
                    "color: " + uiColors.green_d,
                    "color: " + uiColors.greys[4] + "; font-size: small;",
                    "display: inline-block ; background-color: " + (color || uiColors.greys[2]) + " ; color: #ffffff ; font-weight: bold ; padding: 3px 7px 3px 7px ; border-radius: 3px 3px 3px 3px;",
                    "color: #ffffff00;",
                    ""
                );
                break;
            case 4:
                console.log(
                    "%c⬤ %cWARNING %c" + module + "%c ⬤ %c" + desc,
                    "color: " + uiColors.red,
                    "color: " + uiColors.greys[4] + "; font-size: small;",
                    "display: inline-block ; background-color: " + (color || uiColors.greys[2]) + " ; color: #ffffff ; font-weight: bold ; padding: 3px 7px 3px 7px ; border-radius: 3px 3px 3px 3px;",
                    "color: #ffffff00;",
                    ""
                );
                break;
            case 5:
                console.log(
                    "%c⬤ %cERROR   %c" + module + "%c ⬤ %c" + desc,
                    "color: " + uiColors.pink,
                    "color: " + uiColors.greys[4] + "; font-size: small;",
                    "display: inline-block ; background-color: " + (color || uiColors.greys[2]) + " ; color: #ffffff ; font-weight: bold ; padding: 3px 7px 3px 7px ; border-radius: 3px 3px 3px 3px;",
                    "color: #ffffff00;",
                    ""
                );
                break;
        }
    }
    debug(module, desc, color) {
        this.#pushLog(1, module, desc, color)
    }
    info(module, desc, color) {
        this.#pushLog(2, module, desc, color)
    }
    success(module, desc, color) {
        this.#pushLog(3, module, desc, color)
    }
    warn(module, desc, color) {
        this.#pushLog(4, module, desc, color)
    }
    error(module, desc, color) {
        this.#pushLog(5, module, desc, color)
    }
    display(text) {
        document.querySelector('p.logger-display').innerText = text;
    }
};

export default Logger;