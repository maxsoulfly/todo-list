// --- Utility/Helper Functions ---
const formatDate = (isoDate) => {
    const options = { month: "short", day: "numeric" }; // e.g. Jun 26
    return new Date(isoDate).toLocaleDateString(undefined, options);
};

const renderStatus = (task) => {
    if (task.status === "todo") return "[ ]";
    if (task.status === "in-progress") return "[-]";
    if (task.status === "done") return "[v]";
};

export { formatDate, renderStatus };
