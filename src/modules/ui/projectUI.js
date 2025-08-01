import {
    getAllProjects,
    getAllTasks,
    createProject,
    addProject,
    deleteProject,
    getSubtasks,
} from "../data.js";
import { saveData } from "../storage.js";
import { renderTasks, renderAddTaskInput, handleDeleteTask } from "./taskUI.js";
import { addProjectDraggability } from "./dragUI.js";
import { renderProjectDropZone } from "./dropzonesUI.js";
import { renderContextualMenu } from "./contextMenuUI.js";
import { renderSidebar } from "./sidebarUI.js";

// --- UI Rendering Functions ---
// Render the project title element
const renderProjectTitle = (project) => {
    const projectTitle = document.createElement("span");
    projectTitle.classList.add("project-title");
    projectTitle.innerText = project.title;
    return projectTitle;
};

// Render the controls (edit/delete menu) for a project
const renderProjectControls = (project, projectTitle) => {
    const controls = document.createElement("span");
    controls.classList.add("project-controls");

    const menu = renderContextualMenu([
        {
            label: "Edit",
            onClick: () => handleEditProject(project, projectTitle),
        },
        { label: "Delete", onClick: () => handleDeleteProject(project.id) },
    ]);

    controls.append(menu);

    return controls;
};

// Render the header for a project (title + controls)
const renderProjectHeader = (project) => {
    const header = document.createElement("h2");

    const projectTitle = renderProjectTitle(project);
    const controls = renderProjectControls(project, projectTitle);

    header.append(projectTitle, controls);

    return header;
};

// Render a single project column (header, tasks, input)
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

// Render all projects and their drop zones
const renderProjects = () => {
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = "";

    const projects = getAllProjects().filter((p) => !p.hidden);

    if (projects.length > 0) {
        const firstDropZone = renderProjectDropZone(projects[0].id, false);
        appContainer.append(firstDropZone);
    }

    projects.forEach((project) => {
        const projectColumn = renderProject(project);
        const dropZone = renderProjectDropZone(project.id, true);
        appContainer.append(projectColumn, dropZone);
    });

    renderSidebar();
};

// --- Project Manipulation Handlers ---
// Reorder projects after drag-and-drop
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

    saveData({
        projects: allProjects,
    });

    renderProjects();
};

// Promote a task to a new project
const promoteTaskToProject = (taskId) => {
    const task = getAllTasks().find((t) => t.id === taskId);

    const newProject = createProject(task.title);
    addProject(newProject);

    task.projectId = newProject.id;

    const subtasks = getSubtasks(taskId);
    subtasks.forEach((sub) => {
        sub.projectId = newProject.id;
        sub.parentTaskId = null;
    });

    handleDeleteTask(taskId);

    saveData();
    renderProjects();
};

// Delete a project and update UI
const handleDeleteProject = (projectId) => {
    deleteProject(projectId);
    saveData();

    renderProjects();
};

// --- Project Editing Handlers ---
// Handle keydown events when editing a project title
const handleEditProjectKeyDown = (e, project, editTitleInput) => {
    if (e.key === "Enter") {
        if (!editTitleInput.value || editTitleInput.value.trim() === "") {
            renderProjects();
            return;
        }
        project.title = editTitleInput.value.trim();
        saveData();
        renderProjects();
    }

    if (e.key === "Escape") {
        renderProjects(); // cancel edit
    }
};

// Start editing a project's title
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

// --- Project Adding Handlers ---
// Handle keydown events when adding a new project
const handleAddProjectKeyDown = (e, addProjectInput, addProjectBtn) => {
    if (e.key === "Enter") {
        if (!addProjectInput.value || addProjectInput.value.trim() === "") {
            addProjectInput.replaceWith(addProjectBtn);
            return;
        }

        const newProject = createProject(addProjectInput.value);
        addProject(newProject);

        saveData();
        renderProjects();

        addProjectInput.replaceWith(addProjectBtn);
    }

    if (e.key === "Escape") {
        renderProjects(); // cancel add

        addProjectInput.replaceWith(addProjectBtn);
    }
};

// Setup the "Add Project" button to show input on click
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
    // --- Project UI Renderers ---
    renderProjectTitle, // Renders the project title element
    renderProject, // Renders a single project column (header, tasks, input)
    renderProjects, // Renders all projects and their drop zones

    // --- Project CRUD Operations ---
    handleDeleteProject, // Deletes a project and updates the UI
    promoteTaskToProject, // Promotes a task to a new project

    // --- Project Reorder (Drag & Drop) ---
    handleProjectReorder, // Reorders projects after drag-and-drop

    // --- Project Editing ---
    handleEditProject, // Starts editing a project's title
    handleEditProjectKeyDown, // Handles keydown events when editing a project title

    // --- Project Adding ---
    handleAddProjectKeyDown, // Handles keydown events when adding a new project
    setupAddProjectButton, // Sets up the "Add Project" button to show input on click
};
