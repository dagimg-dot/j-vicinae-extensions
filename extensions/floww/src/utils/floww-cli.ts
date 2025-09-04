import { spawn } from "node:child_process";
import { showToast } from "@vicinae/api";
import type { FlowwError, Workflow } from "../types/workflow";
import { getWorkflowSummary, parseWorkflowFile } from "./config-parser";
import {
  type EnvironmentVariables,
  getFallbackEnvironment,
  getGnomeEnvironment,
} from "./environment";
import {
  configDirectoryExists,
  getAvailableWorkflows,
  readWorkflowFile,
  workflowsDirectoryExists,
} from "./file-system";
import { getSystemInfo } from "./system-info";

const FLOWW_BINARY_PATH = "/home/jd/.eget/bin/floww";

export async function isFlowwInstalled(): Promise<boolean> {
  try {
    // Instead of executing floww command, check if the config directory exists
    // This is a more reliable way to detect if floww is installed
    const configExists = await configDirectoryExists();

    if (configExists) {
      // If config exists, assume floww is installed
      return true;
    }

    // Fallback: check if the binary exists
    const fs = await import("node:fs");
    return fs.existsSync(FLOWW_BINARY_PATH);
  } catch (_error) {
    return false;
  }
}

export async function getWorkflows(): Promise<Workflow[]> {
  try {
    const workflows = await getAvailableWorkflows();

    // Enrich workflows with descriptions
    for (const workflow of workflows) {
      try {
        const content = await readWorkflowFile(workflow.filePath);
        const config = parseWorkflowFile(content, workflow.fileExtension);
        workflow.description = getWorkflowSummary(config);
      } catch (_error) {
        // If we can't parse the file, just use the name
        workflow.description = "Workflow file (parse error)";
      }
    }

    return workflows;
  } catch (error) {
    throw new Error(`Failed to get workflows: ${error}`);
  }
}

export async function applyWorkflow(workflowName: string): Promise<void> {
  const systemInfo = getSystemInfo();

  try {
    // Try to get environment from running GNOME processes
    const gnomeEnv = getGnomeEnvironment(systemInfo);
    const env = createLaunchEnvironment(gnomeEnv, systemInfo);
    const success = await _executeFlowwCommand(["apply", workflowName], env);

    if (success) {
      showToast({ title: "Success", message: `Workflow "${workflowName}" applied successfully!` });
    } else {
      showToast({ title: "Error", message: `Failed to apply workflow "${workflowName}"` });
    }
  } catch {
    // Fallback: use hardcoded environment values
    const fallbackEnv = getFallbackEnvironment(systemInfo);
    const success = await _executeFlowwCommand(["apply", workflowName], fallbackEnv);

    if (success) {
      showToast({ title: "Success", message: `Workflow "${workflowName}" applied successfully!` });
    } else {
      showToast({ title: "Error", message: `Failed to apply workflow "${workflowName}"` });
    }
  }
}

/**
 * Creates the environment for launching floww command
 */
function createLaunchEnvironment(
  gnomeEnv: EnvironmentVariables,
  systemInfo: { userHome: string; currentUser: string }
): EnvironmentVariables {
  return {
    ...gnomeEnv,
    HOME: systemInfo.userHome,
    USER: systemInfo.currentUser,
    PATH: process.env.PATH || "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  };
}

/**
 * Spawns the floww command process
 */
function _spawnFlowwCommand(args: string[], env: EnvironmentVariables): void {
  const child = spawn(FLOWW_BINARY_PATH, args, {
    detached: true,
    stdio: "ignore",
    env,
  });

  child.unref();
}

/**
 * Executes the floww command and waits for completion
 */
async function _executeFlowwCommand(args: string[], env: EnvironmentVariables): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(FLOWW_BINARY_PATH, args, {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      // Check if the command succeeded
      // floww apply typically returns 0 on success and outputs "✓ Workflow applied successfully"
      const success =
        code === 0 &&
        (stdout.includes("✓") ||
          stdout.includes("successfully") ||
          (!stderr.includes("Error") && !stderr.includes("Traceback")));
      resolve(success);
    });

    child.on("error", () => {
      resolve(false);
    });
  });
}

export async function validateWorkflow(workflowName: string): Promise<boolean> {
  const systemInfo = getSystemInfo();

  try {
    // Try to get environment from running GNOME processes
    const gnomeEnv = getGnomeEnvironment(systemInfo);
    const env = createLaunchEnvironment(gnomeEnv, systemInfo);

    // For validation, we need to capture output, so we'll use a different approach
    return await validateWorkflowWithEnv(workflowName, env);
  } catch {
    // Fallback: use hardcoded environment values
    const fallbackEnv = getFallbackEnvironment(systemInfo);
    return await validateWorkflowWithEnv(workflowName, fallbackEnv);
  }
}

async function validateWorkflowWithEnv(
  workflowName: string,
  env: EnvironmentVariables
): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(FLOWW_BINARY_PATH, ["validate", workflowName], {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let _stdout = "";
    let _stderr = "";

    child.stdout?.on("data", (data) => {
      _stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      _stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve(code === 0);
    });

    child.on("error", () => {
      resolve(false);
    });
  });
}

export async function getFlowwVersion(): Promise<string> {
  const systemInfo = getSystemInfo();

  try {
    // Try to get environment from running GNOME processes
    const gnomeEnv = getGnomeEnvironment(systemInfo);
    const env = createLaunchEnvironment(gnomeEnv, systemInfo);

    return await getFlowwVersionWithEnv(env);
  } catch {
    // Fallback: use hardcoded environment values
    const fallbackEnv = getFallbackEnvironment(systemInfo);
    return await getFlowwVersionWithEnv(fallbackEnv);
  }
}

async function getFlowwVersionWithEnv(env: EnvironmentVariables): Promise<string> {
  return new Promise((resolve) => {
    const child = spawn(FLOWW_BINARY_PATH, ["--version"], {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.on("close", () => {
      resolve(stdout.trim() || "Unknown");
    });

    child.on("error", () => {
      resolve("Unknown");
    });
  });
}

export function createFlowwError(message: string, code: FlowwError["code"]): FlowwError {
  return { message, code };
}

export async function checkFlowwSetup(): Promise<{
  installed: boolean;
  configExists: boolean;
  workflowsExist: boolean;
}> {
  const installed = await isFlowwInstalled();

  if (!installed) {
    return { installed: false, configExists: false, workflowsExist: false };
  }

  try {
    const configExists = await configDirectoryExists();
    const workflowsExist = await workflowsDirectoryExists();

    return { installed, configExists, workflowsExist };
  } catch (_error) {
    return { installed, configExists: false, workflowsExist: false };
  }
}
