import { writable } from 'svelte/store';
import { rtdb } from './firebase';
import { ref, onValue, push, remove as rtdbRemove, set } from 'firebase/database';
import { userStore } from './authStore';

function createMedicationsStore() {
    const { subscribe, set: setStore } = writable([]);
    /** @type {any} */
    let currentUser = null;
    /** @type {any} */
    let medicationsRef = null;

    // Listen to user auth changes
    userStore.subscribe((/** @type {any} */ user) => {
        currentUser = user;

        if (user) {
            medicationsRef = ref(rtdb, `users / ${user.uid}/medications`);
            onValue(medicationsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const medsArray = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    setStore(medsArray);
                } else {
                    setStore([]);
                }
            });
        } else {
            medicationsRef = null;
            setStore([]);
        }
    });

    return {
        subscribe,
        /** @param {any} medication */
        add: async (medication) => {
            if (!currentUser || !medicationsRef) return;
            const newMedRef = push(medicationsRef);
            await set(newMedRef, medication);
        },
        /** @param {any} medicationId */
        remove: async (medicationId) => {
            if (!currentUser) return;
            const medRef = ref(rtdb, `users/${currentUser.uid}/medications/${medicationId}`);
            await rtdbRemove(medRef);
        }
    };
}

export const medicationsStore = createMedicationsStore();

/** @type {import('svelte/store').Writable<any>} */
export const selectedMedicationStore = writable(null);
