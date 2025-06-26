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

    // console.log("Before:", realTask.priority);
    task.priority = nextPriority[task.priority];
    // console.log("After:", realTask.priority);

    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });
    renderProjects();
};
const handleStatusToggle = (task) => {
    const realTask = getAllTasks().find((t) => t.id === task.id);
    if (!realTask) return;

    console.log("Before:", realTask.status);

    if (realTask.status === "todo") realTask.status = "in-progress";
    else if (realTask.status === "in-progress") realTask.status = "done";
    else if (realTask.status === "done") realTask.status = "todo";

    console.log("After:", realTask.status);

    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });

    renderProjects();
};
const formatDate = (isoDate) => {
    const options = { month: "short", day: "numeric" }; // e.g. Jun 26
    return new Date(isoDate).toLocaleDateString(undefined, options);
};

const renderStatus = (task) => {
    if (task.status === "todo") return "[ ]";
    if (task.status === "in-progress") return "[-]";
    if (task.status === "done") return "[v]";
};

const renderProjects = () => {
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = "";

    const projects = getAllProjects();
    projects.forEach((project) => {
        const projectColumn = document.createElement("div");
        projectColumn.classList.add("project-column");

        const title = document.createElement("h2");
        const projectTitle = document.createElement("span");
        projectTitle.classList.add("task-title");
        projectTitle.innerText = project.title;

        title.append(projectTitle);

        const controls = document.createElement("span");
        controls.classList.add("project-controls");

        const deleteBtn = document.createElement("span");
        deleteBtn.innerText = "[X]";
        deleteBtn.addEventListener("click", () =>
            handleDeleteProject(project.id)
        );

        const editBtn = document.createElement("span");
        editBtn.innerText = "[Edit]";
        editBtn.addEventListener("click", () =>
            handleEditProject(project, projectTitle)
        );
        controls.append(editBtn, deleteBtn);

        title.append(controls);
        projectColumn.append(title);

        const tasks = renderTasks(project.id);
        projectColumn.append(tasks);
        appContainer.append(projectColumn);

        const addTaskInput = document.createElement("input");
        projectColumn.append(addTaskInput);
        addTaskInput.type = "text";
        addTaskInput.addEventListener("keypress", (e) =>
            handleAddTaskKeyPress(e, project, addTaskInput)
        );
    });
};

const renderTasks = (projectId) => {
    const taskList = document.createElement("div");
    taskList.classList.add("task-list");

    const tasks = getTasksForProject(projectId);
    tasks.forEach((task) => {
        const taskContainer = document.createElement("p");
        taskContainer.classList.add(`priority-${task.priority}`);

        const title = document.createElement("span");
        title.classList.add("task-title");

        const priorityBar = document.createElement("span");
        priorityBar.classList.add("priority-bar", `priority-${task.priority}`);
        priorityBar.addEventListener("click", () => handlePriorityToggle(task));
        priorityBar.dataset.taskId = task.id;
        priorityBar.dataset.projectId = projectId;
        priorityBar.title = `[Priority: ${task.priority}] - Click to toggle priority`;
        title.append(priorityBar);

        const statusToggle = document.createElement("span");
        statusToggle.classList.add("status-toggle");
        statusToggle.innerText = renderStatus(task);
        statusToggle.addEventListener("click", () => handleStatusToggle(task));
        title.append(statusToggle);
        taskContainer.classList.add(`status-${task.status}`);

        const taskTitle = document.createElement("span");
        taskTitle.classList.add("task-title-text");
        taskTitle.innerText = task.title;
        title.append(taskTitle);

        taskContainer.append(title);

        const dueDate = document.createElement("span");
        dueDate.classList.add("due-date");
        dueDate.classList.add("due-date-badge");
        dueDate.title = task.dueDate
            ? `Due: ${formatDate(task.dueDate)} — Click to change`
            : "Click to set due date";

        dueDate.textContent = task.dueDate
            ? formatDate(task.dueDate)
            : "No due date";

        title.append(dueDate);
        if (!task.dueDate) {
            dueDate.dataset.empty = "true";
        }

        const controls = document.createElement("span");
        controls.classList.add("task-controls");

        const deleteBtn = document.createElement("span");
        deleteBtn.innerText = "[X]";
        deleteBtn.addEventListener("click", () => handleDeleteTask(task.id));

        const editBtn = document.createElement("span");
        editBtn.innerText = "[Edit]";
        editBtn.addEventListener("click", () =>
            handleEditTask(task, taskTitle)
        );

        controls.append(editBtn, deleteBtn);

        taskContainer.append(controls);

        taskList.append(taskContainer);
    });

    return taskList;
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

export { renderProjects, renderTasks, setupAddProjectButton };
