<script lang='ts'>
  import Header from './Header.svelte';
  import Navbar from './Navbar.svelte';
  import Credits from './Credits.svelte';

  export let currentPage: string;
</script>

<div class='sidebar'>
    <Header/>
    <Navbar currentPage={currentPage}/>
    <Credits />
</div>

<style>

.sidebar {
    background: var(--sidebar-primary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100vh;
    width: max(300px, 15vw);
    padding: 16px 10px;
    gap: 16px;
}

</style>

