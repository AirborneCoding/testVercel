const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
 // check header
 const authHeader = req.headers.authorization;
 if (!authHeader || !authHeader.startsWith('Bearer')) {
  throw new CustomError.UnauthenticatedError('Authentication invalid');
 }
 const token = authHeader.split(' ')[1];

 try {
  const { name, userId, role } = isTokenValid({ token });
  req.user = { name, userId, role };

  // const testUser = payload.userId === '64ef73966c4336c8c00b44eb';
  // req.user = { userId: payload.userId, testUser };

  next();
 } catch (error) {
  throw new CustomError.UnauthenticatedError('Authentication invalid');
 }
};

const authorizePermissions = (...roles) => {
 return (req, res, next) => {
  if (!roles.includes(req.user.role)) {
   throw new CustomError.UnauthorizedError(
    'Unauthorized to access this route'
   );
  }
  next();
 };
};

module.exports = { authenticateUser, authorizePermissions };
