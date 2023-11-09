const User = require("../../models/user.model")
const Task = require("../../models/task.model")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../../errors")
const moment = require("moment")
const { checkPermissions } = require("../../utils")
const { sendSSENotification, fakeUniqueId } = require("../../utils/SSE")
const { EventEmitter } = require('events');
const taskEmitter = new EventEmitter();
/**-----------------------------------------------
 * @desc    Create New task
 * @route   /api/v1/tasks
 * @method  POST
 * @access  private 
------------------------------------------------*/
// const createTask = async (req, res) => {
//     req.body.user = req.user.userId

//     // const testUser = await User.findOne({ email: "test@test.com" })
//     // if (testUser.name === req.user.name) {
//     //  throw new CustomError.UnauthorizedError("(Your limits only edit the tasks),This account only for testing , Please register and login with valide information to can test our app")
//     // }

//     let task = await Task.create(req.body);

//     res.status(StatusCodes.CREATED).json({ msg: "Task created ", task })
// }

const createTask = async (req, res) => {
    req.body.user = req.user.userId

    let task = await Task.create(req.body);

    // sse
    const msg = `${req.user.name} had created a task`
    const notif = {
        id: fakeUniqueId,
        title: "new notifiactions",
        msg,
        isRead: false
    }

    // if (req.user.role === "admin") {
    // }
    sendSSENotification(notif)

    res.status(StatusCodes.CREATED).json({ msg: "Task created ", task })
}



/**-----------------------------------------------
 * @desc    Get All Tasks
 * @route   /api/v1/tasks
 * @method  GET
 * @access  private 
------------------------------------------------*/
const getAllTasks = async (req, res) => {
    const userId = req.user.userId;

    const { title, category, status, completed, sort } = req.query
    let filterObject = {}

    if (completed) {
        filterObject.completed = completed === "on" ? true : false
    }


    if (title) {
        // filterObject.title = { $regex: title, $options: "i" }
        filterObject.$or = [
            { title: { $regex: title, $options: "i" } },
            { description: { $regex: title, $options: "i" } },
        ]
    }

    if (category && category !== 'all') {
        filterObject.category = category
    }

    if (status && status !== 'all') {
        filterObject.status = status
    }

    // let result =  Task.find({ filterObject, user: userId })
    let result = Task.find({ ...filterObject, user: userId });


    if (sort) {
        if (sort === 'a-z') {
            result = result.sort('title');
        } else if (sort === 'z-a') {
            result = result.sort('-title');
        } else if (sort === 'latest') {
            result = result.sort('-createdAt');
        } else if (sort === 'oldest') {
            result = result.sort('createdAt');
        }
    }

    // Pagination logic
    const pageInt = Number(req.query.page) || 1;
    const pageSizeInt = Number(req.query.pageSize) || 12;
    const skip = (pageInt - 1) * pageSizeInt;

    result = result.skip(skip).limit(pageSizeInt)
    // .sort("-createdAt");
    let tasks = await result

    // Get total count of documents
    const totalDocuments = await Task.countDocuments({ ...filterObject, user: userId });
    // Calculate pageCount
    const pageCount = Math.ceil(totalDocuments / pageSizeInt);
    // Construct pagination object
    const pagination = {
        page: pageInt,
        pageSize: pageSizeInt,
        pageCount,
        total: totalDocuments,
    };

    moment.locale('ar-ma');

    tasks = tasks.map(task => ({
        ...task._doc,
        createdAt: moment(task.createdAt).format('LLLL'),
        updatedAt: moment(task.updatedAt).format('LLLL'),
    }));

    res.status(StatusCodes.OK).json({ count: tasks.length, tasks, pagination });
};


/**-----------------------------------------------
 * @desc    Get Single Task
 * @route   /api/v1/tasks/:id
 * @method  GET
 * @access  private
------------------------------------------------*/
const getSingletask = async (req, res) => {
    const { id: taskId } = req.params;

    let task = await Task.findOne({ _id: taskId });
    if (!task) {
        throw new CustomError.NotFoundError("Task not found");
    }

    moment.locale('ar-ma');

    task = {
        ...task._doc,
        createdAt: moment(task.createdAt).format('LLLL'),
        updatedAt: moment(task.updatedAt).format('LLLL'),
    };

    checkPermissions(req.user, task.user);

    res.status(StatusCodes.OK).json({ task });
};


/**-----------------------------------------------
 * @desc    update Task
 * @route   /api/v1/tasks/:id
 * @method  Update
 * @access  private  
------------------------------------------------*/
const updateTask = async (req, res) => {
    const { id: taskId } = req.params

    let task = await Task.findOneAndUpdate(
        { _id: taskId },
        req.body,
        { new: true, runValidators: true }
    )

    if (!task) {
        throw new CustomError.NotFoundError("Task not found")
    }

    moment.locale('ar-ma');

    task = {
        ...task._doc,
        createdAt: moment(task.createdAt).format('LLLL'),
        updatedAt: moment(task.updatedAt).format('LLLL'),
    };

    checkPermissions(req.user, task.user);

    res.status(StatusCodes.CREATED).json({ msg: "Task updated", task })
}

/**-----------------------------------------------
 * @desc    Delete Task
 * @route   /api/v1/tasks/:id
 * @method  DELETE
 * @access  private  
------------------------------------------------*/
const deleteTask = async (req, res) => {
    const { id: taskId } = req.params

    const task = await Task.findOne({ _id: taskId })
    if (!task) {
        throw new CustomError.NotFoundError("Task not found")
    }

    // const testUser = await User.findOne({ email: "test@test.com" })
    // if (testUser.name === req.user.name) {
    //  throw new CustomError.UnauthorizedError("(Your limits only edit the tasks),This account only for testing , Please register and login with valide information to can test our app")
    // }

    checkPermissions(req.user, task.user)

    await task.deleteOne()

    res.status(StatusCodes.CREATED).json({ msg: "Task deleted" })
}

/**-----------------------------------------------
 * @desc    get tasks count
 * @route   /api/v1/tasks
 * @method  GET
 * @access  private (admin)
------------------------------------------------*/
const countTasks = async (req, res) => {
    const userId = req.user.userId
    const tasks = await Task.count({ user: userId })
    res.status(StatusCodes.OK).json({ tasks })
}


/**-----------------------------------------------
 * @desc    Get All Tasks
 * @route   /api/v1/tasks
 * @method  GET
 * @access  private (admin)
------------------------------------------------*/
const getAllTasksForAdmin = async (req, res) => {
    const userId = req.user.userId;
    let tasks = await Task.find({ user: userId })
        .sort("-createdAt")
        .populate({
            path: "user",
            select: "-password -role"
        })

    moment.locale('ar-ma');

    tasks = tasks.map(task => ({
        ...task._doc,
        createdAt: moment(task.createdAt).format('LLLL'),
        updatedAt: moment(task.updatedAt).format('LLLL'),
    }));

    res.status(StatusCodes.OK).json({ count: tasks.length, tasks });
};

module.exports = {
    createTask,
    updateTask,
    deleteTask,
    getAllTasks,
    getSingletask,
    countTasks,
    getAllTasksForAdmin
}