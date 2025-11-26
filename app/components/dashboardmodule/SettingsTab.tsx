// app/components/dashboardmodule/SettingsTab.tsx
import { useAuth } from "~/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Moon, Sun, Monitor, Volume2, Eye, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export function SettingsTab() {
  const { user, updateProfile } = useAuth();

  // Local state for immediate UI feedback
  const [settings, setSettings] = useState({
    theme: user?.settings?.theme || "system",
    reduceMotion: user?.settings?.reduceMotion || false,
    highContrast: user?.settings?.highContrast || false,
    soundEnabled: user?.settings?.soundEnabled ?? true,
  });

  // Sync with user data when it loads
  useEffect(() => {
    if (user?.settings) {
      setSettings({
        theme: user.settings.theme || "system",
        reduceMotion: user.settings.reduceMotion || false,
        highContrast: user.settings.highContrast || false,
        soundEnabled: user.settings.soundEnabled ?? true,
      });
    }
  }, [user]);

  // Handle saving to database
  const handleSettingChange = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings); // Update UI immediately

    // Apply theme immediately
    if (key === "theme") {
      if (value === "dark") document.documentElement.classList.add("dark");
      else if (value === "light")
        document.documentElement.classList.remove("dark");
      else {
        // System
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }

    try {
      // Save to Firestore
      await updateProfile({
        settings: newSettings,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>

      {/* Accessibility Card */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Accessibility
          </CardTitle>
          <CardDescription>Customize your experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations for a simpler experience.
              </p>
            </div>
            <Switch
              checked={settings.reduceMotion}
              onCheckedChange={(checked) =>
                handleSettingChange("reduceMotion", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility.
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) =>
                handleSettingChange("highContrast", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Play sounds when completing tasks.
              </p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) =>
                handleSettingChange("soundEnabled", checked)
              }
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base">Theme</Label>
            <div className="grid grid-cols-3 gap-4">
              <ThemeButton
                active={settings.theme === "light"}
                onClick={() => handleSettingChange("theme", "light")}
                icon={Sun}
                label="Light"
              />
              <ThemeButton
                active={settings.theme === "dark"}
                onClick={() => handleSettingChange("theme", "dark")}
                icon={Moon}
                label="Dark"
              />
              <ThemeButton
                active={settings.theme === "system"}
                onClick={() => handleSettingChange("theme", "system")}
                icon={Monitor}
                label="System"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ThemeButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
        active
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
          : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}
