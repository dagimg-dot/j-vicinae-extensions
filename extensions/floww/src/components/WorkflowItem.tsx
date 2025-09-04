import { readFile } from "node:fs/promises";
import { Action, ActionPanel, Icon, List } from "@vicinae/api";
import { useEffect, useState } from "react";
import type { Workflow } from "../types/workflow";
import { validateWorkflow } from "../utils/floww-cli";

interface WorkflowItemProps {
  workflow: Workflow;
  onApply: (workflowName: string) => Promise<void>;
  id?: string;
}

export function WorkflowItem({ workflow, onApply, id }: WorkflowItemProps) {
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFileContent = async () => {
      setIsLoading(true);
      try {
        const content = await readFile(workflow.filePath, "utf-8");
        setFileContent(content);
      } catch (err) {
        console.error("Error loading file:", err);
        setFileContent("Error loading file content");
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [workflow.filePath]);

  const handleApply = async () => {
    await onApply(workflow.name);
  };

  const handleValidate = async () => {
    try {
      const isValid = await validateWorkflow(workflow.name);
      if (isValid) {
        // You could show a toast here if needed
      }
    } catch (_error) {
      // Handle validation error
    }
  };

  const getWorkflowIcon = (_workflow: Workflow) => {
    // Use bullet point icon for all workflows
    return Icon.Bolt;
  };

  const getWorkflowSubtitle = (workflow: Workflow) => {
    return workflow.fileExtension.toUpperCase();
  };

  const formatModifiedDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const markdownContent = `# ${workflow.name}

${workflow.description || "No description available"}

**File:** ${workflow.filePath}

**Modified:** ${workflow.lastModified ? formatModifiedDate(workflow.lastModified) : "Unknown"}

\`\`\`${workflow.fileExtension.startsWith(".") ? workflow.fileExtension.substring(1) : workflow.fileExtension}
${fileContent}
\`\`\``;

  return (
    <List.Item
      id={id || workflow.name}
      title={workflow.name}
      subtitle={getWorkflowSubtitle(workflow)}
      icon={getWorkflowIcon(workflow)}
      keywords={[workflow.name, workflow.description || "", workflow.fileExtension]}
      detail={<List.Item.Detail isLoading={isLoading} markdown={markdownContent} />}
      actions={
        <ActionPanel>
          <Action
            title="Apply Workflow"
            icon={Icon.Play}
            onAction={handleApply}
            shortcut={{ modifiers: ["cmd"], key: "enter" }}
          />
          <Action
            title="Validate Workflow"
            icon={Icon.CheckCircle}
            onAction={handleValidate}
            shortcut={{ modifiers: ["cmd"], key: "v" }}
          />
          <Action.CopyToClipboard
            title="Copy Workflow Name"
            content={workflow.name}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          <Action
            title="Show in Finder"
            icon={Icon.Finder}
            onAction={() => {
              // This would need to be implemented with a proper file system action
              console.log("Show in Finder:", workflow.filePath);
            }}
            shortcut={{ modifiers: ["cmd"], key: "f" }}
          />
        </ActionPanel>
      }
    />
  );
}
