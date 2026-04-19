const bcrypt = require("bcryptjs");
const User = require("./models/User");
const sequelize = require("./db");

async function createAdmin() {
  await sequelize.sync();

  const email = "admin@example.com";
  const password = "123456";
  const hashedPassword = await bcrypt.hash(password, 10);

  const [admin, created] = await User.findOrCreate({
    where: { email },
    defaults: { password: hashedPassword, role: "admin" },
  });

  console.log(created ? "Admin created" : "Admin already exists");
  process.exit();
}

createAdmin();
