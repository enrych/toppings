let openMenu: HTMLElement | null = null;

export function closeOpenMenu(): void {
  if (!openMenu) return;
  openMenu.style.display = "none";
  openMenu = null;
}

// One document listener for every dropdown, so re-renders never stack them.
document.addEventListener("click", closeOpenMenu);

export function attachMenu(trigger: HTMLElement, menu: HTMLElement, beforeOpen?: () => void): void {
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (openMenu === menu) {
      closeOpenMenu();
      return;
    }
    closeOpenMenu();
    beforeOpen?.();
    menu.style.display = "block";
    openMenu = menu;
  });
}
