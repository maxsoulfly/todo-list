import { getAllProjects, getAllTasks, getTaskById } from "../data.js";
import { saveData } from "../storage.js";
import { renderProjects } from "./projectUI.js";

const addProjectDraggability = (projectColumn, project) => {
    projectColumn.setAttribute("draggable", "true");
    projectColumn.dataset.projectId = project.id;

    projectColumn.addEventListener("dragstart", (e) => {
        if (e.target.closest(".task")) {
            e.preventDefault();
            return;
        }

        startProjectDrag(e, project.id);
    });

    projectColumn.addEventListener("dragleave", (e) => {});
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

const addTaskDraggability = (taskContainer, task, projectId) => {
    taskContainer.setAttribute("draggable", "true");
    taskContainer.dataset.taskId = task.id;
    taskContainer.dataset.projectId = projectId;

    taskContainer.addEventListener("dragstart", (e) =>
        startDrag(e, task, projectId)
    );
    taskContainer.addEventListener("dragend", clearDragStyles);
};

const addTaskDroppability = (taskContainer, task, projectId) => {
    taskContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        taskContainer.classList.add("drag-over-subtarget");
    });

    taskContainer.addEventListener("dragleave", (e) => {
        taskContainer.classList.remove("drag-over-subtarget");
    });

    taskContainer.addEventListener("drop", (e) => {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));

        if (data.taskId && data.taskId !== task.id) {
            const draggedTask = getTaskById(data.taskId);
            draggedTask.parentTaskId = task.id;
            draggedTask.projectId = projectId;

            saveData({
                projects: getAllProjects(),
                tasks: getAllTasks(),
            });

            renderProjects();
        }
        taskContainer.classList.remove("drag-over-subtarget");
    });
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

export {
    addProjectDraggability,
    startProjectDrag,
    addTaskDraggability,
    startDrag,
    clearDragStyles,
    addTaskDroppability,
};
