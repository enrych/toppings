const styles = document.createElement('style')
const css = `
  .toppings__playback-control-menu {
    display: initial;
    position: relative;
  }
  
  .toppings__playback-panel {
    position: absolute;
    bottom: 64px;
    right: 100%;
    opacity: 0;
    background: #2d2f31;
    border: 1px solid #d1d7dc;
    border-radius: 8px;
    border-color: #3e4143;
    min-height: 250px;
    z-index: 9999;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .08), 0 4px 12px rgba(0, 0, 0, .08);
    animation: toppings__playback-control-menu-pop-in 100ms cubic-bezier(.2, 0, .38, .9) forwards;
  }
  
  .toppings__playback-panel-menu {
    list-style: none;
    padding: 12px 0;
    margin: 0;
    overflow-y: auto;
  }

  .hidden {
    display: none;
  }


  @keyframes toppings__playback-control-menu-pop-in {
    0% {
        opacity: 0;
        transform: scale(.9)
    }

    100% {
        opacity: 1;
        transform: scale(1)
    }
}
`
styles.textContent = css

export default styles
