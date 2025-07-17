import {
    getAllProjects,
    getAllTasks,
    getTasksForProject,
    createTask,
    addTask,
    getTaskById,
    getProject,
    getSubtasks,
    hasSubtasks,
    hasTasks,
} from "../data.js";
import { saveData } from "../storage.js";
import { handleTaskReorder } from "./taskUI.js";
import {
    handleProjectReorder,
    handleDeleteProject,
    promoteTaskToProject,
    renderProjects,
} from "./projectUI.js";

/**
 * UI Drop Zone Renderers
 * ----------------------
 * Functions that create and return drop zone DOM elements for drag-and-drop.
 */

// Renders a drop zone for projects (used for reordering or promoting tasks to projects)
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

// Renders a drop zone for tasks (used for reordering, making subtasks, etc.)
const renderDropZone = (
    projectId,
    targetTaskId,
    isBelow,
    parentTaskId = null
) => {
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
        handleTaskOrProjectDrop(
            e,
            projectId,
            targetTaskId,
            isBelow,
            parentTaskId
        );
        dropZone.classList.remove("drag-over");
    });

    return dropZone;
};

/**
 * Drop Event Handlers
 * -------------------
 * Functions that handle what happens when something is dropped.
 */

// Handles dropping a project onto another project (demotes project to a task)
const handleProjectDrop = (data, projectId) => {
    const draggedProject = getAllProjects().find(
        (p) => p.id === data.draggedProjectId
    );

    demoteProjectToTask(draggedProject.id, projectId);
};

// Handles dropping a task (reordering, making subtasks, etc.)
const handleTaskDrop = (
    data,
    projectId,
    targetTaskId,
    isBelow,
    parentTaskId = null
) => {
    const { taskId: draggedId, fromProjectId } = data;
    const draggedTask = getTaskById(draggedId);
    const targetTask = getTaskById(targetTaskId);

    // if (isBlockedSubSubtaskDrop(draggedTask, targetTask, isBelow)) {
    //     // Optionally show a message or just do nothing
    //     return;
    // }

    if (!draggedTask) return;

    // Drop ON a task: make it a subtask, insert at end
    if (draggedId !== targetTaskId) {
        if (hasSubtasks(draggedTask.id)) return;
        makeSubtaskDrop(draggedTask, targetTaskId, projectId, fromProjectId);
    } else {
        // Drop BETWEEN: move/reorder in parent group
        reorderDrop(
            draggedTask,
            targetTaskId,
            projectId,
            isBelow,
            fromProjectId,
            parentTaskId
        );
    }

    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });

    renderProjects();
};

// Handles dropping either a task or a project (delegates to appropriate handler)
const handleTaskOrProjectDrop = (
    e,
    projectId,
    targetTaskId,
    isBelow,
    parentTaskId = null
) => {
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));

    if (data.draggedProjectId) {
        handleProjectDrop(data, projectId);
    } else {
        handleTaskDrop(data, projectId, targetTaskId, isBelow, parentTaskId);
    }
};

/**
 * Drop Logic Helpers
 * ------------------
 * Functions that help with specific drop logic (subtasks, reordering, etc.)
 */

// Checks if dropping a subtask onto another subtask is blocked
const isBlockedSubSubtaskDrop = (draggedTask, targetTask, isBelow) => {
    return (
        !isBelow &&
        draggedTask &&
        targetTask &&
        draggedTask.parentTaskId !== null && // dragged is a subtask
        targetTask.parentTaskId !== null // target is a subtask
    );
};

// Makes a dragged task a subtask of the target task
const makeSubtaskDrop = (
    draggedTask,
    targetTaskId,
    projectId,
    fromProjectId
) => {
    draggedTask.parentTaskId = targetTaskId;
    draggedTask.projectId = projectId;

    handleTaskReorder(
        draggedTask.id,
        null, // insert at end
        projectId,
        true,
        fromProjectId,
        targetTaskId
    );
};

// Reorders a dragged task relative to the target task
const reorderDrop = (
    draggedTask,
    targetTaskId,
    projectId,
    isBelow,
    fromProjectId,
    parentTaskId
) => {
    
    draggedTask.parentTaskId = parentTaskId;
    draggedTask.projectId = projectId;

    handleTaskReorder(
        draggedTask.id,
        targetTaskId,
        projectId,
        isBelow,
        fromProjectId,
        parentTaskId
    );
};

/**
 * Project/Task Conversion
 * -----------------------
 * Functions that convert projects to tasks (demotion).
 */

// Demotes a project to a task under another project
const demoteProjectToTask = (projectId, targetProjectId) => {
    const project = getProject(projectId);

    const newTask = createTask({
        title: project.title,
        projectId: targetProjectId,
    });

    const draggedProjectTasks = getTasksForProject(projectId);

    if (draggedProjectTasks.length > 0) {
        draggedProjectTasks.forEach((task) => {
            task.projectId = targetProjectId;
            task.parentTaskId = newTask.id;
        });
    }

    addTask(newTask);

    handleDeleteProject(projectId);

    saveData({
        projects: getAllProjects(),
        tasks: getAllTasks(),
    });
    renderProjects();
};

export {
    // Task UI Renderers
    // ===============================
    renderProjectDropZone, // Renders a drop zone for projects (drag-and-drop)
    renderDropZone, // Renders a drop zone for tasks (drag-and-drop)

    // Task Reorder (Drag & Drop)
    // ===============================
    handleTaskOrProjectDrop, // Handles drop event for tasks/projects (delegates logic)

    // Project/Task Conversion
    // ===============================
    demoteProjectToTask, // Converts a project into a task under another project
};
