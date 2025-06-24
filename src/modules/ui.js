import {
    createTask,
    getAllProjects,
    getTasksForProject,
    addTask,
    createProject,
    addProject,
    getAllTasks,
} from "./data";

import { saveData } from "./storage";

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

const renderProjects = () => {
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = "";

    const projects = getAllProjects();
    projects.forEach((project) => {
        const projectColumn = document.createElement("div");
        projectColumn.classList.add("project-column");

        const title = document.createElement("h2");
        title.innerText = project.title;
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
        const title = document.createElement("p");
        title.innerText = task.title;

        const controls = document.createElement("span");
        controls.classList.add = "task-controls";

        const deleteBtn = document.createElement("span");
        deleteBtn.innerText = "[X]";

        const editBtn = document.createElement("span");
        editBtn.innerText = "[Edit]";

        controls.append(editBtn, deleteBtn);

        title.append(controls);

        taskList.append(title);

        if (task.dueDate) {
            const dueDate = document.createElement("p");
            dueDate.innerText = `Due date: ${task.dueDate}`;
            taskList.append(dueDate);
        }
        if (task.priority) {
            taskList.classList.add(`priority-${task.priority}`);
        }
    });

    return taskList;
};

const setupAddProjectButton = () => {
    const button = document.getElementById("add-project-btn");
    button.addEventListener("click", () => {
        const title = prompt("Enter project name");
        if (!title || title.trim() === "") return;

        const newProject = createProject(title);
        addProject(newProject);
        saveData({ projects: getAllProjects(), tasks: [] });

        renderProjects();
    });
};

export { renderProjects, renderTasks, setupAddProjectButton };
