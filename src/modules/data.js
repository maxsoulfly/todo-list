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
	};
};
