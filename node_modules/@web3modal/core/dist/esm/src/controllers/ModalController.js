import { subscribeKey as subKey } from 'valtio/utils';
import { proxy, subscribe as sub } from 'valtio/vanilla';
import { AccountController } from './AccountController.js';
import { ApiController } from './ApiController.js';
import { EventsController } from './EventsController.js';
import { PublicStateController } from './PublicStateController.js';
import { RouterController } from './RouterController.js';
const state = proxy({
    loading: false,
    open: false
});
export const ModalController = {
    state,
    subscribe(callback) {
        return sub(state, () => callback(state));
    },
    subscribeKey(key, callback) {
        return subKey(state, key, callback);
    },
    async open(options) {
        await ApiController.state.prefetchPromise;
        if (options?.view) {
            RouterController.reset(options.view);
        }
        else if (AccountController.state.isConnected) {
            RouterController.reset('Account');
        }
        else {
            RouterController.reset('Connect');
        }
        state.open = true;
        PublicStateController.set({ open: true });
        EventsController.sendEvent({ type: 'track', event: 'MODAL_OPEN' });
    },
    close() {
        state.open = false;
        PublicStateController.set({ open: false });
        EventsController.sendEvent({ type: 'track', event: 'MODAL_CLOSE' });
    },
    setLoading(loading) {
        state.loading = loading;
    }
};
//# sourceMappingURL=ModalController.js.map