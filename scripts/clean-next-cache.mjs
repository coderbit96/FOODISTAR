import { rmSync } from "node:fs";
import { resolve } from "node:path";

const generatedPaths = [".next"];

for (const path of generatedPaths) {
  try {
    rmSync(resolve(process.cwd(), path), { force: true, recursive: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Could not remove ${path}. Stop any running dev server and try again. ${message}`);
  }
}
