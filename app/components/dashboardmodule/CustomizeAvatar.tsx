// app/components/dashboardmodule/CustomizeAvatar.tsx
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { Wand2, User, Shirt, Smile, Footprints, Glasses } from "lucide-react";
import { motion } from "framer-motion";
import { AvatarDisplay } from "./AvatarDisplay";

// ... (options arrays remain the same as previous correct version) ...
const options = {
  body: ["male", "female"],
  hair: [
    "none",
    "default",
    "HairDefaultM1",
    "HairStyleM2",
    "HairStyleM3",
    "HairDefaultF2",
    "HairStyleF1",
    "HairStyleF3",
  ],
  eyes: [
    "normal",
    "angry",
    "disgust",
    "eepy",
    "nonchalant",
    "shock",
    "sideeye",
  ],
  mouth: ["smile", "small", "sad", "kissy", "cat", "nonchalant"],
  top: [
    "none",
    "tshirt",
    "tshirtf",
    "sando",
    "sandof",
    "sweater",
    "sweaterf",
    "leatherjacket",
    "leatherjacketf",
  ],
  bottom: ["none", "pants", "short", "skirt"],
  shoes: ["none", "shoes", "shoesf", "boots", "slides", "fp"],
  accessory: [
    "none",
    "glassesfull",
    "glassesround",
    "glassessquare",
    "semisquaredglasses",
    "bowtie",
    "scarf1",
    "scarf2",
    "scarf3",
  ],
};

const defaultConfig = {
  body: "male",
  hair: "default",
  eyes: "normal",
  mouth: "smile",
  top: "tshirt",
  bottom: "pants",
  shoes: "shoes",
  accessory: "none",
};

interface CustomizeAvatarProps {
  initialConfig?: any;
  onSave: (config: any) => Promise<void>;
  user?: any;
  // ▼▼▼ FIX: Added saveLabel to interface ▼▼▼
  saveLabel?: string;
}

export function CustomizeAvatar({
  initialConfig,
  onSave,
  saveLabel = "Save Avatar",
}: CustomizeAvatarProps) {
  const [avatarConfig, setAvatarConfig] = useState({
    ...defaultConfig,
    ...initialConfig,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setAvatarConfig((prev: any) => ({ ...prev, ...initialConfig }));
    }
  }, [initialConfig]);

  const setConfigValue = (key: string, value: string) => {
    setAvatarConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    await onSave(avatarConfig);
    setIsLoading(false);
  };

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Wand2 className="w-6 h-6" />
          Customize Your Look
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* --- Left Column: Sticky Preview --- */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="lg:sticky lg:top-28 flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className="w-full h-[600px] rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-inner relative">
                <AvatarDisplay config={avatarConfig} />
              </div>
            </div>
          </motion.div>

          {/* --- Right Column: Options --- */}
          <motion.div
            className="lg:col-span-2 space-y-6 h-[600px] overflow-y-auto pr-2 custom-scrollbar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Body Type */}
            <OptionCard title="Body Type" icon={User}>
              <div className="grid grid-cols-2 gap-3">
                {options.body.map((item) => (
                  <ItemSwatch
                    key={item}
                    label={item}
                    isSelected={avatarConfig.body === item}
                    onClick={() => setConfigValue("body", item)}
                  />
                ))}
              </div>
            </OptionCard>

            {/* Hair */}
            <OptionCard title="Hair" icon={User}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {options.hair.map((item) => (
                  <ItemSwatch
                    key={item}
                    label={item}
                    isSelected={avatarConfig.hair === item}
                    onClick={() => setConfigValue("hair", item)}
                  />
                ))}
              </div>
            </OptionCard>

            {/* Face */}
            <OptionCard title="Face" icon={Smile}>
              <Label className="mb-2 block text-xs uppercase text-muted-foreground">
                Eyes
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 mb-4">
                {options.eyes.map((item) => (
                  <ItemSwatch
                    key={item}
                    label={item}
                    isSelected={avatarConfig.eyes === item}
                    onClick={() => setConfigValue("eyes", item)}
                  />
                ))}
              </div>

              <Label className="mb-2 block text-xs uppercase text-muted-foreground">
                Mouth
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {options.mouth.map((item) => (
                  <ItemSwatch
                    key={item}
                    label={item}
                    isSelected={avatarConfig.mouth === item}
                    onClick={() => setConfigValue("mouth", item)}
                  />
                ))}
              </div>
            </OptionCard>

            {/* Outfit */}
            <OptionCard title="Outfit" icon={Shirt}>
              <Label className="mb-2 block text-xs uppercase text-muted-foreground">
                Tops
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-2 gap-3 mb-4">
                {options.top.map((item) => (
                  <ItemSwatch
                    key={item}
                    label={item}
                    isSelected={avatarConfig.top === item}
                    onClick={() => setConfigValue("top", item)}
                  />
                ))}
              </div>

              <Label className="mb-2 block text-xs uppercase text-muted-foreground">
                Bottoms
              </Label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {options.bottom.map((item) => (
                  <ItemSwatch
                    key={item}
                    label={item}
                    isSelected={avatarConfig.bottom === item}
                    onClick={() => setConfigValue("bottom", item)}
                  />
                ))}
              </div>

              <Label className="mb-2 block text-xs uppercase text-muted-foreground">
                Shoes
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-2 gap-3">
                {options.shoes.map((item) => (
                  <ItemSwatch
                    key={item}
                    label={item}
                    isSelected={avatarConfig.shoes === item}
                    onClick={() => setConfigValue("shoes", item)}
                  />
                ))}
              </div>
            </OptionCard>

            {/* Accessories */}
            <OptionCard title="Accessories" icon={Glasses}>
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {options.accessory.map((item) => (
                  <ItemSwatch
                    key={item}
                    label={item}
                    isSelected={avatarConfig.accessory === item}
                    onClick={() => setConfigValue("accessory", item)}
                  />
                ))}
              </div>
            </OptionCard>

            <div className="pt-4 pb-8">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full h-12 rounded-xl font-bold text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isLoading ? "Saving..." : saveLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

function OptionCard({ title, icon: Icon, children }: any) {
  return (
    <Card className="bg-gray-50/50 dark:bg-gray-800/30 shadow-inner border-gray-200 dark:border-gray-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ItemSwatch({ label, isSelected, onClick }: any) {
  const displayLabel = label.replace(/([A-Z])/g, " $1").trim();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-12 rounded-xl border-2 shadow-sm transition-all flex items-center justify-center px-2 text-center",
        isSelected
          ? "border-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200"
          : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
      )}
      title={displayLabel}
    >
      <span className="text-[10px] font-bold uppercase tracking-tight truncate w-full">
        {displayLabel}
      </span>
    </button>
  );
}
