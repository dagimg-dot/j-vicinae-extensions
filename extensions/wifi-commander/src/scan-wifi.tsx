import { Action, ActionPanel, Color, Icon, List, showToast } from "@vicinae/api";
import { useEffect, useState } from "react";
import { executeNmcliCommandSilent } from "./utils/execute";

interface WifiNetwork {
  inUse: boolean;
  ssid: string;
  bssid: string;
  mode: string;
  channel: number;
  rate: string;
  signal: number;
  bars: string;
  security: string;
}

interface ScanResult {
  networks: WifiNetwork[];
  isLoading: boolean;
  error: string | null;
}

function parseWifiList(output: string): WifiNetwork[] {
  const lines = output.split("\n").filter((line) => line.trim());
  const headers = lines[0]?.split(/\s{2,}/) || [];

  if (headers.length < 8) {
    return [];
  }

  return lines
    .slice(1)
    .map((line) => {
      const parts = line.split(/\s{2,}/);
      if (parts.length < 8) return null;

      // Check if the line starts with * (connected network)
      const startsWithAsterisk = line.trim().startsWith("*");
      const adjustedParts = startsWithAsterisk ? parts.slice(1) : parts;

      return {
        inUse: startsWithAsterisk,
        bssid: adjustedParts[0] || "",
        ssid: adjustedParts[1] || "",
        mode: adjustedParts[2] || "",
        channel: parseInt(adjustedParts[3] || "0", 10),
        rate: adjustedParts[4] || "",
        signal: parseInt(adjustedParts[5] || "0", 10),
        bars: adjustedParts[6] || "",
        security: adjustedParts[7] || "",
      };
    })
    .filter(Boolean) as WifiNetwork[];
}

export default function ScanWifi() {
  const [scanResult, setScanResult] = useState<ScanResult>({
    networks: [],
    isLoading: true,
    error: null,
  });

  const scanWifi = async () => {
    try {
      setScanResult((prev) => ({ ...prev, isLoading: true, error: null }));

      const result = await executeNmcliCommandSilent("device wifi list");

      if (!result.success) {
        setScanResult((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || "Failed to scan wifi networks",
        }));
        return;
      }

      const networks = parseWifiList(result.stdout);

      setScanResult({
        networks,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setScanResult({
        networks: [],
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  const handleConnect = async (ssid: string) => {
    try {
      await showToast({
        title: "Connect to Network",
        message: `Connecting to "${ssid}"... (password required)`,
      });
      // Note: This would need password input - for now just show message
      // In a full implementation, you'd want to prompt for password
    } catch (_error) {
      await showToast({
        title: "Error",
        message: "Failed to initiate connection",
      });
    }
  };

  const getSignalIcon = (signal: number) => {
    if (signal >= 75) return Icon.Wifi;
    if (signal >= 50) return Icon.Wifi;
    if (signal >= 25) return Icon.Wifi;
    return Icon.Wifi;
  };

  const getSecurityIcon = (security: string) => {
    if (security.includes("WPA2")) return Icon.Lock;
    if (security.includes("WPA1")) return Icon.Lock;
    if (security.includes("WEP")) return Icon.Lock;
    return Icon.LockUnlocked;
  };

  useEffect(() => {
    scanWifi();
  }, []);

  if (scanResult.isLoading) {
    return (
      <List searchBarPlaceholder="Scanning wifi networks...">
        <List.EmptyView
          title="Scanning Networks"
          description="Please wait while we scan for available wifi networks..."
          icon={Icon.Clock}
        />
      </List>
    );
  }

  if (scanResult.error) {
    return (
      <List searchBarPlaceholder="Search wifi networks...">
        <List.EmptyView
          title="Scan Failed"
          description={scanResult.error}
          icon={Icon.ExclamationMark}
          actions={
            <ActionPanel>
              <Action title="Retry Scan" icon={Icon.ArrowClockwise} onAction={scanWifi} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  if (scanResult.networks.length === 0) {
    return (
      <List searchBarPlaceholder="Search wifi networks...">
        <List.EmptyView
          title="No Networks Found"
          description="No wifi networks were found. Make sure wifi is enabled."
          icon={Icon.Wifi}
          actions={
            <ActionPanel>
              <Action title="Refresh" icon={Icon.ArrowClockwise} onAction={scanWifi} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List searchBarPlaceholder="Search wifi networks..." isShowingDetail={true}>
      <List.Section title={`Available Networks (${scanResult.networks.length})`}>
        {scanResult.networks.map((network) => (
          <List.Item
            key={network.bssid}
            title={network.ssid || "Hidden Network"}
            subtitle={`${network.signal}% signal • ${network.security}`}
            icon={network.inUse ? Icon.CheckCircle : getSignalIcon(network.signal)}
            accessories={[
              {
                text: network.inUse ? "Connected" : `${network.rate}`,
              },
              {
                icon: getSecurityIcon(network.security),
                tooltip: network.security,
              },
            ]}
            detail={
              <List.Item.Detail
                markdown={`# ${network.ssid || "Hidden Network"}`}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                      title="Signal Strength"
                      text={`${network.signal}%`}
                    />
                    <List.Item.Detail.Metadata.Label title="Rate" text={network.rate} />
                    <List.Item.Detail.Metadata.Label title="Security" text={network.security} />
                    <List.Item.Detail.Metadata.Label title="Channel" text={`${network.channel}`} />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label title="BSSID" text={network.bssid} />
                    <List.Item.Detail.Metadata.Label title="Mode" text={network.mode} />
                    {network.inUse && (
                      <>
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label
                          title="Status"
                          text="Connected"
                          icon={{ source: Icon.CheckCircle, tintColor: Color.Green }}
                        />
                      </>
                    )}
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                {!network.inUse && (
                  <Action
                    title="Connect"
                    icon={Icon.Wifi}
                    onAction={() => handleConnect(network.ssid)}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                )}
                <Action.CopyToClipboard
                  title="Copy SSID"
                  content={network.ssid}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
                <Action.CopyToClipboard
                  title="Copy BSSID"
                  content={network.bssid}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                />
                <Action
                  title="Refresh"
                  icon={Icon.ArrowClockwise}
                  onAction={scanWifi}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
