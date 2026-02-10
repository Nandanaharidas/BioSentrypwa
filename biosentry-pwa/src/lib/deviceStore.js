import { writable } from 'svelte/store';

export const deviceStore = writable({
    url: null,
    username: null,
    password: null,
    isConnected: false
});
