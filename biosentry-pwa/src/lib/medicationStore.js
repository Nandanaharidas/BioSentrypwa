import { writable } from 'svelte/store';

// Initialize with some dummy data for development, or empty array
/** @type {import('svelte/store').Writable<any[]>} */
export const medicationsStore = writable([]);

/** @type {import('svelte/store').Writable<any>} */
export const selectedMedicationStore = writable(null);
