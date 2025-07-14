import {
    getAllProjects,
    getAllTasks,
    getTaskById,
    getTasksForProject,
    createTask,
    addTask,
    deleteTask,
    getSubtasks,
} from "../data.js";
import { saveData } from "../storage.js";
import { addTaskDraggability, addTaskDroppability } from "./dragUI.js";
import { renderDropZone } from "./dropzonesUI.js";
import { renderProjects } from "./projectUI.js";
import { renderContextualMenu } from "./contextMenuUI.js";
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
    const subtasks = getSubtasks(taskId);
    subtasks.forEach((sub) => deleteTask(sub.id));

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
    fromProjectId,
    parentTaskId = null
) => {
    const allTasks = getAllTasks();
    const dragged = allTasks.find((t) => t.id === draggedId);
    if (!dragged) return;

    // Reassign project if necessary
    if (dragged.projectId !== toProjectId) {
        dragged.projectId = toProjectId;
    }

    // === Only tasks with same parentTaskId and projectId ===
    const siblings = allTasks
        .filter(
            (t) =>
                t.projectId === toProjectId && t.parentTaskId === parentTaskId
        )
        .sort((a, b) => a.order - b.order);

    console.log(
        "Siblings in reorder:",
        siblings.map((t) => t.title)
    );
    console.log(
        "Dragged task:",
        dragged.title,
        "New parentTaskId:",
        parentTaskId
    );

    // Remove if already in sibling list
    const existingIndex = siblings.indexOf(dragged);
    if (existingIndex !== -1) siblings.splice(existingIndex, 1);

    const target = siblings.find((t) => t.id === targetId);
    let targetIndex = siblings.indexOf(target);
    if (targetIndex === -1) targetIndex = 0;
    const insertIndex = targetIndex + (isBelow ? 1 : 0);

    console.log(
        "Target task:",
        target ? target.title : null,
        "Insert index:",
        insertIndex
    );

    siblings.splice(insertIndex, 0, dragged);

    // Update order for siblings only
    siblings.forEach((t, i) => (t.order = i));

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

    const menu = renderContextualMenu([
        { label: "Edit", onClick: () => handleEditTask(task, taskTitle) },
        { label: "Add Subtask", onClick: () => console.log("TODO: Subtask") },
        { label: "Delete", onClick: () => handleDeleteTask(task.id) },
    ]);

    controls.append(menu);

    return controls;
};

// Task (Single)
const renderTask = (task, projectId) => {
    const taskContainer = document.createElement("p");

    taskContainer.classList.add(`priority-${task.priority}`);
    taskContainer.classList.add(`status-${task.status}`);
    taskContainer.classList.add("task");

    addTaskDraggability(taskContainer, task, projectId);
    if (!task.parentTaskId) addTaskDroppability(taskContainer, task, projectId);

    const { titleContainer, taskTitle } = renderTaskTitleContainer(
        task,
        projectId
    );
    const taskControls = renderTaskControls(task, taskTitle);

    taskContainer.append(titleContainer, taskControls);

    return taskContainer;
};

const renderSubtasks = (task, projectId) => {
    const subtasks = getSubtasks(task.id);

    const subtaskList = document.createElement("div");
    subtaskList.classList.add("subtask-list");

    subtaskList.append(renderDropZone(projectId, task.id, true, task.id));
    subtasks.forEach((subtask) => {
        const subtaskElement = renderTask(subtask, projectId);
        subtaskElement.classList.add("subtask");

        const subDropZone = renderDropZone(
            projectId,
            subtask.id,
            true,
            task.id
        );

        subtaskList.append(subtaskElement, subDropZone);
    });

    return subtaskList;
};

// Task List
const renderTasks = (projectId) => {
    const taskList = document.createElement("div");
    taskList.classList.add("task-list");

    const allTasks = getTasksForProject(projectId).sort(
        (a, b) => a.order - b.order
    );

    const parentTasks = allTasks.filter((task) => !task.parentTaskId);

    if (parentTasks.length === 0) {
        taskList.append(renderDropZone(projectId, null, true, null));
    } else {
        taskList.append(renderDropZone(projectId, null, true, null));

        parentTasks.forEach((task) => {
            const taskElement = renderTask(task, projectId);
            const parentDropZone = renderDropZone(projectId, null, true, null);

            taskList.append(taskElement);

            const subtaskList = renderSubtasks(task, projectId);

            taskList.append(subtaskList, parentDropZone);
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
