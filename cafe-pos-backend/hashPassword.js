const bcrypt = require("bcryptjs");

async function generateHash() {
  const password = "123456"; // your desired password
  const hashed = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashed);
}

generateHash();