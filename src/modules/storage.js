const saveDAta = ({ projects, tasks }) => {
    localStorage.setItem("todoData", JSON.stringify({ projects, tasks }));
};

const loadData = () => {
    const data = JSON.parse(localStorage.getItem("todoData"));

    return {
        projects: data?.projects || [],
        tasks: data?.tasks || [],
    };
};

const clearData = () => {
    localStorage.removeItem("todoData");
};

export { saveDAta, loadData, clearData };
