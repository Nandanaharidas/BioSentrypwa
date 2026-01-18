import { writable } from 'svelte/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export const userStore = writable(null);
export const authLoading = writable(true);

if (typeof window !== 'undefined') {
    onAuthStateChanged(auth, (user) => {
        userStore.set(user);
        authLoading.set(false);
    });
}
