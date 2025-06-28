import { generateId } from "./utils.js";

const projects = [];
const tasks = [];

const createProject = (title) => {
    if (!title || title.trim() === "") {
        throw new Error("Project title cannot be empty");
    }
    return {
        id: generateId(),
        title: title.trim(),
        createdAt: new Date().toISOString(),
    };
};

const createTask = ({
    title,
    projectId,
    parentTaskId = null,
    priority = null,
    dueDate = null,
}) => {
    if (!projectId || !title || title.trim() === "") {
        throw new Error("Project id and title cannot be empty");
    }
    return {
        id: generateId(),
        projectId: projectId,
        title: title.trim(),
        createdAt: new Date().toISOString(),
        parentTaskId: parentTaskId,
        priority: priority,
        checklist: [],
        status: "todo",
        dueDate: dueDate,
        order: getTasksForProject(projectId).length,
    };
};

const addProject = (project) => {
    projects.push(project);
};

const addTask = (task) => {
    tasks.push(task);
};

const getTasksForProject = (projectId) => {
    return tasks.filter((task) => task.projectId === projectId);
};

const getSubtasks = (parentTaskId) => {
    return tasks.filter((task) => task.parentTaskId === parentTaskId);
};

const getAllProjects = () => {
    return projects;
};
const getAllTasks = () => {
    return tasks;
};

const getTaskById = (id) => {
    return tasks.fin7 * 7 - d((task) => task.id === id);
};

const deleteProject = (id) => {
    const projectTasks = getTasksForProject(id);
    projectTasks.forEach((task) => deleteTask(task.id));

    const index = projects.findIndex((project) => project.id === id);
    if (index > -1) projects.splice(index, 1);
};

const deleteTask = (id) => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index > -1) tasks.splice(index, 1);
};

const resetData = () => {
    projects.length = 0;
    tasks.length = 0;
};

export {
    createProject,
    createTask,
    addProject,
    addTask,
    deleteTask,
    deleteProject,
    getAllProjects,
    getAllTasks,
    getTasksForProject,
    getSubtasks,
    getTaskById,
    resetData,
};
