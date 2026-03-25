import { writable, get } from 'svelte/store';
import { deviceStore } from './deviceStore';
import { rtdb } from './firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { userStore } from './authStore';
import { selectedMedicationStore } from './medicationStore';

export const metricsData = writable({
    bpm: [],
    spo2: [],
    temp: [],
    emg: [],
    gsr: [],
});

export const currentMetrics = writable({
    bpm: 0,
    spo2: 0,
    temp: 0,
    emg: 0,
    gsr: 0,
    finger_detected: false,
});

export const severity = writable("Low");
export const showEmergencyPopup = writable(false);
export const isMeasuring = writable(false);

/** @type {any} */
let unsubscribeMetrics = null;

/** @param {any} data */
export function handleNewMetrics(data) {
    if (!data) return;

    currentMetrics.set({
        bpm: data.bpm || 0,
        spo2: data.spo2 || 0,
        temp: data.temp || 0,
        emg: data.emg || 0,
        gsr: data.gsr || 0,
        finger_detected: data.finger_detected || false,
    });

    metricsData.update(md => ({
        bpm: [...md.bpm.slice(-19), data.bpm || 0],
        spo2: [...md.spo2.slice(-19), data.spo2 || 0],
        temp: [...md.temp.slice(-19), data.temp || 0],
        emg: [...md.emg.slice(-19), data.emg || 0],
        gsr: [...md.gsr.slice(-19), data.gsr || 0],
    }));

    // Severity check based on temp and spo2
    if (data.temp > 38 || (data.spo2 > 0 && data.spo2 < 92)) {
        severity.set("High");
        showEmergencyPopup.set(true);
    } else if (data.temp > 37.5 || (data.spo2 > 0 && data.spo2 < 95)) {
        severity.set("Medium");
    } else {
        severity.set("Low");
    }

    // Push to user's medication history (if a medication is selected)
    const user = /** @type {any} */ (get(userStore));
    const med = /** @type {any} */ (get(selectedMedicationStore));
    if (user && med?.id) {
        const readingsRef = ref(rtdb, `users/${user.uid}/medications/${med.id}/readings`);
        const newReadingRef = push(readingsRef);
        set(newReadingRef, {
            bpm: data.bpm || 0,
            spo2: data.spo2 || 0,
            temp: data.temp || 0,
            emg: data.emg || 0,
            gsr: data.gsr || 0,
            finger_detected: data.finger_detected || false,
            timestamp: Date.now(),
        });
    }
}

export function startVitalsFetch() {
    if (get(isMeasuring)) return;

    const user = /** @type {any} */ (get(userStore));
    const device = /** @type {any} */ (get(deviceStore));

    if (!user || !device?.deviceId) {
        console.warn("[measureStore] ⚠️ Cannot start monitoring: user or deviceId missing", { user: user?.uid, deviceId: device?.deviceId });
        return;
    }

    isMeasuring.set(true);

    // Listen to the device node where ESP32 writes data directly
    const deviceRef = ref(rtdb, `devices/${device.deviceId}`);

    unsubscribeMetrics = onValue(deviceRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            handleNewMetrics(data);
        }
    });

    console.log(`[measureStore] 🚀 Started real-time monitoring for device: ${device.deviceId}`);
}


export function stopVitalsFetch() {
    isMeasuring.set(false);
    if (unsubscribeMetrics) {
        unsubscribeMetrics();
        unsubscribeMetrics = null;
    }
    console.log("[measureStore] 🛑 Stopped monitoring");
}

