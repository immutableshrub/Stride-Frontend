import { v4 as uuidv4 } from 'uuid';
function storageAvailable() {
    // MDN - https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    let storagevalidity = [0, 0];
    ['localStorage', 'sessionStorage'].forEach((method, index) => {
        try {
            let testString = uuidv4();
            window[method].setItem('storageTest', testString);
            if (window[method].getItem('storageTest') == testString) {
                window[method].removeItem('storageTest');
                storagevalidity[index] = true;
            } else {
                storagevalidity[index] = false;
                throw new Error('Storage not available');
            }
        } catch (e) {
            storagevalidity[index] = e instanceof DOMException && (
                e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && (storage && storage.length !== 0);
        }
    })
    return storagevalidity;
}


function clearStorage(storage) {
    if (storageAvailable()) {
        window[storage].clear();
    }
}

export { storageAvailable, clearStorage };