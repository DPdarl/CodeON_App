// app/routes/learn-basics.tsx
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Link } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";

export default function LearnBasicsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Button asChild variant="outline" className="mb-6">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Learn Basics</CardTitle>
            <CardDescription>
              A quiz-like game for the fundamentals of C#.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">
              Here's where your quiz component will go.
            </h3>
            {/* TODO: Add quiz game component */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
