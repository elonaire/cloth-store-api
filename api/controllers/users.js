const jwt = require("jsonwebtoken");
const generateUUID = require("hat");
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { generateOTP } = require("./utils");
// const moment = require('moment');
const EventEmitter = require("events");
class Job extends EventEmitter {}
let createUser = new Job();

const { User } = require("../models");
const { Temp } = require("../models");
const { UserPointAward } = require("../models");

let fetchUsers = async (req, res, next) => {
  try {
    console.log("here");
    let users = await User.findAll({
      where: {},
    });

    if (users) {
      res.status(200).json(users);
    } else {
      throw {
        error: "Users not found",
        statusCode: 404,
      };
    }
  } catch (error) {
    res.status(error.statusCode).json(error);
  }
};

// Register a new public user
let registerUser = async (req, res, next) => {
  let userDetails = req.body;

  if (
    userDetails.username &&
    userDetails.first_name &&
    userDetails.last_name &&
    userDetails.gender &&
    userDetails.phone &&
    userDetails.email &&
    userDetails.password
  ) {
    let userExists = false;

    try {
      let users = await User.findAll({
        where: {
          [Op.or]: [
            { username: userDetails.username },
            { email: userDetails.email },
            { phone: userDetails.phone },
          ],
        },
      });

      console.log("passes db check");

      if (users.length > 0) {
        userExists = true;
      }

      if (userExists) {
        res.status(403).json({
          message: "user already exists",
        });
      } else {
        // encrypt password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(userDetails.password, salt, async (err, hash) => {
            // generate userID
            userDetails["user_id"] = generateUUID();

            try {
              let userRole = userDetails.user_role
                ? userDetails.user_role
                : "PUBLIC";
              console.log(userRole);

              let user = {};
              let userRoleIsDefined = false;

              for (let field of Object.keys(userDetails)) {
                if (field === "user_role") {
                  userRoleIsDefined = true;
                }
                if (field === "password") {
                  user[field] = hash;
                } else {
                  user[field] = userDetails[field];
                }
              }

              if (!userRoleIsDefined) {
                user["user_role"] = userRole;
              }

              console.log("built", user);

              let createdUser = await User.create(user);

              const points = await UserPointAward.create({
                user_id: user["user_id"],
              });

              res.status(201).json(createdUser);
            } catch (error) {
              (error) => res.status(400).json(error);
            }
          });
        });
      }
    } catch (err) {
      (err) => res.status(400).json(err);
    }
  } else {
    res.status(400).json({
      message: "ensure the payload has all the required information",
    });
  }
};

// Add a user (for admin)
let addUser = registerUser;

// authenticate a user
let authenticateUser = async (req, res, next) => {
  let loginCredentials = req.body;
  try {
    let user = await User.findOne({
      where: {
        username: loginCredentials.username,
      },
    });

    // console.log('user', user);

    if (user) {
      let userData = user.dataValues;
      let isMatched = await bcrypt.compare(
        loginCredentials.password,
        userData.password
      );

      if (isMatched) {
        // generate OTP
        let OTP = generateOTP();
        let secret = null;

        // assign secret
        if (userData.user_role === "PUBLIC") {
          secret = process.env.USER_SECRET;
        } else if (userData.user_role === "ADMIN") {
          secret = process.env.ADMIN_SECRET;
        } else if (userData.user_role === "ICT") {
          secret = process.env.ICT_SECRET;
        }

        // generate JWTAUTH
        const JWTAUTH = jwt.sign(
          {
            username: loginCredentials.username,
          },
          secret,
          {
            expiresIn: "1h",
          }
        );

        // store OTP
        const temp = await Temp.create({
          otp: OTP,
          user_id: user.dataValues.user_id,
        });

        if (!temp) {
          throw {
            error: "User session creation failed",
            statusCode: 400,
          };
        }

        res.status(200).json({
          OTP,
          JWTAUTH,
          user: {
            userId: user.user_id,
            userRole: user.user_role,
          },
        });
      } else {
        throw {
          error: "Wrong username or password",
          statusCode: 403,
        };
      }
    } else {
      throw {
        error: "Wrong username or password",
        statusCode: 403,
      };
    }
  } catch (err) {
    res.status(err.statusCode).json(err);
  }
};

module.exports = {
  addUser,
  registerUser,
  authenticateUser,
  fetchUsers
};
