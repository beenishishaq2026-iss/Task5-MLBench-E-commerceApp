const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline/promises");
const { stdin, stdout } = require("process");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

async function promptMissing(name, email, password) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    if (!name) name = await rl.question("Admin name: ");
    if (!email) email = await rl.question("Admin email: ");
    if (!password) password = await rl.question("Admin password (min 8 chars): ");
  } finally {
    rl.close();
  }
  return { name, email, password };
}

async function main() {
  const [, , argName, argEmail, argPassword] = process.argv;
  let { name, email, password } = await promptMissing(argName, argEmail, argPassword);

  name = name?.trim();
  email = email?.trim().toLowerCase();

  if (!name || !email || !password) {
    console.error("Name, email, and password are all required.");
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exitCode = 1;
    return;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set. Run with: node --env-file=.env.local scripts/createAdmin.js");
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(mongoUri);

  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      console.error(`An admin with email ${email} already exists.`);
      process.exitCode = 1;
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashedPassword });

    console.log(`Admin account created: ${admin.email} (id: ${admin._id})`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exitCode = 1;
});