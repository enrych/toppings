<script>
  import logo from './assets/logo.jpeg';
</script>

<div class='credit-container'>
    <div class='credit-logo'>
        <img src={logo} alt='Enrich Platforms Logo'/>
    </div>
    <div class='credit-text'>
        <p class='title'>Made With &nbsp♥️  </p>
        <p class='tagline'>Enrich Platforms</p>
    </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

  .credit-container {
    justify-self: flex-end;
    display: flex;
    width: 100%;
    padding: 8px 12px;
    align-items: center;
    gap: 10px;
    border-radius: 4px;
    color: var(--sidebar-text-primary);
  }

  .credit-logo img {
    width: 24px;
    height: 24px;
  }

  .credit-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .credit-text p {
    font-family: 'Inter', sans-serif;
    font-style: normal;
  }

  .credit-text .title {
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
  }

  .credit-text .tagline {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }
</style>

