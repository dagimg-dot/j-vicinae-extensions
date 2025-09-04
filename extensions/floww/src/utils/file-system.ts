import { readdir, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { extname, join } from "node:path";
import type { Workflow } from "../types/workflow";

const FLOWW_CONFIG_DIR = join(homedir(), ".config", "floww");
const WORKFLOWS_DIR = join(FLOWW_CONFIG_DIR, "workflows");

export async function getWorkflowsDirectory(): Promise<string> {
  return WORKFLOWS_DIR;
}

export async function getConfigDirectory(): Promise<string> {
  return FLOWW_CONFIG_DIR;
}

export async function getAvailableWorkflows(): Promise<Workflow[]> {
  try {
    const files = await readdir(WORKFLOWS_DIR);
    const workflows: Workflow[] = [];

    for (const file of files) {
      const filePath = join(WORKFLOWS_DIR, file);
      const stats = await stat(filePath);

      if (stats.isFile()) {
        const extension = extname(file).toLowerCase();
        const name = file.replace(extension, "");

        workflows.push({
          name,
          filePath,
          fileExtension: extension,
          lastModified: stats.mtime,
        });
      }
    }

    return workflows.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    throw new Error(`Failed to read workflows directory: ${error}`);
  }
}

export async function readWorkflowFile(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read workflow file: ${error}`);
  }
}

export async function configDirectoryExists(): Promise<boolean> {
  try {
    await stat(FLOWW_CONFIG_DIR);
    return true;
  } catch {
    return false;
  }
}

export async function workflowsDirectoryExists(): Promise<boolean> {
  try {
    await stat(WORKFLOWS_DIR);
    return true;
  } catch {
    return false;
  }
}
