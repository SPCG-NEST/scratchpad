<script lang="ts">
    import { browser } from "$app/environment";
    import { onDestroy, onMount } from "svelte";

    let miner: Worker;
    let hash: string = "";
    let i: number = 0;

    const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    function calcHash() {
        if (miner) {
            console.log("Sending hash request:", i);
            miner.postMessage({ input: i });
            i++;
        }
    }
    onMount(async () => {
        if (!browser) {
            console.log("Not Browser!");
            return;
        } else {
            console.log("Browser!");
        }

        miner = new Worker(new URL("$lib/miner.worker.ts", import.meta.url), {
            type: "module",
        });

        miner.onmessage = (e) => {
            hash = e.data.result;
            console.log("Received hash:", hash);
        };

        while (true) {
            await delay(3000);
            calcHash();
        }
    });

    onDestroy(() => {
        if (miner) {
            miner.terminate();
        }
    });
</script>

<h1>MiMC Miner</h1>
<p>Hash for {i}: {hash}</p>
