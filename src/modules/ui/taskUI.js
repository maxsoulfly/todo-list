import {
    getAllProjects,
    getAllTasks,
    getTasksForProject,
    createTask,
    addTask,
    deleteTask,
} from "../data.js";
import { saveData } from "../storage.js";
import { addTaskDraggability } from "./dragUI.js";
import { renderDropZone } from "./dropzonesUI.js";
import { renderProjects } from "./projectUI.js";
import { formatDate, renderStatus } from "./utilsUI.js";

// --- Task Handlers ---

// Add Task
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

// Delete Task
const handleDeleteTask = (taskId) => {
    deleteTask(taskId);
    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });

    renderProjects();
};

// Edit Task
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

// Priority Toggle
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

// Status Toggle
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

// Due Date Edit
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

// Task Reorder (Drag & Drop)
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

// --- Task Render Functions ---

// Add Task Input
const renderAddTaskInput = (project) => {
    const input = document.createElement("input");
    input.type = "text";
    input.addEventListener("keypress", (e) =>
        handleAddTaskKeyPress(e, project, input)
    );

    return input;
};

// Task Priority Bar
const renderTaskPriorityBar = (task, projectId) => {
    const priorityBar = document.createElement("span");
    priorityBar.classList.add("priority-bar", `priority-${task.priority}`);
    priorityBar.addEventListener("click", () => handlePriorityToggle(task));
    priorityBar.dataset.taskId = task.id;
    priorityBar.dataset.projectId = projectId;
    priorityBar.title = `[Priority: ${task.priority}] - Click to toggle priority`;

    return priorityBar;
};

// Task Status Toggle
const renderTaskStatusToggle = (task) => {
    const statusToggle = document.createElement("span");
    statusToggle.classList.add("status-toggle");
    statusToggle.innerText = renderStatus(task);
    statusToggle.addEventListener("click", () => handleStatusToggle(task));
    return statusToggle;
};

// Task Title
const renderTaskTitle = (task) => {
    const taskTitle = document.createElement("span");
    taskTitle.classList.add("task-title-text");
    taskTitle.innerText = task.title;
    return taskTitle;
};

// Task Due Date
const renderTaskDueDate = (task, projectId) => {
    const dueDate = document.createElement("span");
    dueDate.classList.add("due-date");
    dueDate.classList.add("due-date-badge");
    dueDate.dataset.taskId = task.id;
    dueDate.dataset.projectId = projectId;
    dueDate.title = task.dueDate
        ? `Due: ${formatDate(task.dueDate)} — Click to change`
        : "Click to set due date";
    dueDate.textContent = task.dueDate ? formatDate(task.dueDate) : "No date";
    dueDate.addEventListener("click", () => {
        handleDueDateEdit(task);
    });

    if (!task.dueDate) {
        dueDate.dataset.empty = "true";
    }

    return dueDate;
};

// Task Title Container
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

// Task Controls
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

// Task (Single)
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

// Task List
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

export {
    handleAddTaskKeyPress,
    handleDeleteTask,
    handleEditTask,
    handlePriorityToggle,
    handleStatusToggle,
    handleDueDateEdit,
    handleTaskReorder,
    renderAddTaskInput,
    renderTask,
    renderTasks,
};
