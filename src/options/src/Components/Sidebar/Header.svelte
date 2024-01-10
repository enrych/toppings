<script>
  import icon from '../../assets/options__icon.png';
  import collapse from './assets/close-down.svg';
</script>


<div class='header'>
    <div class='header-icon'>
        <img src={icon} alt='Preferences'/>
    </div>
    <div class='header-text'>
        <p class='title'>Toppings</p>
        <a href='https://github.com/sponsors/enrich-platforms' target='blank' class='link'>Sponser Us💪</a>
    </div>
    <div class='header-collapse'>
        <img src={collapse} alt='Collapse'/>
    </div>
</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');
  .header {
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    gap: 12px;
    border-radius: 4px;
  }

  .header-icon {
    height: 39px;
    width: 39px;
  }

  .header-icon > img {
    height: 39px;
    width: 39px;
    border-radius: 4px;
  }

  .header-text {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 4px;
  }

  .header-text > p, .header-text > a {
    font-family: 'Inter', sans-serif;
    font-style: normal;
    align-self: stretch;
    color: var(--sidebar-text-primary);
  }

  .title {
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
  }

  .link {
    font-size: 13px;
    font-weight: 400px;
    line-height: 16px;
    text-decoration-line: underline;
    opacity: 0.8;
  }

  .header-collapse {
    justify-self: flex-end;
  }

  .header-collapse > img {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
</style>
