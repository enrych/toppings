const styles = document.createElement('style')
const css = `
  .toppings__playback-control-menu {
    display: none;
    position: relative;
    bottom: 335px;
    left: 0px;
    opacity: 0;
    z-index: 9999;
    animation: toppings__playback-control-menu-pop-in 100ms cubic-bezier(.2, 0, .38, .9) forwards;
  }
  
  .toppings__playback-panel {
    background: #2d2f31;
    border: 1px solid #d1d7dc;
    border-radius: 8px;
    border-color: #3e4143;
    min-height: 250px;
    overflow-y: auto;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .08), 0 4px 12px rgba(0, 0, 0, .08);
  }
  
  .toppings__playback-panel-menu {
    list-style: none;
    padding: 0.8rem 0;
    margin: 0;
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
