const renderContextualMenu = (actions = []) => {
    const menuWrapper = document.createElement("div");
    menuWrapper.classList.add("menu-wrapper");

    // menu-trigger
    const menuTrigger = document.createElement("span");
    menuTrigger.classList.add("menu-trigger");
    menuTrigger.innerText = "⋯";

    // menu-popup
    const menuPopup = document.createElement("div");
    menuPopup.classList.add("menu-popup", "hidden");

    actions.forEach(({ label, onClick }) => {
        const item = document.createElement("span");
        item.classList.add("menu-item");
        item.innerText = label;
        item.addEventListener("click", onClick);
        menuPopup.appendChild(item);
    });

    menuWrapper.append(menuTrigger, menuPopup);

    return menuWrapper;
};

export { renderContextualMenu };
