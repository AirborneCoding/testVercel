const User = require("../../models/user.model")
const { StatusCodes } = require("http-status-codes")
const CustomError = require("../../errors")
const { createTokenUser } = require("../../utils")
const Task = require("../../models/task.model")


const registerUser = async (req, res) => {
 // 01- take req.body
 const { name, email, password } = req.body

 // 02- check email and name is already exist
 const isEmailAlreadyExist = await User.findOne({ email })
 if (isEmailAlreadyExist) {
  throw new CustomError.BadRequestError("Email already exists")
 }
 const isNameAlreadyExist = await User.findOne({ name })
 if (isNameAlreadyExist) {
  throw new CustomError.BadRequestError("Name Already exists, Please Try with different name")
 }

 // 03- set first user an admin
 const isFirstAccount = (await User.countDocuments({})) === 0
 const role = isFirstAccount ? "admin" : "user"

 // ! this used when we verifiy with email crypto (04-create random token) 

 // 05- create user
 const user = await User.create({
  name: name,
  email: email,
  password: password,
  role: role
 })

 // 06- create jwt
 const token = user.createJWT()
 // const token = createTokenUser(user)

 // 07- send response
 res.status(StatusCodes.CREATED).json({
  user: {
   name: name,
   email: email,
   role,
   token
  }
 })
}

const loginUser = async (req, res) => {
 // 01- take req.body
 // naimal : stand from name or email
 const { naimal, password } = req.body

 // 02- check email and password is provided
 if (!password || !naimal) {
  throw new CustomError.BadRequestError("please provide your information")
 }

 // 03- check user is exist by email or name or both
 const user = await User.findOne({ email: naimal }) || await User.findOne({ name: naimal })
 if (!user) {
  throw new CustomError.UnauthenticatedError("Invalid Credentials")
 }

 // 04- compare password method
 const isPasswordMatch = await user.comparePassword(password)
 if (!isPasswordMatch) {
  throw new CustomError.UnauthenticatedError("Invalid Credentials")
 }

 // 05- create token
 const token = user.createJWT()

 // 06-send response
 res.status(StatusCodes.OK).json({
  user: {
   name: user.name,
   email: user.email,
   role: user.role,
   token
  }
 })
}




const updateUser = async (req, res) => {
 const { email, name } = req.body;
 // if (!email || !name) {
 //  throw new CustomError.BadRequestError('Please provide your missed values');
 // }
 const user = await User.findOne({ _id: req.user.userId });

 user.email = email;
 user.name = name;

 await user.save();
 const token = user.createJWT();
 res.status(StatusCodes.OK).json({
  user: {
   email: user.email,
   name: user.name,
   token,
  },
 });
};

const deleteUser = async (req, res) => {
 const user = await User.findOne({ _id: req.user.userId });
 if (!user) {
  throw new CustomError.NotFoundError("user not found")
 }

 await Task.deleteMany({ user: req.user.userId })
 await user.deleteOne()


 res.status(StatusCodes.OK).json({ msg: "user deleted" })

}


//! only for admin
const getAllUsers = async (req, res) => {
 const users = await User.find({})
 res.status(StatusCodes.OK).json({ count: users.length, users })
}



module.exports = {
 registerUser, loginUser, getAllUsers, updateUser, deleteUser
}