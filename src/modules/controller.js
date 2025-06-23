import {
    createProject,
    createTask,
    addProject,
    addTask,
    resetData,
    getAllProjects,
} from "./data";

import { loadData, saveData, clearData } from "./storage";

const initializeApp = () => {
    resetData();
    const { projects = [], tasks = [] } = loadData();

    if (projects.length === 0) {
        const demo = createProject("Demo Project");
        addProject(demo);
        saveData({ projects: getAllProjects(), tasks: [] });
    }

    projects.forEach(addProject);
    tasks.forEach(addTask);
};

export { initializeApp };
