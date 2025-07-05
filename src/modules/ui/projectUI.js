import {
    getAllProjects,
    getAllTasks,
    createProject,
    addProject,
    deleteProject,
} from "../data.js";
import { saveData } from "../storage.js";
import { renderTasks, renderAddTaskInput, handleDeleteTask } from "./taskUI.js";
import { addProjectDraggability } from "./dragUI.js";
import { renderProjectDropZone } from "./dropzonesUI.js";

// --- Helper Functions ---
const renderProjectTitle = (project) => {
    const projectTitle = document.createElement("span");
    projectTitle.classList.add("project-title");
    projectTitle.innerText = project.title;
    return projectTitle;
};

const renderProjectControls = (project, projectTitle) => {
    const controls = document.createElement("span");
    controls.classList.add("project-controls");

    const deleteBtn = document.createElement("span");
    deleteBtn.innerText = "[X]";
    deleteBtn.addEventListener("click", () => handleDeleteProject(project.id));

    const editBtn = document.createElement("span");
    editBtn.innerText = "[Edit]";
    editBtn.addEventListener("click", () =>
        handleEditProject(project, projectTitle)
    );
    controls.append(editBtn, deleteBtn);

    return controls;
};

const renderProjectHeader = (project) => {
    const header = document.createElement("h2");

    const projectTitle = renderProjectTitle(project);
    const controls = renderProjectControls(project, projectTitle);

    header.append(projectTitle, controls);

    return header;
};

const renderProject = (project) => {
    const projectColumn = document.createElement("div");
    projectColumn.classList.add("project-column");

    const header = renderProjectHeader(project);
    addProjectDraggability(header, project);
    const taskList = renderTasks(project.id);
    const input = renderAddTaskInput(project);

    projectColumn.append(header, taskList, input);

    return projectColumn;
};

const renderProjects = () => {
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = "";

    const projects = getAllProjects();

    if (projects.length > 0) {
        const firstDropZone = renderProjectDropZone(projects[0].id, false);
        appContainer.append(firstDropZone);
    }

    projects.forEach((project) => {
        const projectColumn = renderProject(project);
        const dropZone = renderProjectDropZone(project.id, true);
        appContainer.append(projectColumn, dropZone);
    });
};

// --- Handler Functions ---
const handleProjectReorder = (draggedId, targetId, isAfter) => {
    const allProjects = getAllProjects();
    const dragged = allProjects.find((p) => p.id === draggedId);
    if (!dragged) return;

    // Remove if already in target list
    const existingIndex = allProjects.indexOf(dragged);
    if (existingIndex !== -1) allProjects.splice(existingIndex, 1);

    const targetIndex = allProjects.findIndex((p) => p.id === targetId);

    const insertIndex = targetIndex + (isAfter ? 1 : 0);

    allProjects.splice(insertIndex, 0, dragged);

    allProjects.forEach((t, i) => (t.order = i));
    console.log("Reordering:", draggedId, "→", targetId, "after?", isAfter);

    saveData({
        projects: allProjects,
        tasks: getAllTasks(),
    });

    renderProjects();
};

const promoteTaskToProject = (taskId) => {
    const task = getAllTasks().find((t) => t.id === taskId);

    const newProject = createProject(task.title);
    addProject(newProject);

    task.projectId = newProject.id;

    handleDeleteTask(taskId);

    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });
    renderProjects();
};

const handleDeleteProject = (projectId) => {
    deleteProject(projectId);
    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });

    renderProjects();
};

const handleEditProjectKeyDown = (e, project, editTitleInput) => {
    if (e.key === "Enter") {
        if (!editTitleInput.value || editTitleInput.value.trim() === "") {
            renderProjects();
            return;
        }
        project.title = editTitleInput.value.trim();
        saveData({
            projects: getAllProjects(),
            tasks: getAllTasks(),
        });
        renderProjects();
    }

    if (e.key === "Escape") {
        renderProjects(); // cancel edit
    }
};

const handleEditProject = (project, projectTitle) => {
    const editTitleInput = document.createElement("input");
    editTitleInput.classList.add("edit-title-input");
    editTitleInput.value = project.title;
    projectTitle.replaceWith(editTitleInput);
    editTitleInput.focus();

    editTitleInput.addEventListener("keydown", (e) =>
        handleEditProjectKeyDown(e, project, editTitleInput)
    );
};

const handleAddProjectKeyDown = (e, addProjectInput, addProjectBtn) => {
    if (e.key === "Enter") {
        if (!addProjectInput.value || addProjectInput.value.trim() === "") {
            addProjectInput.replaceWith(addProjectBtn);
            return;
        }

        const newProject = createProject(addProjectInput.value);
        addProject(newProject);
        saveData({ projects: getAllProjects(), tasks: getAllTasks() });

        renderProjects();

        addProjectInput.replaceWith(addProjectBtn);
    }

    if (e.key === "Escape") {
        renderProjects(); // cancel add

        addProjectInput.replaceWith(addProjectBtn);
    }
};

// --- Setup Functions ---
const setupAddProjectButton = () => {
    const addProjectBtn = document.getElementById("add-project-btn");
    addProjectBtn.addEventListener("click", () => {
        const addProjectInput = document.createElement("input");
        addProjectInput.id = "add-project-input";
        addProjectBtn.replaceWith(addProjectInput);
        addProjectInput.focus();

        addProjectInput.addEventListener("keydown", (e) =>
            handleAddProjectKeyDown(e, addProjectInput, addProjectBtn)
        );
    });
};

// --- Exports ---
export {
    handleProjectReorder,
    promoteTaskToProject,
    handleDeleteProject,
    handleEditProject,
    handleAddProjectKeyDown,
    setupAddProjectButton,
    renderProjectTitle,
    renderProject,
    renderProjects,
};
