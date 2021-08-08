<script>
	import Landing from './Landing.svelte'
	import Drawing from './Drawing.svelte'
	
	export let isInSession 

</script>


{#if isInSession } 
	<svelte:component bind:isInSession  this={Drawing}  />
{:else}
	<svelte:component bind:isInSession   this={Landing}  />
{/if}
