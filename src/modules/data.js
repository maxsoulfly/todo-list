import { generateId } from "./utils.js";
import { saveData } from "./storage.js";

// =======================
// Data Storage
// =======================
// In-memory arrays for projects and tasks
const projects = [];
const tasks = [];

// =======================
// Project CRUD
// =======================

// Create a new project object
const createProject = (title) => {
    if (!title || title.trim() === "") {
        throw new Error("Project title cannot be empty");
    }
    return {
        id: generateId(),
        title: title.trim(),
        createdAt: new Date().toISOString(),
        order: projects.length,
        hidden: false,
    };
};

// Add a project to the projects array
const addProject = (project) => {
    projects.push(project);
};

// Delete a project and all its tasks
const deleteProject = (id) => {
    const projectTasks = getTasksForProject(id);
    projectTasks.forEach((task) => deleteTask(task.id));
    const index = projects.findIndex((project) => project.id === id);
    if (index > -1) projects.splice(index, 1);
};

// Toggle project hidden/visible state
const toggleProjectVisibility = (projectId) => {
    const project = getProject(projectId);
    project.hidden = !project.hidden;
    saveData({ projects: getAllProjects(), tasks: getAllTasks() });
};

// Get all projects, sorted by order
const getAllProjects = () => {
    return [...projects].sort((a, b) => a.order - b.order);
};

// Get a project by its id
const getProject = (id) => {
    return getAllProjects().find((project) => project.id === id);
};

// Check if a project has any tasks
const hasTasks = (projectId) => getTasksForProject(projectId).length > 0;

// =======================
// Task CRUD
// =======================

// Create a new task object
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

// Add a task to the tasks array
const addTask = (task) => {
    tasks.push(task);
};

// Delete a task by id
const deleteTask = (id) => {
    const index = tasks.findIndex((task) => task.id === id);
    if (index > -1) tasks.splice(index, 1);
};

// Get all tasks
const getAllTasks = () => {
    return tasks;
};

// Get all tasks for a given project
const getTasksForProject = (projectId) => {
    return tasks.filter((task) => task.projectId === projectId);
};

// Get a task by its id
const getTaskById = (id) => {
    return tasks.find((task) => task.id === id);
};

// Get all subtasks for a parent task
const getSubtasks = (parentTaskId) => {
    return tasks.filter((task) => task.parentTaskId === parentTaskId);
};

// Check if a task has any subtasks
const hasSubtasks = (taskId) => getSubtasks(taskId).length > 0;

// =======================
// Data Utilities
// =======================

// Reset all projects and tasks
const resetData = () => {
    projects.length = 0;
    tasks.length = 0;
};

// =======================
// Project CRUD
// =======================
export {
    createProject,           // Create a new project object
    addProject,              // Add a project to the projects array
    deleteProject,           // Delete a project and its tasks
    toggleProjectVisibility, // Toggle project hidden/visible state
    getAllProjects,          // Get all projects, sorted by order
    getProject,              // Get a project by its id
    hasTasks,                // Check if a project has any tasks

// =======================
// Task CRUD
// =======================
    createTask,              // Create a new task object
    addTask,                 // Add a task to the tasks array
    deleteTask,              // Delete a task by id
    getAllTasks,             // Get all tasks
    getTasksForProject,      // Get all tasks for a given project
    getTaskById,             // Get a task by its id
    getSubtasks,             // Get all subtasks for a parent task
    hasSubtasks,             // Check if a task has any subtasks

// =======================
// Data Utilities
// =======================
    resetData,               // Reset all projects and tasks
};
