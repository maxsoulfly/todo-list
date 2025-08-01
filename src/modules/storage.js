import { getAllProjects, getAllTasks } from "./data.js";

const saveData = ({
    projects = getAllProjects(),
    tasks = getAllTasks(),
} = {}) => {
    localStorage.setItem("todoData", JSON.stringify({ projects, tasks }));
};

const loadData = () => {
    const raw = localStorage.getItem("todoData");
    if (!raw) return { projects: [], tasks: [] };

    const data = JSON.parse(raw);

    return {
        projects: data?.projects || [],
        tasks: data?.tasks || [],
    };
};

const clearData = () => {
    localStorage.removeItem("todoData");
};

export { saveData, loadData, clearData };
