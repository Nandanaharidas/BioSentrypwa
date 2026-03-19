<script>
  import { fade } from "svelte/transition";
  import Zap from "lucide-svelte/icons/zap";
  import Header from "$lib/components/dashboard/Header.svelte";
  import MedicationList from "$lib/components/dashboard/MedicationList.svelte";
  import DeviceList from "$lib/components/dashboard/DeviceList.svelte";
  import DailyTrends from "$lib/components/dashboard/DailyTrends.svelte";
  import AddMedicineModal from "$lib/components/dashboard/AddMedicineModal.svelte";

  let showAddMedicine = $state(false);

  function toggleAddMedicine() {
    showAddMedicine = !showAddMedicine;
  }
</script>

<div in:fade class="max-w-md mx-auto space-y-6 pb-24">
  <Header />

  <MedicationList onAddClick={toggleAddMedicine} />

  <DeviceList />

  <DailyTrends />

  <!-- Primary Action -->
  <div class="fixed bottom-6 left-6 right-6 max-w-md mx-auto">
    <a
      href="/measure/select"
      class="w-full bg-primary hover:bg-primary-hover text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <Zap class="fill-current" size={20} />
      Start Monitoring
    </a>
  </div>

  <AddMedicineModal showModal={showAddMedicine} onClose={toggleAddMedicine} />
</div>

<style>
  /* Any custom local styles */
  :global(body) {
    overflow-x: hidden;
  }
</style>
