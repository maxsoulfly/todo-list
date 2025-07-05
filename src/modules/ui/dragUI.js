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
};
