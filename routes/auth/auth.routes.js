const router = require("express").Router()
const { authorizePermissions, authenticateUser } = require("../../middleware/authenticationJWT")


const {
 registerUser, loginUser, getAllUsers, updateUser, deleteUser
} = require("../../controllers/auth/auth.controller")
const testUser = require("../../middleware/testUser")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.patch('/updateUser', authenticateUser, testUser, updateUser);
router.delete('/deleteUser', authenticateUser, testUser, deleteUser);
router.get("/users", authenticateUser, authorizePermissions("admin"), getAllUsers)


module.exports = router