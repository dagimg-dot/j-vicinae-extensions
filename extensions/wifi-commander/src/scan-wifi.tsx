import { Action, ActionPanel, Color, Icon, List, showToast, useNavigation } from "@vicinae/api";
import { useEffect, useState } from "react";
import ConnectForm from "./components/ConnectForm";
import { executeNmcliCommand, executeNmcliCommandSilent } from "./utils/execute";

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

interface SavedNetwork {
  name: string;
  uuid: string;
}

interface WifiDevice {
  name: string;
  type: string;
  state: string;
  connection: string;
}

function parseWifiList(output: string): WifiNetwork[] {
  const lines = output.split("\n").filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  return lines
    .slice(1)
    .map((line) => {
      // Check if the line starts with * (connected network)
      const startsWithAsterisk = line.trim().startsWith("*");
      const cleanLine = startsWithAsterisk ? line.trim().substring(1).trim() : line.trim();

      // Split by multiple spaces to handle the fixed-width format
      const parts = cleanLine.split(/\s{2,}/);

      if (parts.length < 8) return null;

      // Extract fields based on their known positions
      // Format: BSSID SSID MODE CHAN RATE SIGNAL BARS SECURITY
      const bssid = parts[0] || "";
      const ssid = parts[1] || "";
      const mode = parts[2] || "";
      const channel = parseInt(parts[3] || "0", 10);
      const rate = parts[4] || "";
      const signal = parseInt(parts[5] || "0", 10);
      const bars = parts[6] || "";
      const security = parts[7] || "";

      return {
        inUse: startsWithAsterisk,
        bssid,
        ssid,
        mode,
        channel,
        rate,
        signal,
        bars,
        security,
      };
    })
    .filter(Boolean) as WifiNetwork[];
}

export default function ScanWifi() {
  const { push } = useNavigation();
  const [scanResult, setScanResult] = useState<ScanResult>({
    networks: [],
    isLoading: true,
    error: null,
  });
  const [savedNetworks, setSavedNetworks] = useState<SavedNetwork[]>([]);
  const [wifiDevice, setWifiDevice] = useState<WifiDevice | null>(null);

  const loadWifiDevice = async () => {
    try {
      const result = await executeNmcliCommandSilent("device status");
      if (result.success) {
        const lines = result.stdout.split("\n").filter((line) => line.trim());
        const wifiDeviceLine = lines.find((line) => line.includes("wifi"));
        if (wifiDeviceLine) {
          const parts = wifiDeviceLine.split(/\s{2,}/);
          if (parts.length >= 4) {
            setWifiDevice({
              name: parts[0] || "",
              type: parts[1] || "",
              state: parts[2] || "",
              connection: parts[3] || "",
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load Wi-Fi device:", error);
    }
  };

  const loadSavedNetworks = async () => {
    try {
      const result = await executeNmcliCommandSilent("connection show");
      if (result.success) {
        const lines = result.stdout.split("\n").filter((line) => line.trim());
        const networks = lines
          .slice(1)
          .map((line) => {
            const parts = line.split(/\s{2,}/);
            if (parts.length < 2) return null;
            return {
              name: parts[0] || "",
              uuid: parts[1] || "",
            };
          })
          .filter(Boolean) as SavedNetwork[];
        setSavedNetworks(networks);
      }
    } catch (error) {
      console.error("Failed to load saved networks:", error);
    }
  };

  const scanWifi = async () => {
    try {
      setScanResult((prev) => ({ ...prev, isLoading: true, error: null }));

      const result = await executeNmcliCommandSilent("device wifi list --rescan yes");

      if (!result.success) {
        setScanResult((prev) => ({
          ...prev,
          isLoading: false,
          error: result.error || "Failed to scan wifi networks",
        }));
        return;
      }

      const networks = parseWifiList(result.stdout);

      // Sort networks to show connected one first
      const sortedNetworks = networks.sort((a, b) => {
        if (a.inUse && !b.inUse) return -1;
        if (!a.inUse && b.inUse) return 1;
        return 0;
      });

      setScanResult({
        networks: sortedNetworks,
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

  const handleConnect = async (ssid: string, security: string) => {
    // Check if this network is already saved
    const isSaved = savedNetworks.some((network) => network.name === ssid);

    // If the network is not secure, connect directly
    if (!security || security.toLowerCase() === "open") {
      await showToast({
        title: "Connecting...",
        message: `Attempting to connect to open network ${ssid}`,
      });
      const result = await executeNmcliCommand("device wifi connect", [ssid]);
      if (result.success) {
        await showToast({
          title: "Connection Successful",
          message: `Successfully connected to ${ssid}`,
        });
        scanWifi(); // Refresh the list to show connected status
      } else {
        await showToast({
          title: "Connection Failed",
          message: result.error || `Could not connect to ${ssid}`,
        });
      }
    } else if (isSaved) {
      // If the network is saved, connect using the saved connection
      await showToast({
        title: "Connecting...",
        message: `Connecting to saved network ${ssid}`,
      });
      const result = await executeNmcliCommand("connection up", [ssid]);
      if (result.success) {
        await showToast({
          title: "Connection Successful",
          message: `Successfully connected to ${ssid}`,
        });
        scanWifi(); // Refresh the list to show connected status
      } else {
        await showToast({
          title: "Connection Failed",
          message: result.error || `Could not connect to ${ssid}`,
        });
      }
    } else {
      // If the network is secure and not saved, push the password form
      push(<ConnectForm ssid={ssid} />);
    }
  };

  const handleDisconnect = async () => {
    if (!wifiDevice) {
      await showToast({
        title: "Disconnect Failed",
        message: "No Wi-Fi device found",
      });
      return;
    }

    await showToast({
      title: "Disconnecting...",
      message: "Disconnecting from current network",
    });

    const result = await executeNmcliCommand("device disconnect", [wifiDevice.name]);

    if (result.success) {
      await showToast({
        title: "Disconnected",
        message: "Successfully disconnected from current network",
      });
      loadWifiDevice(); // Refresh device status
      scanWifi(); // Refresh the list to update connection status
    } else {
      await showToast({
        title: "Disconnect Failed",
        message: result.error || "Could not disconnect from current network",
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
    loadWifiDevice();
    loadSavedNetworks();
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
            key={`${network.bssid}-${network.ssid || "hidden"}`}
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
                {network.inUse ? (
                  <Action
                    title="Disconnect"
                    icon={Icon.XMarkCircle}
                    onAction={handleDisconnect}
                    shortcut={{ modifiers: ["cmd"], key: "d" }}
                  />
                ) : (
                  <Action
                    title="Connect"
                    icon={Icon.Wifi}
                    onAction={() => handleConnect(network.ssid, network.security)}
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
