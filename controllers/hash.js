const bcrypt = require("bcrypt");

// Function that hashes an input (used for delete_password)
exports.hashInput = async function(input) {
  const saltRounds = 12;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashResult = await bcrypt.hash(input, salt);
  return hashResult;
};

// Function that compares a hash to a password
exports.compareHash = async function (text, hash) {
  return await bcrypt.compare(text, hash);
};