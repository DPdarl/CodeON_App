// app/types/challenge.types.ts
export interface Challenge {
  category: (language: any) => unknown;
  language(language: any): unknown;
  id: string;
  title: string;
  description: string;
  page: number;
  starterCode: string;
  hint: string;
  solution: string;
  requiredVersion?: string; // Optional

  difficulty: "Easy" | "Medium" | "Hard";
  xp: number;
}
