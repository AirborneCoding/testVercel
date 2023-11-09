const router = require("express").Router()

const { authorizePermissions } = require("../../middleware/authenticationJWT")

const testUser = require("../../middleware/testUser")

const {
 createTask,
 updateTask,
 deleteTask,
 getAllTasks,
 getSingletask,
 countTasks,
 getAllTasksForAdmin
} = require("../../controllers/tasks/task.controller")

router.route("/")
 .post(testUser,createTask)
 .get(getAllTasks)

router.get("/usersTasks", authorizePermissions("admin"), getAllTasksForAdmin)

router.get("/count", countTasks)

router.route("/:id")
 .get(getSingletask)
 .patch(updateTask)
 .delete(testUser,deleteTask)


module.exports = router