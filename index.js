require("dotenv").config()
require("express-async-errors")

const express = require("express")
const app = express()

const path = require("path")
const cors = require("cors")

const connectDB = require("./db/connectDB")

const authRouter = require("./routes/auth/auth.routes")
const taskRouter = require("./routes/tasks/task.routes")

const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")



const corsOptions = {
    origin: "http://localhost:5173"
}
// static folder
app.use(cors())
app.use(express.json())

const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();

const { authenticateUser } = require("./middleware/authenticationJWT")
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/tasks", authenticateUser, taskRouter)

// SSE 
const { notification, SSEclients, notifications } = require("./utils/SSE")

app.get("/sse/:role", (req, res) => {
    // console.log(res);
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    const userRole = req.params.role;
    console.log(userRole);

    // SSEclients.push({ res })
    SSEclients.push({ res, role: userRole });

    // notifications.forEach((notification) => {
    //     res.write(`data: ${JSON.stringify(notification)}\n\n`)
    // })
    notifications.forEach((notification) => {
        if (notification.roles.includes(userRole) || userRole === 'admin') {
            res.write(`data: ${JSON.stringify(notification)}\n\n`);
        }
    });

    req.on("close", () => {
        const index = SSEclients.findIndex((client) => client.res === res)
        if (index !== -1) {
            SSEclients.splice(index, 1)
        }
    })
})





//----------


app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

// const { EventEmitter } = require('events');
// const taskEmitter = new EventEmitter();


// port and start function
const PORT = process.env.PORT || 5000
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(PORT, () => console.log("server is running on port: ", PORT))
    } catch (error) {
        console.log("something went wrong: ", error);
    }
}
start()