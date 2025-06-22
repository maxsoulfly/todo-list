import { ta } from "date-fns/locale";
import { getAllProjects, getTasksForProject } from "./data";
const renderProjects = () => {
    const appContainer = document.getElementById("app");
    appContainer.innerHTML = "";

    const projects = getAllProjects();
    projects.forEach((project) => {
        const projectColumn = document.createElement("div");
        projectColumn.classList.add("project-column");

        const title = document.createElement("h3");
        title.innerText = project.title;
        projectColumn.append(title);

        const tasks = renderTasks(project.id);
        projectColumn.append(tasks);
        appContainer.append(projectColumn);
    });
};

const renderTasks = (projectId) => {
    const taskList = document.createElement("div");
    taskList.classList.add("task-list");

    const tasks = getTasksForProject(projectId);
    tasks.forEach((task) => {
        const title = document.createElement("h3");
        title.innerText = task.title;
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
