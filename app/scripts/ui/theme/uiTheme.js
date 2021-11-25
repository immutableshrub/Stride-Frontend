import uiColors from "./colors";

const uiTheme = {
    colors: {
        background: {
            primary: uiColors.greys[7],
            hover: uiColors.greys[5]
        },
        border: {
            primary: uiColors.greys[6]
        }
    },
    layout: {
        margin: {
            documentUI: '50px'
        },
    },
    animations: {
        easing: {
            primary: 'cubic-bezier(.86,0,.07,1)' //thx https://www.airforce.com/ for your awesome easings
        }
    }
};

export default uiTheme;