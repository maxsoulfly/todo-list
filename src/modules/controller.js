import {
    createProject,
    createTask,
    addProject,
    addTask,
    resetData,
    getAllProjects,
    getAllTasks,
} from "./data";

import { loadData, saveData, clearData } from "./storage";

import {
    renderProjects,
    renderTasks,
    setupAddProjectButton,
    renderSidebar,
    setupSidebarToggle,
} from "./ui";

const initializeApp = () => {
    resetData();
    const { projects = [], tasks = [] } = loadData();

    if (projects.length === 0) {
        const demo = createProject("Demo Project");
        addProject(demo);
        saveData({ projects: getAllProjects(), tasks: getAllTasks() });
    }

    projects.forEach(addProject);
    tasks.forEach(addTask);

    setupAddProjectButton();
    renderProjects();
    renderTasks();
    setupSidebarToggle();
};

export { initializeApp };
