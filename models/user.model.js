const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
 name: {
  type: String,
  trim: true,
  required: [true, "Please Provide Name"],
  minlength: [3, "Please provide name more than 3 characters"],
  maxlength: [20, "Please provide name less than 20 characters"],
  unique: true
 },
 password: {
  type: String,
  required: [true, "Please Provide Password"],
  minlength: [6, "Password should be more than 6 characters"],
 },
 email: {
  type: String,
  unique: true,
  required: [true, 'Please provide email'],
  validate: {
   validator: validator.isEmail,
   message: 'Please provide valid email',
  },
 },
 role: {
  type: String,
  enum: ["admin", "user"],
  default: "user"
 }
})

//hash ispassword change pre save
userSchema.pre("save", async function () {
 if (!this.isModified("password")) return
 const salt = await bcrypt.genSalt(10)
 this.password = await bcrypt.hash(this.password, salt)
})

//! create jwt hook
userSchema.methods.createJWT = function () {
 return jwt.sign(
  { userId: this._id, name: this.name, role: this.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_LIFETIME }
 )
}

// comparePassword hook
userSchema.methods.comparePassword = async function (canditatePassword) {
 const isMatch = await bcrypt.compare(canditatePassword, this.password)
 return isMatch
}

//  ! this should be worked will fixed later
// userSchema.pre('deleteOne', async function (next) {
//  await this.model('Task').deleteMany({ user: this._id });
// });

module.exports = mongoose.model("User", userSchema)