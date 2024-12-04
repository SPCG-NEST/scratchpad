/// <reference lib="webworker" />
declare const self: Worker;

import { MiMC } from "./mimc";

const mimc = new MiMC();
// Listen for messages from the main thread
self.onmessage = (e) => {
    console.log("Worker received message:", e.data);
    // Example heavy computation
    const result = mimc.hash(e.data.input);
    // Send the result back to the main thread
    self.postMessage({ input: e.data.input, result: result });
}
