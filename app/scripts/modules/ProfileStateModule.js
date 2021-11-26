import { storageAvailable } from "../utils/helpers"
import { v4 as uuidv4 } from "uuid"
import emojis from "../ui/theme/emojis";
import uiColors from "../ui/theme/colors";
import superb from "superb";

class ProfileStateModule {
    defuserProfile = {
        name: '',
        id: '',
        emoji: '',
        color: ''
    }
    constructor() {
        if (storageAvailable('localStorage')) {
            let lsTest = localStorage.getItem('userProfile');
            let lsDecoded = {};
            if (lsTest !== null) {
                try {
                    lsDecoded = JSON.parse(decodeURIComponent(escape(window.atob(lsTest))));
                } catch { } finally {
                    this.defuserProfile.id = lsDecoded.id || uuidv4();
                    this.defuserProfile.name = lsDecoded.name || '';
                    this.defuserProfile.emoji = lsDecoded.emoji || '';
                    this.defuserProfile.color = lsDecoded.color || '';
                }
            } else {
                this.defuserProfile.id = uuidv4();
                localStorage.setItem('userProfile', window.btoa(unescape(encodeURIComponent(JSON.stringify(this.defuserProfile)))));
            }
        }
        this.userProfile = new Proxy(this.defuserProfile, {
            set: function (target, key, value) {
                target[key] = value;
                localStorage.setItem('userProfile', window.btoa(unescape(encodeURIComponent(JSON.stringify(this.defuserProfile)))));
                return true
            }
        });
    }
    updateUserProfile(name, emoji, color) {
        this.userProfile.name = name;
        this.userProfile.emoji = emoji;
        this.userProfile.color = color;
        localStorage.setItem('userProfile', window.btoa(unescape(encodeURIComponent(JSON.stringify(this.userProfile)))));
    }
    generateRandomUserProfile() {
        let index = Math.floor(Math.random() * emojis.length)
        let emoji = emojis[index];
        let color = uiColors.profileColors[Math.floor(Math.random() * uiColors.profileColors.length - 1)]
        let word = superb.random();
        word = word[0].toUpperCase() + word.substring(1);
        //console.log(emoji, index, emojis.length)
        return [word + ' ' + emoji.name, emoji.emoji, color];
    }
}

export default ProfileStateModule