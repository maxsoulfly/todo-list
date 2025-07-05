import { setupAddProjectButton, renderProjects } from "./projectUI.js";
import { getAllProjects, toggleProjectVisibility } from "../data.js";

const renderSidebar = () => {
    const list = document.getElementById("project-list");
    list.innerHTML = "";

    const projects = getAllProjects();

    projects.forEach((project) => {
        const item = document.createElement("li");
        item.textContent = project.title;
        item.classList.add("sidebar-project-item");
        item.dataset.projectId = project.id;
        if (project.hidden) item.classList.add("project-hidden");

        item.addEventListener("click", () => {
            toggleProjectVisibility(project.id);
            renderProjects();
        });

        list.appendChild(item);
    });
};

const setupSidebarToggle = () => {
    const toggleBtn = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");
    const body = document.body;

    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        body.classList.toggle("sidebar-collapsed");

        const isCollapsed = sidebar.classList.contains("collapsed");
        toggleBtn.textContent = isCollapsed ? "☰" : "«";
    });
};

export { renderSidebar, setupSidebarToggle };
