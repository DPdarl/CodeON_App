import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { Check, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { User as AuthUser } from "firebase/auth";

// --- Data for Avatar Options ---
const options = {
  hairStyle: ["long", "short", "wavy", "curly", "mohawk"],
  clothingStyle: ["tshirt", "hoodie", "dress", "suit"],
  accessory: ["none", "glasses", "sunglasses", "hat", "bandana"],
};

const colors = {
  skinTone: ["#f2d6c4", "#e0b8a0", "#c6906f", "#a56a49", "#8a4f33", "#603222"],
  hairColor: ["#000000", "#4a3728", "#b88662", "#f5deb3", "#d2691e", "#ff0000"],
  eyeColor: ["#000000", "#5b3a29", "#0077be", "#008000"],
  clothingColor: [
    "#ff0000",
    "#0000ff",
    "#008000",
    "#ffff00",
    "#800080",
    "#ffffff",
  ],
};

const defaultConfig = {
  skinTone: "#f2d6c4",
  hairStyle: "short",
  hairColor: "#000000",
  eyeColor: "#000000",
  clothingStyle: "tshirt",
  clothingColor: "#0000ff",
  accessory: "none",
};
// --- End Data ---

interface CustomizeAvatarProps {
  initialConfig?: any;
  onSave: (config: any) => Promise<void>;
  user: AuthUser | null;
}

export function CustomizeAvatar({
  initialConfig = defaultConfig,
  onSave,
}: CustomizeAvatarProps) {
  const [avatarConfig, setAvatarConfig] = useState({
    ...defaultConfig,
    ...initialConfig,
  });
  const [isLoading, setIsLoading] = useState(false);

  const setConfigValue = (key: string, value: string) => {
    setAvatarConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    await onSave(avatarConfig);
    setIsLoading(false);
  };

  const generateAvatarURL = (config: any) => {
    const finalConfig = { ...defaultConfig, ...config };
    const params = new URLSearchParams({
      skin: (finalConfig.skinTone || "").replace("#", ""),
      hair: finalConfig.hairStyle || "short",
      hairColor: (finalConfig.hairColor || "").replace("#", ""),
      eyes: (finalConfig.eyeColor || "").replace("#", ""),
      clothing: finalConfig.clothingStyle || "tshirt",
      clothingColor: (finalConfig.clothingColor || "").replace("#", ""),
      accessory: finalConfig.accessory || "none",
    });
    return `/api/avatar?${params.toString()}`;
  };

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Wand2 className="w-6 h-6" />
          Customize Your Avatar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* ▼▼▼ LAYOUT FIX 1: Widened the grid ▼▼▼ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* --- Left Column: Sticky Preview (Wider) --- */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="lg:sticky lg:top-28 flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              {/* ▼▼▼ LAYOUT FIX 2: Changed to tall rectangle ▼▼▼ */}
              <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-inner">
                <img
                  src={generateAvatarURL(avatarConfig)}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* ▲▲▲ END OF FIX 2 ▲▲▲ */}
            </div>
          </motion.div>

          {/* --- Right Column: Scrollable Options (Narrower) --- */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Skin Tone */}
            <OptionCard title="Skin Tone">
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
                {colors.skinTone.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    isSelected={avatarConfig.skinTone === color}
                    onClick={() => setConfigValue("skinTone", color)}
                  />
                ))}
              </div>
            </OptionCard>

            {/* Hair */}
            <OptionCard title="Hair">
              <div className="space-y-3">
                <Label className="font-semibold">Style</Label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {options.hairStyle.map((style) => (
                    <ItemSwatch
                      key={style}
                      label={style}
                      isSelected={avatarConfig.hairStyle === style}
                      onClick={() => setConfigValue("hairStyle", style)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-semibold">Color</Label>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
                  {colors.hairColor.map((color) => (
                    <ColorSwatch
                      key={color}
                      color={color}
                      isSelected={avatarConfig.hairColor === color}
                      onClick={() => setConfigValue("hairColor", color)}
                    />
                  ))}
                </div>
              </div>
            </OptionCard>

            {/* Eyes (Note: Color won't change, but we keep the UI) */}
            <OptionCard title="Eyes">
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
                {colors.eyeColor.map((color) => (
                  <ColorSwatch
                    key={color}
                    color={color}
                    isSelected={avatarConfig.eyeColor === color}
                    onClick={() => setConfigValue("eyeColor", color)}
                  />
                ))}
              </div>
            </OptionCard>

            {/* Clothing */}
            <OptionCard title="Clothing">
              <div className="space-y-3">
                <Label className="font-semibold">Style</Label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {options.clothingStyle.map((style) => (
                    <ItemSwatch
                      key={style}
                      label={style}
                      isSelected={avatarConfig.clothingStyle === style}
                      onClick={() => setConfigValue("clothingStyle", style)}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-semibold">Color</Label>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-2">
                  {colors.clothingColor.map((color) => (
                    <ColorSwatch
                      key={color}
                      color={color}
                      isSelected={avatarConfig.clothingColor === color}
                      onClick={() => setConfigValue("clothingColor", color)}
                    />
                  ))}
                </div>
              </div>
            </OptionCard>

            {/* Accessories */}
            <OptionCard title="Accessory">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {options.accessory.map((style) => (
                  <ItemSwatch
                    key={style}
                    label={style}
                    isSelected={avatarConfig.accessory === style}
                    onClick={() => setConfigValue("accessory", style)}
                  />
                ))}
              </div>
            </OptionCard>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-bold text-lg"
            >
              {isLoading ? "Saving..." : "Save Avatar"}
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Sub-components (OptionCard, ColorSwatch, ItemSwatch) ---
// (These are unchanged from the previous version)

function OptionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-gray-50/50 dark:bg-gray-800/30 shadow-inner border-gray-200 dark:border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function ColorSwatch({
  color,
  isSelected,
  onClick,
}: {
  color: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-10 h-10 rounded-full border-2 border-white/50 shadow-md transition-all flex items-center justify-center",
        isSelected ? "border-4 border-indigo-500 scale-110" : "hover:scale-110"
      )}
      style={{ backgroundColor: color }}
      aria-label={color}
    >
      {isSelected && <Check className="w-5 h-5 text-white" />}
    </button>
  );
}

function ItemSwatch({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-16 h-16 rounded-full border-2 shadow-md transition-all flex items-center justify-center p-1 text-center",
        isSelected
          ? "border-4 border-indigo-500 bg-indigo-100 dark:bg-indigo-900"
          : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100"
      )}
      title={label}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </button>
  );
}
