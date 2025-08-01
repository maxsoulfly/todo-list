import {
    getAllProjects,
    getAllTasks,
    getTaskById,
    getTasksForProject,
    createTask,
    addTask,
    deleteTask,
    getSubtasks,
    isCollapsed,
    hasSubtasks,
} from "../data.js";
import { saveData } from "../storage.js";
import { addTaskDraggability, addTaskDroppability } from "./dragUI.js";
import { renderDropZone } from "./dropzonesUI.js";
import { renderProjects } from "./projectUI.js";
import { renderContextualMenu } from "./contextMenuUI.js";
import { formatDate, renderStatus } from "./utilsUI.js";

/* =========================
   TASK CRUD HANDLERS
   ========================= */

// Add new task to a project
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
    saveData();
    renderProjects();
    addTaskInput.value = "";
};

// Add subtask to a parent task
const handleAddSubtaskTaskKeyPress = (e, projectId, input, parentTaskId) => {
    if (e.key === "Enter" && input.value.trim()) {
        const newSubtask = createTask({
            title: input.value.trim(),
            projectId: projectId,
            parentTaskId: parentTaskId,
        });
        addTask(newSubtask);
        saveData();
        renderProjects();
    }
    if (e.key === "Escape") input.remove();
};

// Delete a task and its subtasks
const handleDeleteTask = (taskId) => {
    const subtasks = getSubtasks(taskId);
    subtasks.forEach((sub) => deleteTask(sub.id));
    deleteTask(taskId);
    saveData();
    renderProjects();
};

// Edit a task's title
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

// Handle key events for editing task title
const handleEditTaskKeyDown = (e, task, editTitleInput) => {
    if (e.key === "Enter") {
        if (!editTitleInput.value || editTitleInput.value.trim() === "") {
            renderProjects();
            return;
        }
        task.title = editTitleInput.value.trim();
        saveData();
        renderProjects();
    }
    if (e.key === "Escape") {
        renderProjects(); // cancel edit
    }
};

/* =========================
   TASK PROPERTY TOGGLES
   ========================= */

// Toggle task priority
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
    saveData();
    renderProjects();
};

// Toggle task status
const handleStatusToggle = (task) => {
    const realTask = getAllTasks().find((t) => t.id === task.id);
    if (!realTask) return;
    if (realTask.status === "todo") realTask.status = "in-progress";
    else if (realTask.status === "in-progress") realTask.status = "done";
    else if (realTask.status === "done") realTask.status = "todo";
    saveData();
    renderProjects();
};

// Edit task due date
const handleDueDateEdit = (task) => {
    const realTask = getAllTasks().find((t) => t.id === task.id);
    if (!realTask) return;
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = task.dueDate ? task.dueDate.split("T")[0] : "";
    dateInput.classList.add("due-date-input");
    const oldBadge = document.querySelector(
        `.due-date-badge[data-task-id="${task.id}"]`
    );
    oldBadge.replaceWith(dateInput);
    dateInput.focus();
    dateInput.addEventListener("blur", () => saveDate());
    dateInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveDate();
        if (e.key === "Escape") dateInput.replaceWith(oldBadge);
    });
    function saveDate() {
        task.dueDate = dateInput.value || null;
        saveData();
        renderProjects();
    }
};

/* =========================
   TASK REORDER (DRAG & DROP)
   ========================= */

// Reorder tasks via drag & drop
const reorderTasksInProject = (projectId, draggedId, targetId, isBelow) => {
    const allTasks = getAllTasks();
    const siblings = allTasks
        .filter((t) => t.projectId === projectId && t.parentTaskId === null)
        .sort((a, b) => a.order - b.order);

    const dragged = allTasks.find((t) => t.id === draggedId);
    if (!dragged) return;

    // Remove if already in target list
    const existingIndex = siblings.indexOf(dragged);
    if (existingIndex !== -1) siblings.splice(existingIndex, 1);

    let insertIndex;

    if (!targetId || targetId === draggedId) {
        insertIndex = siblings.length; // drop at end
    } else {
        const targetIndex = siblings.findIndex((t) => t.id === targetId);
        insertIndex =
            targetIndex === -1
                ? siblings.length
                : targetIndex + (isBelow ? 1 : 0);
    }

    siblings.splice(insertIndex, 0, dragged);
    siblings.forEach((t, i) => (t.order = i));
    saveData({ tasks: allTasks });

    renderProjects();
};
// Reorder tasks via drag & drop
const reorderSubtasksOf = (
    projectId,
    parentTaskId,
    draggedId,
    targetId,
    isBelow
) => {
    const allTasks = getAllTasks();
    const siblings = allTasks
        .filter(
            (t) => t.projectId === projectId && t.parentTaskId === parentTaskId
        )
        .sort((a, b) => a.order - b.order);

    const dragged = allTasks.find((t) => t.id === draggedId);
    if (!dragged) return;

    const existingIndex = siblings.indexOf(dragged);
    if (existingIndex !== -1) siblings.splice(existingIndex, 1);

    let insertIndex;

    if (!targetId || targetId === draggedId) {
        insertIndex = siblings.length; // drop at end
    } else {
        const targetIndex = siblings.findIndex((t) => t.id === targetId);
        insertIndex =
            targetIndex === -1
                ? siblings.length
                : targetIndex + (isBelow ? 1 : 0);
    }

    siblings.splice(insertIndex, 0, dragged);
    siblings.forEach((t, i) => (t.order = i));

    saveData({ tasks: allTasks });

    renderProjects();
};

/* =========================
   TASK INPUT RENDERERS
   ========================= */

// Render input for adding a new task
const renderAddTaskInput = (project) => {
    const input = document.createElement("input");
    input.type = "text";
    input.addEventListener("keypress", (e) =>
        handleAddTaskKeyPress(e, project, input)
    );
    return input;
};

// Render input for adding a subtask
const renderAddSubtaskInput = (parentTask) => {
    const taskElement = document.querySelector(
        `[data-task-id="${parentTask.id}"]`
    );
    const subtaskList = taskElement.nextElementSibling;
    let existingInput = subtaskList.querySelector(".subtask-input");
    if (existingInput) {
        existingInput.focus();
        return;
    }
    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("subtask-input");
    input.placeholder = "Enter subtask title...";
    subtaskList.appendChild(input);
    input.focus();
    input.addEventListener("keydown", (e) =>
        handleAddSubtaskTaskKeyPress(
            e,
            parentTask.projectId,
            input,
            parentTask.id
        )
    );
};

/* =========================
   TASK UI RENDERERS
   ========================= */

// Render priority bar for a task
const renderTaskPriorityBar = (task, projectId) => {
    const priorityBar = document.createElement("span");
    priorityBar.classList.add("priority-bar", `priority-${task.priority}`);
    priorityBar.addEventListener("click", () => handlePriorityToggle(task));
    priorityBar.dataset.taskId = task.id;
    priorityBar.dataset.projectId = projectId;
    priorityBar.title = `[Priority: ${task.priority}] - Click to toggle priority`;
    return priorityBar;
};

// Render status toggle for a task
const renderTaskStatusToggle = (task) => {
    const statusToggle = document.createElement("span");
    statusToggle.classList.add("status-toggle");
    statusToggle.innerText = renderStatus(task);
    statusToggle.addEventListener("click", () => handleStatusToggle(task));
    return statusToggle;
};

// Render task title text
const renderTaskTitle = (task) => {
    const taskTitle = document.createElement("span");
    taskTitle.classList.add("task-title-text");
    taskTitle.innerText = task.title;
    return taskTitle;
};

// Render due date badge for a task
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

// Render container for task title and controls
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
// Renders caret toggle (with subtask count) for collapsing/expanding parent tasks.
const renderCollapseToggle = (task) => {
    const collapseToggleSpan = document.createElement("span");

    if (isCollapsed(task.id)) {
        // ▶︎ (3)
        const subtasksCounter = getSubtasks(task.id).length;
        collapseToggleSpan.textContent = `▶︎ (${subtasksCounter})`;
    } else {
        collapseToggleSpan.textContent = "▼";
    }

    collapseToggleSpan.addEventListener("click", (e) => {
        task.collapsed = !task.collapsed;
        saveData();
        renderProjects();
    });

    return collapseToggleSpan;
};
// Render controls (edit, delete, add subtask) for a task
const renderTaskControls = (task, taskTitle) => {
    const controls = document.createElement("span");
    controls.classList.add("task-controls");
    const menuItems = [
        { label: "Edit", onClick: () => handleEditTask(task, taskTitle) },
    ];
    if (task.parentTaskId === null) {
        menuItems.push({
            label: "Add Subtask",
            onClick: () => renderAddSubtaskInput(task),
        });
    }
    menuItems.push({
        label: "Delete",
        onClick: () => handleDeleteTask(task.id),
    });
    const menu = renderContextualMenu(menuItems);

    // If task has subtasks, show collapse/expand toggle
    if (hasSubtasks(task.id)) {
        const collapseToggle = renderCollapseToggle(task);
        controls.append(collapseToggle);
    }
    controls.append(menu);
    return controls;
};

// Render a single task element with all controls and drag/drop
const renderTask = (task, projectId) => {
    // Create main container for the task
    const taskContainer = document.createElement("p");
    taskContainer.classList.add(`priority-${task.priority}`);
    taskContainer.classList.add(`status-${task.status}`);
    taskContainer.classList.add("task");

    // Make the task draggable
    addTaskDraggability(taskContainer, task, projectId);

    // Make the task droppable (for parent tasks)
    if (!task.parentTaskId) addTaskDroppability(taskContainer, task, projectId);

    // Render the title, priority, status, and due date
    const { titleContainer, taskTitle } = renderTaskTitleContainer(
        task,
        projectId
    );
    taskContainer.append(titleContainer);

    // Render edit, delete, and add subtask controls
    const taskControls = renderTaskControls(task, taskTitle);
    taskContainer.append(taskControls);

    return taskContainer;
};

// Render subtasks for a parent task
const renderSubtasks = (task, projectId) => {
    const subtasks = getSubtasks(task.id).sort((a, b) => a.order - b.order);
    const subtaskList = document.createElement("div");
    subtaskList.classList.add("subtask-list");

    subtasks.forEach((subtask) => {
        // Dropzone above each subtask
        subtaskList.append(
            renderDropZone(projectId, subtask.id, false, task.id)
        );

        const subtaskElement = renderTask(subtask, projectId);
        subtaskElement.classList.add("subtask");
        subtaskList.append(subtaskElement);
    });

    if (subtasks.length > 0) {
        const lastSubtask = subtasks[subtasks.length - 1];
        subtaskList.append(
            renderDropZone(projectId, lastSubtask.id, true, task.id)
        );
    } else {
        // If no subtasks, allow first drop at end of parent task
        subtaskList.append(renderDropZone(projectId, task.id, true, task.id));
    }

    return subtaskList;
};

// Render all tasks for a project
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
        parentTasks.forEach((task) => {
            // Dropzone ABOVE the task
            taskList.append(renderDropZone(projectId, task.id, false, null));

            const taskElement = renderTask(task, projectId);
            taskList.append(taskElement);

            // Render subtasks
            if (!isCollapsed(task.id)) {
                const subtaskList = renderSubtasks(task, projectId);
                taskList.append(subtaskList);
            }

            // Dropzone BELOW the task (after subtasks too)
            taskList.append(renderDropZone(projectId, task.id, true, null));
        });
    }
    return taskList;
};

// ======= Exports: Task UI & Handlers =======

export {
    // --- Task CRUD Handlers ---
    handleAddTaskKeyPress, // Add new task to a project
    handleDeleteTask, // Delete a task and its subtasks
    handleEditTask, // Edit a task's title

    // --- Task Property Toggles ---
    handlePriorityToggle, // Toggle task priority
    handleStatusToggle, // Toggle task status
    handleDueDateEdit, // Edit task due date

    // --- Task Reorder (Drag & Drop) ---
    reorderTasksInProject, // Reorder tasks via drag & drop
    reorderSubtasksOf, // Reorder subtasks via drag & drop

    // --- Task UI Renderers ---
    renderAddTaskInput, // Render input for adding a new task
    renderTask, // Render a single task element
    renderTasks, // Render all tasks for a project
};
