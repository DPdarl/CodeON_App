import { UserCog, Plus, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function InstructorManagementTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Instructor Management
          </h1>
          <p className="text-muted-foreground">
            Oversee instructors and course assignments.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Instructor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search instructors..." className="pl-8" />
            </div>
          </div>
          <div className="rounded-md border p-8 text-center text-muted-foreground bg-muted/20">
            <UserCog className="mx-auto h-10 w-10 opacity-20 mb-2" />
            <p>Instructor records will be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
