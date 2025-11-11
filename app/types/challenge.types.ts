// app/types/challenge.types.ts
export interface Challenge {
  id: string;
  title: string;
  description: string;
  page: number;
  starterCode: string;
  hint: string;
  solution: string;
  requiredVersion?: string; // Optional
}
