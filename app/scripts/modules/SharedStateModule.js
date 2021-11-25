import SimpleMenu from "../ui/components/simplemenu/simplemenu";
import uiIcons from "../ui/theme/icons";
import intl from "../intl/intl";
import SimpleDialog from "../ui/components/simpledialog/simpledialog";
import SharedHomeUI from "../ui/components/sharedHomeUI.js/sharedHomeUI";
import { io } from "socket.io-client";

let loaderHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="uie-circleLoader"><circle cx="50" cy="50" r="45"></circle></svg>`

class SharedStateModule {
    sharedStatus = 0;
    serverURL = ''
    socketInstance = null;
    currentUsers = [];
    constructor(url) {
        window.addEventListener('SystemStateEvent-CollaborationModule-ManagePeopleButton', (e) => {
            console.log(e)
            switch (this.sharedStatus) {
                case 0: {
                    new SimpleMenu(window.uiDocument, [e.detail.clientX, e.detail.clientY, 2], [
                        {
                            type: 'menuElement',
                            icon: 'ui/sharescreen',
                            onSelected: () => {
                                this.#beginSharing();
                            },
                            name: intl.str('app.sharemodule.beginsharing')
                        },
                        {
                            type: 'menuElement',
                            icon: 'ui/person',
                            onSelected: () => {
                                this.#editProfile();
                            },
                            name: intl.str('app.sharemodule.editProfile')
                        }
                    ]);
                    break;
                }
            }
        })
        if (url) {
            console.log(url.split('+'))
            this.#joinDocument(url.split('+'))
        }
    }
    #socketTools = {
        getApiStatus(callback, serverURL) {
            this.serverURL = serverURL || window.SettingsStateModule["collaboration.server.defaultServerURL"];
            if (this.serverURL.substring(0, this.serverURL.length - 1) == '/') {
                this.serverURL = this.serverURL.substring(0, this.serverURL.length - 1);
            }
            window.fetch(this.serverURL + '/info')
                .then(
                    function (response) {
                        switch (response.status) {
                            case 200:
                                response.json().then(function (data) {
                                    callback({
                                        code: response.status,
                                        data: data
                                    })
                                });
                                break;
                            default:
                                console.log('Looks like there was a problem. Status Code: ' + response.status)
                                callback({
                                    code: response.status,
                                })
                                break;
                        }
                    }
                )
                .catch(function (err) {
                    callback({
                        code: 0,
                        err: err
                    })
                });
        },
        getRandomEmoji(screen) {
            let intervalCount = 0;
            let interval = setInterval(() => {
                intervalCount++;
                if (intervalCount <= 59) {
                    let profile = ProfileState.generateRandomUserProfile();
                    document.querySelector('section.' + screen + 'Profile section.userprofile-header>.emojicont').innerText = profile[1];
                    document.querySelector('section.' + screen + 'Profile section.userprofile-header>.emojicont').style.backgroundColor = profile[2];
                    document.querySelector('section.' + screen + 'Profile section.userprofile-header>input').value = profile[0];
                } else {
                    clearInterval(interval);
                }
            }, 25);
        },
        connectToSocket(addr, id, callback) {
            try {
                let urlstr = new URL(this.serverURL);
                urlstr.pathname = '';
                console.log(urlstr.toString(), addr)
                window.sharedState.socketInstance = io(urlstr.toString() + "document-" + id, {
                    path: addr,
                    query: {
                        userprofile: JSON.stringify(window.ProfileState.userProfile)
                    }
                });

                window.sharedState.socketInstance.on("connect", () => {
                    console.log('socket connected')
                });
                window.sharedState.socketInstance.on("SharedStateRelay-DSMG-ioComm", (name, args) => {
                    console.log('socket recieved can', name, args)
                    window.dispatchEvent(new CustomEvent(name, { detail: args }))
                });
                window.addEventListener('SharedStateRelay-DSMG-ioComm', (e) => {
                    console.log('socket emit', e.detail)
                    window.sharedState.socketInstance.emit('SharedStateRelay-DSMG-ioComm', e.detail.name, e.detail.args);
                });
                window.sharedState.socketInstance.on('SharedStateRelay-DSMG-ioConnectivity-NewUser', (userProfile) => {
                    console.log('socket newUser', userProfile, window.sharedState.currentUsers);
                    window.sharedState.currentUsers.push(userProfile);
                });
                window.sharedState.socketInstance.on('SharedStateRelay-DSMG-ioDocumentStateUpdateGet', () => {
                    window.sharedState.socketInstance.emit('SharedStateRelay-DSMG-ioDocumentStateUpdate', JSON.stringify(window.DocumentState));
                })
                callback(200);
            } catch (err) {
                callback(0, err);
            }
        }
    }
    #editProfile() {
        let sharedHUI = new SharedHomeUI(window.uiDocument);
        setTimeout(() => {
            sharedHUI.setScreen(2);
            if (window.ProfileState.userProfile.name !== '') {
                document.querySelector('section.editProfile section.userprofile-header>.emojicont').innerText = window.ProfileState.userProfile.emoji;
                document.querySelector('section.editProfile section.userprofile-header>.emojicont').style.backgroundColor = window.ProfileState.userProfile.color;
                document.querySelector('section.editProfile section.userprofile-header>input').value = window.ProfileState.userProfile.name;
            } else {
                this.#socketTools.getRandomEmoji('edit');
            }
            document.querySelector('section.editProfile section.userprofile-header>.emojicont').addEventListener('click', () => {
                this.#socketTools.getRandomEmoji('edit')
            });
            document.querySelector('section.editProfile section.userprofile-header>button').addEventListener('click', () => {
                window.ProfileState.updateUserProfile(document.querySelector('section.editProfile section.userprofile-header>input').value, document.querySelector('section.editProfile section.userprofile-header>.emojicont').innerText, document.querySelector('section.editProfile section.userprofile-header>.emojicont').style.backgroundColor);
                sharedHUI.setScreen(0);
                setTimeout(() => {
                    sharedHUI.destroy();
                }, 1000);
            });
        }, 1500);
    }
    #beginSharing() {
        let dialog = new SimpleDialog(window.uiDocument, {
            title: intl.str('app.sharemodule.beginsharing'),
            icon: uiIcons.ui.sharescreen,
            canClose: false,
            largeDialog: false,
            body: '<div class="shareDialogReplace" uie-ref="shareDialogReplace"></div>',
            buttons: [{
                type: 'primary',
                text: 'Loading...',
                callback: (e) => { },
                close: true
            }],
        });
        document.querySelector('main.uie-dialog .uie-simpledialog-button').disabled = true;
        document.querySelector('[uie-ref="shareDialogReplace"]').innerHTML = loaderHTML;
        setTimeout(() => {
            this.#socketTools.getApiStatus((status) => {
                if (status.code == 200) {
                    let sharedHUI = new SharedHomeUI(window.uiDocument);
                    setTimeout(() => {
                        sharedHUI.setScreen(1);
                        document.querySelector('main.uie-shui.uie-outer section.setProfile>section p span').innerHTML = window.DocumentState.name;
                        if (window.ProfileState.userProfile.name !== '') {
                            document.querySelector('section.setProfile section.userprofile-header>.emojicont').innerText = window.ProfileState.userProfile.emoji;
                            document.querySelector('section.setProfile section.userprofile-header>.emojicont').style.backgroundColor = window.ProfileState.userProfile.color;
                            document.querySelector('section.setProfile section.userprofile-header>input').value = window.ProfileState.userProfile.name;
                        } else {
                            this.#socketTools.getRandomEmoji('set');
                        }
                        document.querySelector('section.setProfile section.userprofile-header>.emojicont').addEventListener('click', () => {
                            this.#socketTools.getRandomEmoji('set')
                        });
                        document.querySelector('section.setProfile section.userprofile-header>button').addEventListener('click', () => {
                            sharedHUI.setScreen(0);
                            window.ProfileState.updateUserProfile(document.querySelector('section.setProfile section.userprofile-header>input').value, document.querySelector('section.setProfile section.userprofile-header>.emojicont').innerText, document.querySelector('section.setProfile section.userprofile-header>.emojicont').style.backgroundColor);
                            this.#socketTools.connectToSocket(status.data.socketAddr, window.DocumentState.id, () => {
                                console.log(this.socketInstance)
                                this.socketInstance.emit("SharedStateRelay-DSMG-ioConnectivityCheck", () => {
                                    const url = new URL(window.location.href);
                                    url.hash = window.btoa(window.DocumentState.id + '+' + window.SettingsStateModule["collaboration.server.defaultServerURL"]);
                                    console.log(url.toString()); // ok
                                    this.sharedStatus = 1;
                                    document.querySelector('[uie-ref="shareDialogReplace"]').innerHTML = '<h1>Here\'s your link: </h1><code>' + url.toString() + '</code><p>Click to copy the link. <br/>Use the link to join this document. This link will expire when you close the document.</p>';
                                    document.querySelector('main.uie-dialog .uie-simpledialog-button').innerText = 'Close';
                                    document.querySelector('main.uie-dialog .uie-simpledialog-button').disabled = false;
                                    sharedHUI.destroy();
                                });
                            })
                        });
                    }, 1500);
                } else if (status.code == 404) {
                    document.querySelector('[uie-ref="shareDialogReplace"]').innerHTML = 'There was an error'
                }
            });
        }, 1000)
    }

    #joinDocument(id) {
        let sharedHUI = new SharedHomeUI(window.uiDocument);
        this.#socketTools.getApiStatus((status) => {
            if (status.code == 200) {
                window.DocumentState.name = "Unknown Document";
                sharedHUI.setScreen(3);
                document.querySelector('main.uie-shui.uie-outer section.joinProfile h1').innerHTML = window.DocumentState.name;
                if (window.ProfileState.userProfile.name !== '') {
                    document.querySelector('section.joinProfile section.userprofile-header>.emojicont').innerText = window.ProfileState.userProfile.emoji;
                    document.querySelector('section.joinProfile section.userprofile-header>.emojicont').style.backgroundColor = window.ProfileState.userProfile.color;
                    document.querySelector('section.joinProfile section.userprofile-header>input').value = window.ProfileState.userProfile.name;
                } else {
                    this.#socketTools.getRandomEmoji('join');
                }
                document.querySelector('section.joinProfile section.userprofile-header>.emojicont').addEventListener('click', () => {
                    this.#socketTools.getRandomEmoji('join')
                });
                document.querySelector('section.joinProfile section.userprofile-header>button').addEventListener('click', () => {
                    sharedHUI.setScreen(0);
                    window.ProfileState.updateUserProfile(document.querySelector('section.joinProfile section.userprofile-header>input').value, document.querySelector('section.joinProfile section.userprofile-header>.emojicont').innerText, document.querySelector('section.joinProfile section.userprofile-header>.emojicont').style.backgroundColor);
                    this.#socketTools.connectToSocket(status.data.socketAddr, id[0], () => {
                        console.log(this.socketInstance)
                        this.socketInstance.emit("SharedStateRelay-DSMG-ioConnectivityCheck", (intl) => {
                            /*intl = {
                                currentUsers: [{
                                    userProfile
                                }],
                                documentState: 
                            }
                            */
                            this.currentUsers = intl.currentUsers;
                            console.log(this.currentUsers)
                            this.sharedStatus = 2
                            sharedHUI.destroy();
                        });
                        this.socketInstance.once("SharedStateRelay-DSMG-ioDocumentStateUpdate", (documentState) => {
                            console.log(documentState);
                            window.DocumentState.elements = JSON.parse(documentState).elements;
                            window.dispatchEvent(new Event('DocumentStateEvent-ReloadAllElements'));

                        });
                    })
                });

            }
        }, id[1]);
    }
}
export default SharedStateModule;