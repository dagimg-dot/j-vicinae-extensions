import { Action, ActionPanel, closeMainWindow, Icon, List, showToast } from "@vicinae/api";
import { useEffect, useState } from "react";
import { WorkflowItem } from "./components/WorkflowItem";
import type { Workflow } from "./types/workflow";
import { applyWorkflow, checkFlowwSetup, getWorkflows } from "./utils/floww-cli";

export default function FlowwWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupStatus, setSetupStatus] = useState<{
    installed: boolean;
    configExists: boolean;
    workflowsExist: boolean;
  } | null>(null);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const status = await checkFlowwSetup();
      setSetupStatus(status);

      if (!status.installed) {
        setError("Floww CLI is not installed. Please install it first.");
        return;
      }

      if (!status.configExists) {
        setError("Floww configuration not found. Please run 'floww init' first.");
        return;
      }

      if (!status.workflowsExist) {
        setError("No workflows directory found. Please run 'floww init' first.");
        return;
      }

      const workflowsList = await getWorkflows();
      setWorkflows(workflowsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflows");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyWorkflow = async (workflowName: string) => {
    try {
      await showToast({
        title: `Applying workflow: ${workflowName}`,
        message: "Launching workflow...",
      });

      await applyWorkflow(workflowName);
      await closeMainWindow();
    } catch (_err) {
      // Error is already handled in applyWorkflow function
    }
  };

  const handleRefresh = () => {
    loadWorkflows();
  };

  const handleInitFloww = async () => {
    try {
      // This would require implementing a command execution utility
      await showToast({
        title: "Please run 'floww init' in terminal",
        message: "Initialize Floww configuration first",
      });
    } catch (_err) {
      // Handle error
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  if (isLoading) {
    return (
      <List searchBarPlaceholder="Loading workflows...">
        <List.EmptyView
          title="Loading Workflows"
          description="Please wait while we load your workflows..."
          icon={Icon.Clock}
        />
      </List>
    );
  }

  if (error) {
    return (
      <List searchBarPlaceholder="Search workflows...">
        <List.EmptyView
          title="Error Loading Workflows"
          description={error}
          icon={Icon.ExclamationMark}
          actions={
            <ActionPanel>
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={handleRefresh} />
              {setupStatus && !setupStatus.installed && (
                <Action
                  title="Install Floww CLI"
                  icon={Icon.Download}
                  onAction={() => showToast({ title: "Please install Floww CLI first" })}
                />
              )}
              {setupStatus && !setupStatus.configExists && (
                <Action title="Initialize Floww" icon={Icon.Gear} onAction={handleInitFloww} />
              )}
            </ActionPanel>
          }
        />
      </List>
    );
  }

  if (workflows.length === 0) {
    return (
      <List searchBarPlaceholder="Search workflows...">
        <List.EmptyView
          title="No Workflows Found"
          description="Create some workflows using 'floww add' command"
          icon={Icon.Plus}
          actions={
            <ActionPanel>
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={handleRefresh} />
              <Action
                title="Add Workflow"
                icon={Icon.Plus}
                onAction={() => showToast({ title: "Use 'floww add' to create workflows" })}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List searchBarPlaceholder="Search workflows..." isShowingDetail={true}>
      <List.Section title={`Workflows (${workflows.length})`}>
        {workflows.map((workflow) => (
          <WorkflowItem
            key={workflow.name}
            workflow={workflow}
            onApply={handleApplyWorkflow}
            id={workflow.name}
          />
        ))}
      </List.Section>
    </List>
  );
}
