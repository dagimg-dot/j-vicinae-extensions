import { Action, ActionPanel, closeMainWindow, Icon, List, showToast } from "@vicinae/api";
import { useMemo, useState } from "react";
import { launchGnomePanel } from "./utils/gnome-launcher";
import { gnomePanels } from "./utils/panels-data";

export default function GnomeSettingsList() {
  const [searchText, setSearchText] = useState("");

  const filterPanels = (query: string) => {
    return gnomePanels.filter(
      (panel) =>
        panel.name.toLowerCase().includes(query.toLowerCase()) ||
        panel.description.toLowerCase().includes(query.toLowerCase()) ||
        panel.keywords.some((keyword) => keyword.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const filteredPanels = useMemo(() => filterPanels(searchText), [searchText]);

  const openPanel = async (panelName: string) => {
    try {
      await showToast({
        title: `Opening ${panelName} panel...`,
        message: `Launching GNOME Control Center`,
      });

      await launchGnomePanel(panelName);
      await closeMainWindow();
    } catch (error) {
      await showToast({
        title: "Error",
        message: `Failed to open ${panelName} panel: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  return (
    <List
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search GNOME settings panels..."
    >
      <List.Section title="Available GNOME Settings Panels">
        {filteredPanels.map((panel) => (
          <List.Item
            key={panel.name}
            title={panel.displayName}
            subtitle={panel.description}
            icon={panel.icon}
            keywords={panel.keywords}
            actions={
              <ActionPanel>
                <Action
                  title="Open Panel"
                  icon={Icon.Gear}
                  onAction={() => openPanel(panel.name)}
                />
                <Action.CopyToClipboard title="Copy Panel Name" content={panel.name} />
                <Action.CopyToClipboard
                  title="Copy Command"
                  content={`gnome-control-center ${panel.name}`}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
