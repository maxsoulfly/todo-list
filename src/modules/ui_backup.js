import {
    createTask,
    getAllProjects,
    getTasksForProject,
    addTask,
    createProject,
    addProject,
    getAllTasks,
    deleteTask,
    deleteProject,
} from "./data";

import { saveData } from "./storage";

// --- Project Handlers ---

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

const addProjectDraggability = (projectColumn, project) => {
    projectColumn.setAttribute("draggable", "true");
    projectColumn.dataset.projectId = project.id;

    // dragstart
    projectColumn.addEventListener("dragstart", (e) => {
        if (e.target.closest(".task")) {
            e.preventDefault(); // 👈 this stops project drag completely
            return;
        }

        startProjectDrag(e, project.id);
    });

    // dragleave
    projectColumn.addEventListener("dragleave", (e) => {});
    // drop
    projectColumn.addEventListener("drop", (e) => {});
};

const startProjectDrag = (e, projectId) => {
    e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
            draggedProjectId: projectId,
        })
    );
};

const renderProjectDropZone = (projectId, isAfter) => {
    const dropZone = document.createElement("div");
    dropZone.classList.add("project-drop-zone");

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (e) => {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));

        if (data.taskId) promoteTaskToProject(data.taskId);

        if (data.draggedProjectId)
            handleProjectReorder(data.draggedProjectId, projectId, isAfter);

        dropZone.classList.remove("drag-over");
    });

    return dropZone;
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

// --- Task Handlers ---
const handleAddTaskKeyPress = (e, project, addTaskInput) => {
    if (e.key !== "Enter") return;

    const title = addTaskInput.value.trim();
    if (!title) return;

    const newTask = createTask({
        title,
        projectId: project.id,
        parentTaskId: null,
    });
    addTask(newTask);
    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });
    renderProjects();
    addTaskInput.value = "";
};

const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });

    renderProjects();
};

const handleEditTask = (task, taskTitle) => {
    const editTitleInput = document.createElement("input");
    editTitleInput.classList.add("edit-title-input");
    editTitleInput.value = task.title;
    taskTitle.replaceWith(editTitleInput);
    editTitleInput.focus();

    editTitleInput.addEventListener("keydown", (e) =>
        handleEditTaskKeyDown(e, task, editTitleInput)
    );
};

const handleEditTaskKeyDown = (e, task, editTitleInput) => {
    if (e.key === "Enter") {
        if (!editTitleInput.value || editTitleInput.value.trim() === "") {
            renderProjects();
            return;
        }
        task.title = editTitleInput.value.trim();
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

const handlePriorityToggle = (task) => {
    const realTask = getAllTasks().find((t) => t.id === task.id);
    if (!realTask) return;
    const nextPriority = {
        null: "low",
        low: "medium",
        medium: "high",
        high: null,
    };

    task.priority = nextPriority[task.priority];

    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });
    renderProjects();
};

const handleStatusToggle = (task) => {
    const realTask = getAllTasks().find((t) => t.id === task.id);
    if (!realTask) return;

    if (realTask.status === "todo") realTask.status = "in-progress";
    else if (realTask.status === "in-progress") realTask.status = "done";
    else if (realTask.status === "done") realTask.status = "todo";

    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });

    renderProjects();
};

const handleDueDateEdit = (task) => {
    const realTask = getAllTasks().find((t) => t.id === task.id);
    if (!realTask) return;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = task.dueDate ? task.dueDate.split("T")[0] : ""; // ISO short
    dateInput.classList.add("due-date-input");

    const oldBadge = document.querySelector(
        `.due-date-badge[data-task-id="${task.id}"]`
    );
    oldBadge.replaceWith(dateInput);
    dateInput.focus();

    dateInput.addEventListener("blur", () => saveDate());
    dateInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveDate();
        if (e.key === "Escape") dateInput.replaceWith(oldBadge); // optional cancel
    });

    function saveDate() {
        task.dueDate = dateInput.value || null;
        saveData({
            projects: getAllProjects(),
            tasks: getAllTasks(),
        });
        renderProjects();
    }
};

const renderDropZone = (projectId, targetTaskId, isBelow) => {
    const dropZone = document.createElement("div");
    dropZone.classList.add("drop-zone");

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drag-over");
    });
    dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (e) => {
        handleTaskOrProjectDrop(e, projectId, targetTaskId, isBelow);
        dropZone.classList.remove("drag-over");
    });

    return dropZone;
};
const handleTaskOrProjectDrop = (e, projectId, targetTaskId, isBelow) => {
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));

    if (data.draggedProjectId) {
        const draggedProject = getAllProjects().find(
            (p) => p.id === data.draggedProjectId
        );
        const draggedProjectTasks = getTasksForProject(draggedProject.id);

        if (draggedProjectTasks.length === 0)
            demoteProjectToTask(draggedProject.id, projectId);
        else {
            mergeProjectTasks(draggedProject.id, projectId);
        }
    } else {
        handleTaskReorder(
            data.taskId,
            targetTaskId,
            projectId,
            isBelow,
            data.fromProjectId
        );
    }
};
const mergeProjectTasks = (sourceProjectId, targetProjectId) => {
    const tasksToMove = getTasksForProject(sourceProjectId);
    tasksToMove.forEach((task) => (task.projectId = targetProjectId));
    handleDeleteProject(sourceProjectId);
};
const demoteProjectToTask = (projectId, targetProjectId) => {
    const project = getAllProjects().find((p) => p.id === projectId);

    const newTask = createTask({
        title: project.title,
        projectId: targetProjectId,
    });

    addTask(newTask);

    handleDeleteProject(projectId);

    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });
    renderProjects();
};

const addTaskDraggability = (taskContainer, task, projectId) => {
    taskContainer.setAttribute("draggable", "true");
    taskContainer.dataset.taskId = task.id;
    taskContainer.dataset.projectId = projectId;

    taskContainer.addEventListener("dragstart", (e) =>
        startDrag(e, task, projectId)
    );
    taskContainer.addEventListener("dragend", clearDragStyles);
};

const startDrag = (e, task, projectId) => {
    e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
            taskId: task.id,
            fromProjectId: projectId,
        })
    );
    e.currentTarget.classList.add("dragging");
};

const clearDragStyles = (e) => {
    e.currentTarget.classList.remove(
        "dragging",
        "drag-over-above",
        "drag-over-below"
    );
};

const handleTaskReorder = (
    draggedId,
    targetId,
    toProjectId,
    isBelow,
    fromProjectId
) => {
    const allTasks = getAllTasks();
    const dragged = allTasks.find((t) => t.id === draggedId);
    if (!dragged) return;

    // Reassign project if necessary
    if (dragged.projectId !== toProjectId) {
        dragged.projectId = toProjectId;
    }

    const projectTasks = allTasks
        .filter((t) => t.projectId === toProjectId)
        .sort((a, b) => a.order - b.order);

    // Remove if already in target list
    const existingIndex = projectTasks.indexOf(dragged);
    if (existingIndex !== -1) projectTasks.splice(existingIndex, 1);

    const target = projectTasks.find((t) => t.id === targetId);
    const targetIndex = projectTasks.indexOf(target);
    const insertIndex = targetIndex + (isBelow ? 1 : 0);

    projectTasks.splice(insertIndex, 0, dragged);

    projectTasks.forEach((t, i) => (t.order = i));

    saveData({
        projects: getAllProjects(),
        tasks: allTasks,
    });

    renderProjects();
};

// --- Project Render Functions ---
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

const renderAddTaskInput = (project) => {
    const input = document.createElement("input");
    input.type = "text";
    input.addEventListener("keypress", (e) =>
        handleAddTaskKeyPress(e, project, input)
    );

    return input;
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

// --- Task Render Functions ---
const renderTaskPriorityBar = (task, projectId) => {
    const priorityBar = document.createElement("span");
    priorityBar.classList.add("priority-bar", `priority-${task.priority}`);
    priorityBar.addEventListener("click", () => handlePriorityToggle(task));
    priorityBar.dataset.taskId = task.id;
    priorityBar.dataset.projectId = projectId;
    priorityBar.title = `[Priority: ${task.priority}] - Click to toggle priority`;

    return priorityBar;
};

const renderTaskStatusToggle = (task) => {
    const statusToggle = document.createElement("span");
    statusToggle.classList.add("status-toggle");
    statusToggle.innerText = renderStatus(task);
    statusToggle.addEventListener("click", () => handleStatusToggle(task));
    return statusToggle;
};

const renderTaskTitle = (task) => {
    const taskTitle = document.createElement("span");
    taskTitle.classList.add("task-title-text");
    taskTitle.innerText = task.title;
    return taskTitle;
};

const renderTaskDueDate = (task, projectId) => {
    const dueDate = document.createElement("span");
    dueDate.classList.add("due-date");
    dueDate.classList.add("due-date-badge");
    dueDate.dataset.taskId = task.id;
    dueDate.dataset.projectId = projectId;
    dueDate.title = task.dueDate
        ? `Due: ${formatDate(task.dueDate)} — Click to change`
        : "Click to set due date";
    dueDate.textContent = task.dueDate
        ? formatDate(task.dueDate)
        : "No due date";
    dueDate.addEventListener("click", () => {
        handleDueDateEdit(task);
    });

    if (!task.dueDate) {
        dueDate.dataset.empty = "true";
    }

    return dueDate;
};

const renderTaskTitleContainer = (task, projectId) => {
    const titleContainer = document.createElement("span");
    titleContainer.classList.add("task-title");

    const priorityBar = renderTaskPriorityBar(task, projectId);
    const statusToggle = renderTaskStatusToggle(task);
    const taskTitle = renderTaskTitle(task);
    const dueDate = renderTaskDueDate(task, projectId);

    titleContainer.append(priorityBar, statusToggle, taskTitle, dueDate);

    return { titleContainer, taskTitle };
};

const renderTaskControls = (task, taskTitle) => {
    const controls = document.createElement("span");
    controls.classList.add("task-controls");

    const deleteBtn = document.createElement("span");
    deleteBtn.innerText = "[X]";
    deleteBtn.addEventListener("click", () => handleDeleteTask(task.id));

    const editBtn = document.createElement("span");
    editBtn.innerText = "[Edit]";
    editBtn.addEventListener("click", () => handleEditTask(task, taskTitle));

    controls.append(editBtn, deleteBtn);

    return controls;
};

const renderTask = (task, projectId) => {
    const taskContainer = document.createElement("p");

    taskContainer.classList.add(`priority-${task.priority}`);
    taskContainer.classList.add(`status-${task.status}`);
    taskContainer.classList.add("task");

    addTaskDraggability(taskContainer, task, projectId);

    const { titleContainer, taskTitle } = renderTaskTitleContainer(
        task,
        projectId
    );
    const taskControls = renderTaskControls(task, taskTitle);

    taskContainer.append(titleContainer, taskControls);

    return taskContainer;
};

const renderTasks = (projectId) => {
    const taskList = document.createElement("div");
    taskList.classList.add("task-list");

    const tasks = getTasksForProject(projectId).sort(
        (a, b) => a.order - b.order
    );

    if (tasks.length === 0) {
        taskList.append(renderDropZone(projectId, null, true));
    } else {
        taskList.append(renderDropZone(projectId, tasks[0].id, false));

        tasks.forEach((task) => {
            const renderedTask = renderTask(task, projectId);
            const dropZone = renderDropZone(projectId, task.id, true);

            taskList.append(renderedTask, dropZone);
        });
    }

    return taskList;
};

// --- Utility/Helper Functions ---
const formatDate = (isoDate) => {
    const options = { month: "short", day: "numeric" }; // e.g. Jun 26
    return new Date(isoDate).toLocaleDateString(undefined, options);
};

const renderStatus = (task) => {
    if (task.status === "todo") return "[ ]";
    if (task.status === "in-progress") return "[-]";
    if (task.status === "done") return "[v]";
};

export { renderProjects, renderTasks, setupAddProjectButton };
