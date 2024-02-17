const styles = document.createElement('style')
const css = `
  .toppings__playback-menu-item {
    position: relative;
    padding-left: 0;
    display: list-item;
    list-style: none;
  }

  .toppings__playback-menu-button {
    position: relative;
    width: 100%;
    height: auto;
    min-width: auto;
    margin: 0px !important;
    padding: 12px 0;
    padding-left: 51.2px;
    padding-right: 51.2px;
    font: 400 16px sans-serif;
    text-align: left;
    white-space: nowrap;
    display: flex;
    align-items: flex-start;
    cursor: pointer;
    background: transparent;
    color: white;
    border: none;
    outline: none;
    vertical-align: bottom;
    -webkit-user-select: none;
  }

  .toppings__playback-menu-button[aria-checked="true"]:after {
    content: '';
    display: block;
    width: 12px;
    height: 12px;
    background: rgba(59,130,246,.5);;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 19.2px;
  }

  .toppings__playback-menu-button-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    flex: 1;
    min-height: 18px;
    min-width: 1px;
  }

  .toppings__playback-menu-content-value {
    font-weight: 700;
  }

  .hidden {
    display: none;
  }
`
styles.textContent = css

export default styles
