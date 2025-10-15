// ~/components/CustomizeAvatar.tsx
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Palette,
  Download,
  RotateCcw,
  Sparkles,
  Shirt,
  Eye,
  Scissors,
  Circle,
} from "lucide-react";

// Avatar customization options (move these from dashboard)
const skinTones = [
  "#FFDBAC",
  "#F5D0A9",
  "#E8BE99",
  "#D8AE8F",
  "#C99789",
  "#BA866A",
  "#AB7856",
  "#9D6B45",
  "#8E5E3A",
  "#7F512E",
];

const hairStyles = [
  { id: "short", name: "Short", emoji: "💇" },
  { id: "long", name: "Long", emoji: "💁" },
  { id: "curly", name: "Curly", emoji: "👩‍🦱" },
  { id: "afro", name: "Afro", emoji: "👨‍🦱" },
  { id: "bun", name: "Bun", emoji: "👱‍♀️" },
  { id: "ponytail", name: "Ponytail", emoji: "💁‍♀️" },
  { id: "bald", name: "Bald", emoji: "👨‍🦲" },
];

const hairColors = [
  "#2C2222",
  "#3D2B1F",
  "#5D4037",
  "#6D4C41",
  "#8D6E63",
  "#A1887F",
  "#BFA69F",
  "#D7CCC8",
  "#F5D0A9",
  "#FFB74D",
  "#FF9800",
  "#F57C00",
  "#E65100",
  "#8B4513",
  "#654321",
];

const eyeColors = [
  "#2E7D32",
  "#1B5E20",
  "#004D40",
  "#00695C",
  "#00796B",
  "#00897B",
  "#009688",
  "#26A69A",
  "#4DB6AC",
  "#80CBC4",
  "#01579B",
  "#0277BD",
  "#0288D1",
  "#039BE5",
  "#03A9F4",
  "#29B6F6",
  "#4FC3F7",
  "#81D4FA",
  "#B3E5FC",
  "#E1F5FE",
  "#311B92",
  "#4527A0",
  "#512DA8",
  "#5E35B1",
  "#673AB7",
  "#7E57C2",
  "#9575CD",
  "#B39DDB",
  "#D1C4E9",
  "#EDE7F6",
];

const clothingStyles = [
  { id: "casual", name: "Casual", emoji: "👕" },
  { id: "formal", name: "Formal", emoji: "👔" },
  { id: "hoodie", name: "Hoodie", emoji: "👚" },
  { id: "suit", name: "Suit", emoji: "🤵" },
  { id: "developer", name: "Developer", emoji: "💻" },
  { id: "sports", name: "Sports", emoji: "🎽" },
];

const clothingColors = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#795548",
  "#9E9E9E",
  "#607D8B",
  "#000000",
];

const accessories = [
  { id: "none", name: "None", emoji: "❌" },
  { id: "glasses", name: "Glasses", emoji: "👓" },
  { id: "sunglasses", name: "Sunglasses", emoji: "🕶️" },
  { id: "hat", name: "Hat", emoji: "🧢" },
  { id: "headphones", name: "Headphones", emoji: "🎧" },
  { id: "earrings", name: "Earrings", emoji: "💎" },
];

interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  clothingStyle: string;
  clothingColor: string;
  accessory: string;
}

interface CustomizeAvatarProps {
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    uid?: string;
  } | null;
  onSaveAvatar: (avatarConfig: AvatarConfig) => Promise<void>;
}

export function CustomizeAvatar({ user, onSaveAvatar }: CustomizeAvatarProps) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    skinTone: skinTones[0],
    hairStyle: hairStyles[0].id,
    hairColor: hairColors[0],
    eyeColor: eyeColors[0],
    clothingStyle: clothingStyles[0].id,
    clothingColor: clothingColors[0],
    accessory: accessories[0].id,
  });

  const [activeCustomizationTab, setActiveCustomizationTab] = useState("skin");

  const handleResetAvatar = () => {
    setAvatarConfig({
      skinTone: skinTones[0],
      hairStyle: hairStyles[0].id,
      hairColor: hairColors[0],
      eyeColor: eyeColors[0],
      clothingStyle: clothingStyles[0].id,
      clothingColor: clothingColors[0],
      accessory: accessories[0].id,
    });
  };

  const handleSave = async () => {
    try {
      await onSaveAvatar(avatarConfig);
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
  };

  const updateAvatarConfig = (key: keyof AvatarConfig, value: string) => {
    setAvatarConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const generateAvatarURL = (config: AvatarConfig) => {
    const params = new URLSearchParams({
      skin: config.skinTone.replace("#", ""),
      hair: config.hairStyle,
      hairColor: config.hairColor.replace("#", ""),
      eyes: config.eyeColor.replace("#", ""),
      clothing: config.clothingStyle,
      clothingColor: config.clothingColor.replace("#", ""),
      accessory: config.accessory,
    });

    return `/api/avatar?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Design Your Unique Avatar 🎨
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create an avatar that represents you in the CodeON community
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full px-4">
        {/* Avatar Preview - Centered and responsive */}
        <div className="flex justify-center lg:block lg:flex-1 lg:max-w-sm">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-center lg:justify-start space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Avatar Preview</span>
              </CardTitle>
              <CardDescription className="text-center lg:text-left">
                This is how you'll appear to others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                {/* Avatar Display */}
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                  <div className="text-6xl">
                    {getUserInitials(user?.displayName)}
                  </div>
                </div>

                <div className="text-center">
                  <p className="font-medium text-lg">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Level 3 Developer
                  </p>
                </div>

                <div className="flex space-x-2 w-full">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={handleResetAvatar}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button className="flex-1" onClick={handleSave}>
                    <Download className="h-4 w-4 mr-2" />
                    Save Avatar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customization Options - Centered and scrollable */}
        <div className="flex-1 flex justify-center">
          <Card className="w-full max-w-4xl flex flex-col h-[600px] lg:h-auto">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-center lg:text-left">
                Customization Options
              </CardTitle>
              <CardDescription className="text-center lg:text-left">
                Mix and match to create your perfect avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-4 lg:p-6">
              {/* Centered Pill Navigation */}
              <div className="flex justify-center mb-6 flex-shrink-0">
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                  {[
                    { id: "skin", label: "Skin" },
                    { id: "hair", label: "Hair" },
                    { id: "eyes", label: "Eyes" },
                    { id: "clothing", label: "Clothing" },
                    { id: "accessories", label: "Accessories" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`px-4 py-2 rounded-full transition-all ${
                        activeCustomizationTab === tab.id
                          ? "bg-white dark:bg-gray-700 shadow-sm text-primary font-medium"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setActiveCustomizationTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Customization Content */}
              <div
                className="flex-1 overflow-y-auto pr-2 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-gray-300
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb:hover]:bg-gray-400
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-600
                dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-500"
              >
                <div className="space-y-6 pb-4">
                  {/* Skin Tab */}
                  {activeCustomizationTab === "skin" && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center">
                            <Circle className="h-3 w-3 text-orange-500" />
                          </div>
                          <h3 className="font-medium">Skin Tone</h3>
                        </div>
                        <div className="flex justify-center">
                          <div className="grid grid-cols-5 gap-3 max-w-md">
                            {skinTones.map((tone) => (
                              <button
                                key={tone}
                                className={`w-12 h-12 rounded-full border-2 transition-all ${
                                  avatarConfig.skinTone === tone
                                    ? "border-primary ring-2 ring-primary ring-opacity-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                style={{ backgroundColor: tone }}
                                onClick={() =>
                                  updateAvatarConfig("skinTone", tone)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hair Tab */}
                  {activeCustomizationTab === "hair" && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <Scissors className="h-5 w-5 text-brown-500" />
                          <h3 className="font-medium">Hair Style</h3>
                        </div>
                        <div className="flex justify-center">
                          <div className="grid grid-cols-3 gap-3 max-w-md">
                            {hairStyles.map((style) => (
                              <button
                                key={style.id}
                                className={`p-4 border rounded-lg text-center transition-all ${
                                  avatarConfig.hairStyle === style.id
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                onClick={() =>
                                  updateAvatarConfig("hairStyle", style.id)
                                }
                              >
                                <div className="text-2xl mb-2">
                                  {style.emoji}
                                </div>
                                <div className="text-sm font-medium">
                                  {style.name}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <Palette className="h-5 w-5 text-brown-500" />
                          <h3 className="font-medium">Hair Color</h3>
                        </div>
                        <div className="flex justify-center">
                          <div className="grid grid-cols-5 gap-3 max-w-md">
                            {hairColors.map((color) => (
                              <button
                                key={color}
                                className={`w-12 h-12 rounded-full border-2 transition-all ${
                                  avatarConfig.hairColor === color
                                    ? "border-primary ring-2 ring-primary ring-opacity-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() =>
                                  updateAvatarConfig("hairColor", color)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Eyes Tab */}
                  {activeCustomizationTab === "eyes" && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <Eye className="h-5 w-5 text-blue-500" />
                          <h3 className="font-medium">Eye Color</h3>
                        </div>
                        <div className="flex justify-center">
                          <div className="grid grid-cols-5 gap-3 max-w-md">
                            {eyeColors.map((color) => (
                              <button
                                key={color}
                                className={`w-12 h-12 rounded-full border-2 transition-all ${
                                  avatarConfig.eyeColor === color
                                    ? "border-primary ring-2 ring-primary ring-opacity-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() =>
                                  updateAvatarConfig("eyeColor", color)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Clothing Tab */}
                  {activeCustomizationTab === "clothing" && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <Shirt className="h-5 w-5 text-purple-500" />
                          <h3 className="font-medium">Clothing Style</h3>
                        </div>
                        <div className="flex justify-center">
                          <div className="grid grid-cols-3 gap-3 max-w-md">
                            {clothingStyles.map((style) => (
                              <button
                                key={style.id}
                                className={`p-4 border rounded-lg text-center transition-all ${
                                  avatarConfig.clothingStyle === style.id
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                onClick={() =>
                                  updateAvatarConfig("clothingStyle", style.id)
                                }
                              >
                                <div className="text-2xl mb-2">
                                  {style.emoji}
                                </div>
                                <div className="text-sm font-medium">
                                  {style.name}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <Palette className="h-5 w-5 text-purple-500" />
                          <h3 className="font-medium">Clothing Color</h3>
                        </div>
                        <div className="flex justify-center">
                          <div className="grid grid-cols-5 gap-3 max-w-md">
                            {clothingColors.map((color) => (
                              <button
                                key={color}
                                className={`w-12 h-12 rounded-full border-2 transition-all ${
                                  avatarConfig.clothingColor === color
                                    ? "border-primary ring-2 ring-primary ring-opacity-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() =>
                                  updateAvatarConfig("clothingColor", color)
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Accessories Tab */}
                  {activeCustomizationTab === "accessories" && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <Eye className="h-5 w-5 text-yellow-500" />
                          <h3 className="font-medium">Accessories</h3>
                        </div>
                        <div className="flex justify-center">
                          <div className="grid grid-cols-3 gap-3 max-w-md">
                            {accessories.map((item) => (
                              <button
                                key={item.id}
                                className={`p-4 border rounded-lg text-center transition-all ${
                                  avatarConfig.accessory === item.id
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                                onClick={() =>
                                  updateAvatarConfig("accessory", item.id)
                                }
                              >
                                <div className="text-2xl mb-2">
                                  {item.emoji}
                                </div>
                                <div className="text-sm font-medium">
                                  {item.name}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
