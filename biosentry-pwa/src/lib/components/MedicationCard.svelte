<script>
    export let name = "";
    export let batchNo = "";
</script>

<div class="glass p-4 rounded-xl flex justify-between items-center mb-3">
    <span class="text-xl font-medium">{name}</span>
    <span class="text-text-muted italic">{batchNo}</span>
</div>

<style>
    .glass {
        border: 2px solid rgba(0, 0, 0, 0.8);
        background: transparent;
    }
</style>
