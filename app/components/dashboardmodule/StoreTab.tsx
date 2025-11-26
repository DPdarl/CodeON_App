import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Store,
  Snowflake,
  Heart,
  Lightbulb,
  Shirt,
  Sparkles,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";
import { cn } from "~/lib/utils";

// --- MOCK DATA ---
// TODO: Replace with real user data from Firestore
const MOCK_USER_COINS = 1200;
const MOCK_OWNED_COSMETICS = ["leather-jacket", "wizard-hat"]; // IDs of owned items
const MOCK_EQUIPPED_COSMETICS = {
  accessory: "wizard-hat",
  clothing: "leather-jacket",
};
// ---

const MOCK_POWER_UPS = [
  {
    id: "heart-refill",
    name: "Heart Refill",
    description: "Refill your hearts to keep learning.",
    icon: Heart,
    image: "/assets/icons/heart.png", // Using your image
    cost: 250,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  {
    id: "streak-freeze",
    name: "Streak Freeze",
    description: "Protect your streak for one day of inactivity.",
    icon: Snowflake,
    image: null,
    cost: 500,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    id: "hint-power",
    name: "Hint",
    description: "Get a hint on a tough challenge.",
    icon: Lightbulb,
    image: null,
    cost: 100,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
  },
];

const MOCK_COSMETICS = [
  {
    id: "wizard-hat",
    name: "Wizard Hat",
    type: "accessory",
    icon: Sparkles,
    cost: 1000,
  },
  {
    id: "leather-jacket",
    name: "Leather Jacket",
    type: "clothing",
    icon: Shirt,
    cost: 750,
  },
  {
    id: "cyber-visor",
    name: "Cyber Visor",
    type: "accessory",
    icon: Sparkles,
    cost: 1500,
  },
  {
    id: "codeon-hoodie",
    name: "CodeON Hoodie",
    type: "clothing",
    icon: Shirt,
    cost: 500,
  },
];
// --- END MOCK DATA ---

export function StoreTab() {
  const handlePurchase = (itemId: string, cost: number) => {
    // TODO: Add purchase logic here
    // 1. Check if userCoins >= cost
    // 2. Subtract coins from user's Firestore doc
    // 3. Add item ID to user's 'ownedPowerUps' or 'ownedCosmetics' array
    alert(`Purchasing item: ${itemId} for ${cost} coins`);
  };

  const handleEquip = (itemId: string, type: string) => {
    // TODO: Add equip logic here
    // 1. Update the 'equippedCosmetics' map in user's Firestore doc
    //    e.g., { ...user.equippedCosmetics, [type]: itemId }
    alert(`Equipping ${type}: ${itemId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-indigo-500" />
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              The Store
            </h1>
          </div>
          {/* User Coin Balance */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full p-2 pr-6 shadow-md flex items-center gap-3">
            <img src="/assets/icons/coin.png" alt="Coins" className="w-8 h-8" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-none">
                Your Coins
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                {MOCK_USER_COINS.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Spend your hard-earned coins on helpful items and new looks.
        </p>
      </motion.div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="powerups" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12 rounded-xl">
          <TabsTrigger value="powerups" className="h-10 rounded-lg">
            <Lightbulb className="w-4 h-4 mr-2" />
            Power-Ups
          </TabsTrigger>
          <TabsTrigger value="cosmetics" className="h-10 rounded-lg">
            <Shirt className="w-4 h-4 mr-2" />
            Cosmetics
          </TabsTrigger>
        </TabsList>

        {/* --- Power-Ups Tab --- */}
        <TabsContent value="powerups">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {MOCK_POWER_UPS.map((item) => (
              <PowerUpCard
                key={item.id}
                item={item}
                onPurchase={() => handlePurchase(item.id, item.cost)}
                userCoins={MOCK_USER_COINS}
              />
            ))}
          </motion.div>
        </TabsContent>

        {/* --- Cosmetics Tab --- */}
        <TabsContent value="cosmetics">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {MOCK_COSMETICS.map((item) => {
              const isOwned = MOCK_OWNED_COSMETICS.includes(item.id);
              // @ts-ignore
              const isEquipped = MOCK_EQUIPPED_COSMETICS[item.type] === item.id;

              return (
                <CosmeticItemCard
                  key={item.id}
                  item={item}
                  isOwned={isOwned}
                  isEquipped={isEquipped}
                  canAfford={MOCK_USER_COINS >= item.cost}
                  onPurchase={() => handlePurchase(item.id, item.cost)}
                  onEquip={() => handleEquip(item.id, item.type)}
                />
              );
            })}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Sub-component for Power-Ups ---

function PowerUpCard({
  item,
  onPurchase,
  userCoins,
}: {
  item: (typeof MOCK_POWER_UPS)[0];
  onPurchase: () => void;
  userCoins: number;
}) {
  const { icon: Icon } = item;
  const canAfford = userCoins >= item.cost;

  return (
    <Card className="bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl flex flex-col">
      <CardHeader className="flex-col items-center text-center">
        <div
          className={`w-24 h-24 rounded-3xl ${item.bgColor} flex items-center justify-center mb-4`}
        >
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-14 h-14" />
          ) : (
            <Icon className={`w-14 h-14 ${item.color}`} />
          )}
        </div>
        <CardTitle className="text-2xl font-bold">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 text-center">
        <CardDescription className="text-base">
          {item.description}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full h-14 rounded-xl text-lg font-bold"
          disabled={!canAfford}
          onClick={onPurchase}
        >
          {canAfford ? (
            <div className="flex items-center gap-2">
              <img
                src="/assets/icons/coin.png"
                alt="Coin"
                className="w-5 h-5"
              />
              <span>{item.cost.toLocaleString()}</span>
            </div>
          ) : (
            <span>Not Enough Coins</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- Sub-component for Cosmetics ---

function CosmeticItemCard({
  item,
  isOwned,
  isEquipped,
  canAfford,
  onPurchase,
  onEquip,
}: {
  item: (typeof MOCK_COSMETICS)[0];
  isOwned: boolean;
  isEquipped: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  onEquip: () => void;
}) {
  const { icon: Icon } = item;

  const renderButton = () => {
    if (isEquipped) {
      return (
        <Button
          disabled
          variant="outline"
          className="w-full h-12 rounded-xl text-lg font-bold border-green-500 text-green-500"
        >
          <Check className="w-5 h-5 mr-2" />
          Equipped
        </Button>
      );
    }
    if (isOwned) {
      return (
        <Button
          onClick={onEquip}
          className="w-full h-12 rounded-xl text-lg font-bold"
        >
          Equip
        </Button>
      );
    }
    return (
      <Button
        onClick={onPurchase}
        disabled={!canAfford}
        className="w-full h-12 rounded-xl text-lg font-bold"
      >
        {canAfford ? (
          <div className="flex items-center gap-2">
            <img src="/assets/icons/coin.png" alt="Coin" className="w-5 h-5" />
            <span>{item.cost.toLocaleString()}</span>
          </div>
        ) : (
          <span>Not Enough Coins</span>
        )}
      </Button>
    );
  };

  return (
    <Card
      className={cn(
        "bg-white dark:bg-gray-900 shadow-lg border-gray-100 dark:border-gray-800 rounded-3xl flex flex-col transition-all",
        isEquipped && "border-2 border-green-500"
      )}
    >
      <CardContent className="flex-1 flex flex-col items-center text-center p-6">
        <div
          className={cn(
            "w-full h-32 rounded-2xl flex items-center justify-center mb-4",
            isOwned
              ? "bg-indigo-50 dark:bg-indigo-950/30"
              : "bg-gray-100 dark:bg-gray-800/50"
          )}
        >
          <Icon
            className={cn(
              "w-20 h-20",
              isOwned ? "text-indigo-500" : "text-gray-400 dark:text-gray-600"
            )}
          />
        </div>
        <CardTitle className="text-xl font-bold">{item.name}</CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0">{renderButton()}</CardFooter>
    </Card>
  );
}
