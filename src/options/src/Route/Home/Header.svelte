<div class='dashboard-header'>

  <div class='dashboard'>
    Payments
  </div>
  <div class='how-to-use'>
    <img class='outlined-help' src={"img/help.svg"} alt="Help" />
    <div class='text-wrapper'>How it works</div>
  </div>
  <div class='search-wrapper'>
    <img class='icons-search' src={"img/search.svg"} alt="Search" />
    <div class='text-wrapper-2'>Search features, tutorials, etc.</div>
  </div>
  <div class='component'>
    <img class='icons-menu' src="img/menu.svg" alt="Menu" />
    <div class='polygon-wrapper'><img class='polygon' src="img/polygon-2.svg" alt="Polygon" /></div>
  </div>
</div>

<style>
  .dashboard-header {
    display: flex;
    width: 1216px;
    align-items: center;
    gap: 16px;
    padding: 12px 32px;
    background-color: #ffffff;
    border-bottom: 1px solid #d9d9d9;
  }

  .dashboard-header div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dashboard-header .dashboard {
    font-family: "Inter-Regular", Helvetica;
    font-weight: 400;
    color: #1a181e;
    font-size: 15px;
    white-space: nowrap;
  }

  .dashboard-header .how-to-use .text-wrapper,
  .dashboard-header .search-wrapper .text-wrapper-2 {
    font-family: "Inter-Regular", Helvetica;
    font-weight: 400;
    color: #7f7f7f;
    font-size: 15px;
    white-space: nowrap;
  }

  .dashboard-header .polygon-wrapper {
    width: 40px;
    height: 40px;
    background-color: #e6e6e6;
    border-radius: 20px;
    overflow: hidden;
  }

  .dashboard-header .polygon {
    width: 14px;
    height: 9px;
    top: 17px;
    left: 13px;
    position: absolute;
  }
</style>

