import { setupAddProjectButton, renderProjects } from "./projectUI.js";
import { getAllProjects, toggleProjectVisibility } from "../data.js";

/**
 * Renders the list of projects in the sidebar.
 * Handles project visibility toggling.
 */
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

        // Toggle project visibility on click
        item.addEventListener("click", () => {
            toggleProjectVisibility(project.id);
            renderProjects();
        });

        list.appendChild(item);
    });
};

/**
 * Sets up the sidebar collapse/expand toggle button.
 * Updates sidebar and body classes, and button icon.
 */
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

// UI export functions
export { renderSidebar, setupSidebarToggle };
