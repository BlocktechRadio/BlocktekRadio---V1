import { W3mFrameConstants } from './W3mFrameConstants.js';
export const W3mFrameStorage = {
    set(key, value) {
        localStorage.setItem(`${W3mFrameConstants.STORAGE_KEY}${key}`, value);
    },
    get(key) {
        return localStorage.getItem(`${W3mFrameConstants.STORAGE_KEY}${key}`);
    },
    delete(key) {
        localStorage.removeItem(`${W3mFrameConstants.STORAGE_KEY}${key}`);
    }
};
//# sourceMappingURL=W3mFrameStorage.js.map