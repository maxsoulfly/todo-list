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

// --- Project Render Functions ---
const renderProjectTitle = (project) => {
    const projectTitle = document.createElement("span");
    projectTitle.classList.add("task-title");
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
    const taskList = renderTasks(project.id);
    const input = renderAddTaskInput(project);

    projectColumn.append(header, taskList, input);

    return projectColumn;
};

const renderProjects = () => {
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = "";

    const projects = getAllProjects();
    projects.forEach((project) => {
        const projectColumn = renderProject(project);
        appContainer.append(projectColumn);
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

    const tasks = getTasksForProject(projectId);
    tasks.forEach((task) => {
        taskList.append(renderTask(task, projectId));
    });

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
