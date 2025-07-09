const setupThemeToggle = () => {
    const toggleBtn = document.getElementById("theme-toggle");
    const saved = localStorage.getItem("theme");
    const theme = saved || "dark";

    document.body.setAttribute("data-theme", theme);

    toggleBtn.addEventListener("click", () => {
        const current = document.body.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    });
};

export { setupThemeToggle };
