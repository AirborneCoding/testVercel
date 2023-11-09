const { BadRequestError, UnauthorizedError } = require('../errors');

const testUser = (req, res, next) => {
  if (req.user.userId === "64ef73966c4336c8c00b44eb") {
    throw new UnauthorizedError('Test User.Can Read Only , you can only update tasks , try register instead');
  }
  next();
};

module.exports = testUser;
