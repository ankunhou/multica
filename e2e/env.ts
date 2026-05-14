import { existsSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

const envCandidates = process.env.MULTICA_ENV_FILE ? [process.env.MULTICA_ENV_FILE] : [".env"];

for (const filename of envCandidates) {
  const path = resolve(process.cwd(), filename);
  if (existsSync(path)) {
    config({ path });
    break;
  }
}
