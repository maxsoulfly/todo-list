import {
    getAllProjects,
    getAllTasks,
    getTaskById,
    hasTasks,
    hasSubtasks,
    getProject,
} from "../data.js";
import { saveData } from "../storage.js";
import { renderProjects } from "./projectUI.js";
import { demoteProjectToTask } from "./dropzonesUI.js";
// import {} from "./taskUI.js";

/* =========================
   Project Drag & Drop Logic
   ========================= */

/**
 * Makes a project column draggable and sets up drag event listeners.
 */
const addProjectDraggability = (projectColumn, project) => {
    projectColumn.setAttribute("draggable", "true");
    projectColumn.dataset.projectId = project.id;

    projectColumn.addEventListener("dragstart", (e) => {
        // Prevent dragging if a task is targeted
        if (e.target.closest(".task")) {
            e.preventDefault();
            return;
        }
        startProjectDrag(e, project.id);
    });

    projectColumn.addEventListener("dragleave", (e) => {});
    projectColumn.addEventListener("drop", (e) => {});
};

/**
 * Handles the start of a project drag by storing project ID in dataTransfer.
 */
const startProjectDrag = (e, projectId) => {
    e.dataTransfer.setData(
        "text/plain",
        JSON.stringify({
            draggedProjectId: projectId,
        })
    );
};
/**
 * Handles dropping a dragged project onto task (for subtasks).
 */
const handleProjectDropOnTask = (e, targetTask, targetProjectId) => {
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));

    const draggedProject = getProject(data.draggedProjectId);

    const newTaskId = demoteProjectToTask(
        draggedProject.id,
        targetProjectId,
        true
    );

    const draggedTask = getTaskById(newTaskId);

    if (newTaskId && newTaskId !== targetTask.id) {
        if (!hasSubtasks(draggedTask.id)) {
            draggedTask.parentTaskId = targetTask.id;
        }
        draggedTask.projectId = targetProjectId;

        saveData({
            projects: getAllProjects(),
            tasks: getAllTasks(),
        });
        renderProjects();
    }
};
/* =========================
   Task Drag & Drop Logic
   ========================= */

/**
 * Makes a task container draggable and sets up drag event listeners.
 */
const addTaskDraggability = (taskContainer, task, projectId) => {
    taskContainer.setAttribute("draggable", "true");
    taskContainer.dataset.taskId = task.id;
    taskContainer.dataset.projectId = projectId;

    taskContainer.addEventListener("dragstart", (e) =>
        startDrag(e, task, projectId)
    );
    taskContainer.addEventListener("dragend", clearDragStyles);
};

/**
 * Makes a task container a drop target for other tasks.
 */
const addTaskDroppability = (taskContainer, targetTask, projectId) => {
    taskContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        taskContainer.classList.add("drag-over-subtarget");
    });

    taskContainer.addEventListener("dragleave", (e) => {
        taskContainer.classList.remove("drag-over-subtarget");
    });

    taskContainer.addEventListener("drop", (e) => {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));

        if (data.taskId) {
            handleTaskDropOnTask(e, targetTask, projectId);
        } else if (data.draggedProjectId) {
            handleProjectDropOnTask(e, targetTask, projectId);
        }
        taskContainer.classList.remove("drag-over-subtarget");
    });
};

/**
 * Handles dropping a dragged task onto another task (for subtasks).
 */
const handleTaskDropOnTask = (e, targetTask, targetProjectId) => {
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const draggedTask = getTaskById(data.taskId);

    if (data.taskId && data.taskId !== targetTask.id) {
        if (!hasSubtasks(draggedTask.id)) {
            draggedTask.parentTaskId = targetTask.id;
        }
        draggedTask.projectId = targetProjectId;

        saveData({
            projects: getAllProjects(),
            tasks: getAllTasks(),
        });
        renderProjects();
    }
};

/**
 * Handles the start of a task drag by storing task and project IDs in dataTransfer.
 */
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

/**
 * Clears drag-related CSS classes from a task container.
 */
const clearDragStyles = (e) => {
    e.currentTarget.classList.remove(
        "dragging",
        "drag-over-above",
        "drag-over-below"
    );
};

// Export drag & drop functions for use in UI modules
export {
    // Project Drag & Drop Functions
    // ===============================
    addProjectDraggability, // Make a project column draggable
    startProjectDrag, // Store project ID in drag data

    // Task Drag & Drop Functions
    // ===============================
    addTaskDraggability, // Make a task container draggable
    addTaskDroppability, // Make a task container a drop target
    startDrag, // Store task and project IDs in drag data
    clearDragStyles, // Remove drag-related CSS classes
};
