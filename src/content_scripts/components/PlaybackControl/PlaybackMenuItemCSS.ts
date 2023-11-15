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
  padding: 0.8rem 0;
  padding-left: 3.2rem;
  padding-right: 3.2rem;
  font: 400 1.4rem/1.4 sans-serif;
  text-align: left;
  white-space: nowrap;
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  background: transparent;
  color: white;
  border: none;
  vertical-align: bottom;
  -webkit-user-select: none;
}

.toppings__playback-menu-button[aria-checked="true"]:after {
  content: '';
  display: block;
  width: 0.8rem;
  height: 0.8rem;
  background: #a435f0;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 1.2rem;
}

.toppings__playback-menu-button-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  min-height: 1.96rem;
  flex: 1;
  min-width: 1px;
}

.toppings__playback-menu-content-value {
  font-weight: 700;
}  
`
styles.textContent = css

export default styles
