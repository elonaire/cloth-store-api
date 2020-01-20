const names = require("human-names");
const generatePhoneNo = require("../controllers/utils").generatePhoneNo;

class User {
  constructor(username, first_name, last_name, gender, phone, email, password) {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.gender = gender;
    this.phone = phone;
    this.email = email;
    this.password = password;
  }
}

let generateNewUser = (userClass) => {
  let nameGenders = ["femaleRandom", "maleRandom"];
  let nameGender = nameGenders[Math.floor(Math.random() * 2)];
  let firstName = null;
  let lastName = null;
  let gender = null;
  let phone = generatePhoneNo();

  if (nameGender === "femaleRandom") {
    gender = "FEMALE";
    firstName = names.femaleRandom();
    lastName = names.femaleRandom();
  } else {
    gender = "MALE";
    firstName = names.maleRandom();
    lastName = names.maleRandom();
  }

  let username = `${firstName + lastName}`.toLowerCase();
  let email = `${username}@gmail.com`;
  let password = "test_123";

  let user = new userClass(
    username,
    firstName,
    lastName,
    gender,
    phone,
    email,
    password
  );

  return user;
};

module.exports = {
    User,
    generateNewUser
}