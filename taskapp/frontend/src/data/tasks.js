// testing
import dayjs from "dayjs";
const INITIAL_TASKS_STORE = [
  {
    id: 1,
    user_id: null,
    title: "Task 1",
    description: "Description for Task 1",
    target: null,
    due_date: "2025-09-16T00:00:00.000Z",
    priority: "1",
    isCompleted: true,
    created_at: "2025-07-01T00:00:00.000Z",
    start_date: "2025-07-15T00:00:00.000Z",
    type: "Life",
  },
  {
    id: 2,
    user_id: null,
    title: "Task 2",
    description: "Description for Task 2",
    due_date: "2025-09-06T00:00:00.000Z",
    target: 'Project 1',
    priority: "2",
    isCompleted: false,
    created_at: "2025-07-02T00:00:00.000Z",
    start_date: "2025-07-15T00:00:00.000Z",
    type: "Other",
  },
  {
    id: 3,
    user_id: null,
    title: "Task 3",
    description: "Description for Task 3",
    target: null,
    due_date: "2025-07-18T00:00:00.000Z",
    priority: "3",
    isCompleted: true,
    created_at: "2025-07-03T00:00:00.000Z",
    start_date: "2025-07-15T00:00:00.000Z",
    type: "Work",
  },
  {
    id: 4,
    user_id: null,
    title: "Task 4",
    description: "Description for Task 4",
    target: 'Project 1',
    due_date: "2025-09-06T00:00:00.000Z",
    priority: "4",
    isCompleted: true,
    created_at: "2025-07-04T00:00:00.000Z",
    start_date: "2025-07-15T00:00:00.000Z",
    type: "Work",
  },
  {
    id: 5,
    user_id: null,
    title: "Task 5",
    description: "Description for Task 5",
    target: null,
    due_date: "2025-07-20T00:00:00.000Z",
    priority: "5",
    isCompleted: false,
    created_at: "2025-07-05T00:00:00.000Z",
    start_date: "2025-07-15T00:00:00.000Z",
    type: "Work",
  },
  {
    id: 6,
    user_id: null,
    title: "Task 6",
    description: "Description for Task 6",
    due_date: "2025-09-06T00:00:00.000Z",
    target: 'Project 1',
    priority: "1",
    isCompleted: true,
    created_at: "2025-07-06T00:00:00.000Z",
    start_date: "2025-07-15T00:00:00.000Z",
    type: "Work",
  },
  {
    id: 7,
    user_id: null,
    title: "Task 7",
    description: "Description for Task 7",
    target: null,
    due_date: "2025-09-06T00:00:00.000Z",
    priority: "2",
    isCompleted: true,
    created_at: "2025-07-07T00:00:00.000Z",
    start_date: "2025-07-15T00:00:00.000Z",
    type: "Work",
  },
  {
    id: 8,
    user_id: null,
    title: "Task 8",
    description: "Description for Task 8",
    target: null,
    due_date: "2025-08-23T00:00:00.000Z",
    priority: "3",
    isCompleted: false,
    created_at: "2025-07-08T00:00:00.000Z",
    start_date: "2025-07-15T00:00:00.000Z",
    type: "Other",
  },
  {
    id: 9,
    user_id: null,
    title: "Task 9",
    description: "Description for Task 9",
    target: null,
    due_date: "2025-09-06T00:00:00.000Z",
    priority: "4",
    isCompleted: true,
    created_at: "2025-07-09T00:00:00.000Z",
    start_date: "2025-07-15T00:00:00.000Z",
    type: "Work",
  },
  {
    id: 10,
    user_id: null,
    title: "Task 10",
    description: "Description for Task 10",
    target: null,
    due_date: "2025-09-06T00:00:00.000Z",
    priority: "5",
    isCompleted: true,
    created_at: "2025-07-10T00:00:00.000Z",
    start_date: "2025-07-15T00:00:00.000Z",
    type: "Work",
  },
];

export function getTasksStore() {
  // localStorage.removeItem('tasks-store'); // Uncomment this line to reset the tasks store during development

  // get the tasks store from local storage(Browser)
  const stringifiedTasks = localStorage.getItem("tasks-store");
  return stringifiedTasks
    ? // if found, return the tasks store in JSON format
      JSON.parse(stringifiedTasks)
    : // if not found, return the initial tasks store
      INITIAL_TASKS_STORE;
}

export async function getManyByDate(selectedDate) {
  const tasksStore = getTasksStore();

  // ...tasksStore : clone the tasks store
  let filteredTasks = [...tasksStore];
  // console.log(selectedDate, dayjs.isDayjs(selectedDate));
  if (selectedDate) {
    filteredTasks = filteredTasks
      .filter((task) => {
        // console.log(
        //   "Filtering tasks for selected date:",
        //   dayjs(selectedDate).format("YYYY-MM-DD") +
        //     " comparing with task due date:",
        //   dayjs(task.due_date).format("YYYY-MM-DD") +
        //     " Task ID: " +
        //     task.id +
        //     " isCompleted: " +
        //     task.isCompleted
        // );
        // return the task is due on or before the selected date and not completed
        return dayjs(task.due_date).isSame(dayjs(selectedDate), "day");
      })
      .sort((a, b) => {
        // put completed tasks at the end
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        // priority high to low
        return b.priority - a.priority;
      });
  }
  // console.log('Filtered tasks:', filteredTasks);
  return {
    items: filteredTasks,
    itemCount: filteredTasks.length,
  };
}

// when a task is created, updated, or deleted, we need to update the tasks store
export function setTasksStore(tasks) {
  // turn the tasks store into a string and save it in local storage(Browser)
  return localStorage.setItem("tasks-store", JSON.stringify(tasks));
}

export async function getUpcomingTasks() {
  const tasksStore = getTasksStore();

  // ...tasksStore : clone the tasks store
  let filteredTasks = [...tasksStore];
  filteredTasks = filteredTasks
    .filter((task) => {
      // return the task is due after today
      return dayjs(task.due_date).isAfter(dayjs(), "day");
    })
    .sort((a, b) => {
      // put completed tasks at the end
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      // priority high to low
      return b.priority - a.priority;
    });
  // console.log('Filtered tasks:', filteredTasks);
  return {
    items: filteredTasks,
    itemCount: filteredTasks.length,
  };
}

export async function getOverdueTasks() {
  const tasksStore = getTasksStore();

  // ...tasksStore : clone the tasks store
  let filteredTasks = [...tasksStore];
  filteredTasks = filteredTasks
    .filter((task) => {
      // return the task is due before today and not completed
      return (
        dayjs(task.due_date).isBefore(dayjs(), "day") &&
        task.isCompleted === false
      );
    })
    .sort((a, b) => {
      // priority high to low
      return b.priority - a.priority;
    });

  // console.log('Filtered tasks:', filteredTasks);
  return {
    items: filteredTasks,
    itemCount: filteredTasks.length,
  };
}
export async function getMany({ paginationModel, filterModel, sortModel }) {
  const tasksStore = getTasksStore();

  // ...tasksStore : clone the tasks store
  let filteredTasks = [...tasksStore];
  // Filter by date if provided

  // DataGrid
  // Apply filters
  if (filterModel?.items?.length) {
    filterModel.items.forEach(({ field, value, operator }) => {
      if (!field || value == null) {
        return;
      }

      // .filter() method to filter tasks based on the field, value, and operator
      filteredTasks = filteredTasks.filter((task) => {
        const taskValue = task[field];

        switch (operator) {
          case "contains":
            return String(taskValue)
              .toLowerCase()
              .includes(String(value).toLowerCase());
          case "equals":
            return taskValue === value;
          case "startsWith":
            return String(taskValue)
              .toLowerCase()
              .startsWith(String(value).toLowerCase());
          case "endsWith":
            return String(taskValue)
              .toLowerCase()
              .endsWith(String(value).toLowerCase());
          case ">":
            return taskValue > value;
          case "<":
            return taskValue < value;
          default:
            return true;
        }
      });
    });
  }

  // Apply sorting
  if (sortModel?.length) {
    filteredTasks.sort((a, b) => {
      for (const { field, sort } of sortModel) {
        if (a[field] < b[field]) {
          return sort === "asc" ? -1 : 1;
        }
        if (a[field] > b[field]) {
          return sort === "asc" ? 1 : -1;
        }
      }
      return 0;
    });
  }

  // Apply pagination
  const start = paginationModel.page * paginationModel.pageSize;
  const end = start + paginationModel.pageSize;
  const paginatedTasks = filteredTasks.slice(start, end);

  return {
    items: paginatedTasks,
    itemCount: filteredTasks.length,
  };
}

export async function getOne(taskId) {
  const tasksStore = getTasksStore();

  const taskToShow = tasksStore.find((task) => task.id === taskId);

  if (!taskToShow) {
    throw new Error("Task not found");
  }
  return taskToShow;
}

export async function createOne(data) {
  const tasksStore = getTasksStore();

  const newTask = {
    id: tasksStore.reduce((max, task) => Math.max(max, task.id), 0) + 1,
    ...data,
  };

  setTasksStore([...tasksStore, newTask]);

  return newTask;
}

export async function updateTaskStatus(taskId, isCompleted) {
  const tasksStore = getTasksStore();
  // console.log('Updating task status:', taskId, isCompleted);
  let updatedTask = null;

  setTasksStore(
    tasksStore.map((task) => {
      if (task.id === taskId) {
        updatedTask = { ...task, isCompleted };
        return updatedTask;
      }
      return task;
    })
  );

  if (!updatedTask) {
    throw new Error("Task not found");
  }
  return updatedTask;
}

export async function updateOne(taskId, data) {
  const tasksStore = getTasksStore();

  let updatedTask = null;

  setTasksStore(
    tasksStore.map((task) => {
      if (task.id === taskId) {
        updatedTask = { ...task, ...data };
        return updatedTask;
      }
      return task;
    })
  );

  if (!updatedTask) {
    throw new Error("Task not found");
  }
  return updatedTask;
}

export async function deleteOne(taskId) {
  const tasksStore = getTasksStore();

  setTasksStore(tasksStore.filter((task) => task.id !== taskId));
}

// Validation follows the [Standard Schema](https://standardschema.dev/).

export function validate(task) {
  let issues = [];
  //	id	user_id	title	description	due_date	priority	completed	created_at

  // Title
  if (!task.title || task.title.trim() === "") {
    issues.push({ message: "Task title is required", path: ["title"] });
  }

  // Description
  if (!task.description || task.description.trim() === "") {
    issues.push({
      message: "Task description is required",
      path: ["description"],
    });
  }

  // Due date
  if (!task.due_date) {
    issues.push({ message: "Due date is required", path: ["due_date"] });
  } else if (isNaN(Date.parse(task.due_date))) {
    issues.push({
      message: "Due date must be a valid date",
      path: ["due_date"],
    });
  }

  // Priority
  if (task.priority == null) {
    issues.push({ message: "Priority is required", path: ["priority"] });
  } else if (![1, 2, 3, 4, 5].includes(task.priority)) {
    issues.push({
      message: "Priority must be between 1 and 5",
      path: ["priority"],
    });
  }

  // isCompleted (optional check for boolean)
  // if (task.isCompleted != null && typeof task.isCompleted !== 'boolean') {
  //   issues.push({ message: 'Completed must be true or false', path: ['isCompleted'] });
  // }

  return { issues };
}
