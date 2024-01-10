<script lang='ts'>
  export let icon: string;
  export let label: string;
  export let isSelected: boolean;
  export let endpoint: string;
</script>

<li class='nav-item {isSelected ? 'selected' : ''}'>
    <a class='nav-link' href={`/${endpoint}`}>
        <img src={icon} alt={label}/>
        <p>{label}</p>
    </a>
</li>

<style>
    .nav-item {
        width: 100%;
        list-style: none;
        border-radius: 6px;
    }

    .nav-link {
        padding: 16px 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        text-decoration: none;
    }

    .nav-item img {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    .nav-item p {
        color: var(--sidebar-text-primary);
        font-family: Inter, sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 20px;
        opacity: 0.8;
    }

    .selected {
        background: var(--sidebar-navbar-selected);
    }
</style>

