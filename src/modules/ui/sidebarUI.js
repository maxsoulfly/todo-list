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

export { renderSidebar };
