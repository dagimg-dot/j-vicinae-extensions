import { exec } from "node:child_process";
import { Action, ActionPanel, Grid, Icon, showToast, Toast } from "@vicinae/api";
import { useEffect, useState } from "react";
import { getAllPlayers, type PlayerInfo as PlayerInfoType } from "./utils/playerctl";

export default function PlayerInfo() {
  const [players, setPlayers] = useState<PlayerInfoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function loadPlayers() {
      try {
        const data = await getAllPlayers();
        setPlayers(data);

        // Auto-select first player if none selected
        if (data.length > 0 && !selectedPlayer) {
          setSelectedPlayer(data[0].name);
        }
      } catch (e) {
        console.error("Failed to load players", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadPlayers();
    interval = setInterval(loadPlayers, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, [selectedPlayer]);

  const handlePlayerAction = (playerName: string, action: string) => {
    exec(`playerctl --player ${playerName} ${action}`, (err, _stdout) => {
      if (err) {
        showToast(Toast.Style.Failure, `Failed to ${action} on ${playerName}`);
      } else {
        showToast(Toast.Style.Success, `${action} executed on ${playerName}`);
      }
    });
  };

  if (isLoading) {
    return (
      <Grid searchBarPlaceholder="Search players...">
        <Grid.EmptyView
          title="Loading Players"
          description="Please wait while we load your media players..."
          icon={Icon.Clock}
        />
      </Grid>
    );
  }

  if (players.length === 0) {
    return (
      <Grid searchBarPlaceholder="Search players...">
        <Grid.EmptyView
          title="No Media Players Found"
          description="Make sure a media player is running and try again"
          icon={Icon.Music}
        />
      </Grid>
    );
  }

  return (
    <Grid
      searchBarPlaceholder="Search players..."
      columns={2}
      aspectRatio="16/9"
      inset={Grid.Inset.Small}
      navigationTitle={selectedPlayer ? `Players - ${selectedPlayer}` : "Media Players"}
      onSelectionChange={setSelectedPlayer}
    >
      <Grid.Section title="Media Players" columns={2} aspectRatio="16/9" inset={Grid.Inset.Small}>
        {players.map((player) => (
          <Grid.Item
            key={player.name}
            id={player.name}
            title={player.name}
            subtitle={player.metadata?.title || player.status}
            content={player.metadata?.albumArt || Icon.Music}
            actions={
              <ActionPanel>
                <Action
                  title="Play/Pause"
                  icon={player.status === "Playing" ? Icon.Pause : Icon.Play}
                  onAction={() => handlePlayerAction(player.name, "play-pause")}
                />
                <Action
                  title="Next"
                  icon={Icon.Forward}
                  onAction={() => handlePlayerAction(player.name, "next")}
                />
                <Action
                  title="Previous"
                  icon={Icon.Rewind}
                  onAction={() => handlePlayerAction(player.name, "previous")}
                />
                <Action
                  title="Stop"
                  icon={Icon.Stop}
                  onAction={() => handlePlayerAction(player.name, "stop")}
                />
              </ActionPanel>
            }
          />
        ))}
      </Grid.Section>
    </Grid>
  );
}
