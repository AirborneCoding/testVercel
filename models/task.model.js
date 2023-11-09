const mongoose = require("mongoose")

const TaskSchema = new mongoose.Schema({
 title: {
  type: String,
  required: [true, "Please provide task title"],
  trim: true,
  maxlength: [50, "titles must be smaller than 50 characters"]
 },
 description: {
  type: String,
  trim: true,
 },
 completed: {
  type: Boolean,
  default: false,
 },
 category: {
  type: String,
  enum: {
   values: ["work", "personal", "health & fitness", "study", "social", "travel", "hobbies", "finance", "home improvement", "Project Specific", "goals"],
   message: "{VALUE} is not supported"
  },
  required: [true, "Please Provide a category for your task"]
 },
 status: {
  type: String,
  enum: {
   values: ['not started', 'done', 'upcoming', 'new', 'to-do', 'In Progress', 'planned', 'pending approval', 'scheduled'],
   message: "{VALUE} is not supported"
  },
  default: 'not started',
 },
 user: {
  type: mongoose.Types.ObjectId,
  ref: "User",
  required: true
 }
},
 { timestamps: true }
)




// TaskSchema.pre('remove', async function (next) {
//  await this.model('Task').deleteMany({ user: this._id });
// });




module.exports = mongoose.model("Task", TaskSchema)