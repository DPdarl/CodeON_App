import { ShieldAlert, UserPlus, Lock } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function AdminManagementTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400 flex items-center gap-2">
            <ShieldAlert className="h-8 w-8" /> Admin Console
          </h1>
          <p className="text-muted-foreground">
            Restricted access area for platform administration.
          </p>
        </div>
        <Button variant="destructive" className="gap-2">
          <UserPlus className="h-4 w-4" /> Create Admin
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Security Logs
            </CardTitle>
            <CardDescription>
              View recent system access attempts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-20 bg-background/50 rounded flex items-center justify-center text-xs text-muted-foreground">
              No recent alerts
            </div>
          </CardContent>
        </Card>
        {/* Add more admin cards here */}
      </div>
    </div>
  );
}
