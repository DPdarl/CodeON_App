// RENAME THIS FILE to: app/routes/api.avatar.tsx

import { LoaderFunctionArgs } from "@remix-run/node";
import { createAvatar } from "@dicebear/core";
import { bigSmile } from "@dicebear/collection";

// --- These are the *actual* valid types based on the error messages ---
const validHair: string[] = [
  "shortHair",
  "mohawk",
  "wavyBob",
  "bowlCutHair",
  "curlyBob",
  "straightHair",
  "braids",
  "shavedHead",
  "bunHair",
  "froBun",
  "bangs",
  "halfShavedHead",
  "curlyShortHair",
];

const validAccessories: string[] = [
  "glasses",
  "sunglasses",
  "catEars",
  "sailormoonCrown",
  "clownNose",
  "sleepMask",
  "faceMask",
  "mustache",
];

const validClothing: string[] = ["shirt", "hoodie", "suit", "dress"];

// Helper to map your frontend names to the library's names
const mapHair = (hairParam: string | null): string => {
  const map: { [key: string]: string } = {
    short: "shortHair",
    long: "straightHair",
    wavy: "wavyBob",
    curly: "curlyBob",
    mohawk: "mohawk",
  };
  const mappedValue = map[hairParam || "short"];
  return validHair.includes(mappedValue) ? mappedValue : "shortHair";
};

const mapAccessory = (accParam: string | null): string | undefined => {
  if (!accParam || accParam === "none") return undefined;
  if (validAccessories.includes(accParam)) return accParam;
  return undefined; // 'hat' and 'bandana' are not supported, so return undefined
};

const mapClothing = (clothingParam: string | null): string => {
  if (clothingParam === "tshirt") return "shirt";
  if (clothingParam && validClothing.includes(clothingParam))
    return clothingParam;
  return "shirt";
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  // Get params and map them to valid, safe types
  const skin = url.searchParams.get("skin") || "f2d6c4";
  const hair = mapHair(url.searchParams.get("hair"));
  const hairColor = url.searchParams.get("hairColor") || "000000";
  const clothing = mapClothing(url.searchParams.get("clothing"));
  const clothingColor = url.searchParams.get("clothingColor") || "0000ff";
  const accessories = mapAccessory(url.searchParams.get("accessory"));

  // Build the options object
  // We have to use 'any' because the DiceBear types are strict
  const options: any = {
    skinColor: [skin],
    hair: [hair],
    hairColor: [hairColor],
    clothing: [clothing],
    clothingColor: [clothingColor],
    eyes: ["normal"], // 'bigSmile' does not support eye *color*
  };

  // Only add accessories if a valid one was selected
  if (accessories) {
    options.accessories = [accessories];
    options.accessoriesProbability = 100;
  }

  // 4. Create the avatar SVG
  const svg = createAvatar(bigSmile, options).toString();

  // 5. Send the SVG back as an image
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=604800",
    },
  });
}
