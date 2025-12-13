// app/types/lesson.types.ts

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
  xp_reward: number;
  // We can treat these as the "challenge" props for compatibility
  difficulty?: "Easy" | "Medium" | "Hard";
  language?: string;
}

export interface UserLessonProgress {
  lesson_id: string;
  status: "LOCKED" | "COMPLETED";
}
