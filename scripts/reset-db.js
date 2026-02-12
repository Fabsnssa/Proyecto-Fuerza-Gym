import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const dataDir = join(process.cwd(), "data");

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

writeFileSync(join(dataDir, "users.json"), "[]", "utf-8");
writeFileSync(join(dataDir, "metrics.json"), "[]", "utf-8");

console.log("Database reset: users.json and metrics.json are now empty arrays.");
