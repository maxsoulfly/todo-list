import {
    createProject,
    createTask,
    addProject,
    addTask,
    resetData,
} from "./data";

import { loadData, saveData, clearData } from "./storage";

const initializeApp = () => {
    resetData();
    const { projects, tasks } = loadData();
    projects.foreach(addProject);
    tasks.foreach(addTask);
};

export { initializeApp };
