import {
    getAllProjects,
    getAllTasks,
    getTasksForProject,
    createTask,
    addTask,
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

const handleTaskDrop = (data, projectId, targetTaskId, isBelow) => {
    const { taskId: draggedId, fromProjectId } = data;
    if (!isBelow && draggedId !== targetTaskId) {
        const draggedTask = getTaskById(draggedId);
        const targetTask = getTaskById(targetTaskId);

        if (draggedTask && targetTask) {
            draggedTask.parentTaskId = targetTask.id;
            draggedTask.projectId = projectId;

            saveData({
                projects: getAllProjects(),
                tasks: getAllTasks(),
            });

            renderProjects();
            return;
        }
    }

    handleTaskReorder(taskId, targetTaskId, projectId, isBelow, fromProjectId);
};

const handleTaskOrProjectDrop = (e, projectId, targetTaskId, isBelow) => {
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));

    if (data.draggedProjectId) {
        handleProjectDrop(data, projectId);
    } else {
        handleTaskDrop(data, projectId, targetTaskId, isBelow);
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
