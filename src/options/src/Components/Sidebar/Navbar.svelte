<script lang='ts'>
  import NavItem from './NavItem.svelte';
  import homeSVG from './assets/icons/home.svg';
  import appearanceSVG from './assets/icons/appearance.svg';
  import pluginsSVG from './assets/icons/plugins.svg';

  export let currentPage: string;

  const navItems = [
      { icon: homeSVG, label: 'Home', endpoint: '' },
    { icon: appearanceSVG, label: 'Appearance', endpoint: 'appearance' },
    { icon: pluginsSVG, label: 'Plugins', endpoint: 'plugins'  }
  ];
</script>

<nav class='navbar'>
    <ul class='nav-items-wrapper'>
     {#each navItems as { icon, label, endpoint }, index}
        <NavItem icon={icon} label={label} isSelected={currentPage.toLowerCase() === label.toLowerCase()} endpoint={endpoint}/>
      {/each}
    </ul>
</nav>

<style>
    .navbar {
        width: 100%;
        height: 100%;
    }

    .nav-items-wrapper {
        width: 100%;
        height: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
</style>

