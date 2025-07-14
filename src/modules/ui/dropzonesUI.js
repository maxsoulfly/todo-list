import {
    getAllProjects,
    getAllTasks,
    getTasksForProject,
    createTask,
    addTask,
    getTaskById,
} from "../data.js";
import { saveData } from "../storage.js";
import { handleTaskReorder } from "./taskUI.js";
import {
    handleProjectReorder,
    handleDeleteProject,
    promoteTaskToProject,
    renderProjects,
} from "./projectUI.js";

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

const handleProjectDrop = (data, projectId) => {
    const draggedProject = getAllProjects().find(
        (p) => p.id === data.draggedProjectId
    );
    const draggedProjectTasks = getTasksForProject(draggedProject.id);

    if (draggedProjectTasks.length === 0)
        demoteProjectToTask(draggedProject.id, projectId);
    else {
        mergeProjectTasks(draggedProject.id, projectId);
    }
};

const isBlockedSubSubtaskDrop = (draggedTask, targetTask, isBelow) => {
    return (
        !isBelow &&
        draggedTask &&
        targetTask &&
        draggedTask.parentTaskId !== null && // dragged is a subtask
        targetTask.parentTaskId !== null // target is a subtask
    );
};
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

    if (isBlockedSubSubtaskDrop(draggedTask, targetTask, isBelow)) {
        // Optionally show a message or just do nothing
        return;
    }

    if (!draggedTask) return;

    // Drop ON a task: make it a subtask, insert at end
    if (draggedId !== targetTaskId) {
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

export {
    renderProjectDropZone,
    renderDropZone,
    handleTaskOrProjectDrop,
    mergeProjectTasks,
    demoteProjectToTask,
};
