import { Users, GraduationCap, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function StudentManagementTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Student Management
          </h1>
          <p className="text-muted-foreground">
            Manage student accounts and academic progress.
          </p>
        </div>
        <Button className="gap-2">
          <GraduationCap className="h-4 w-4" /> Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-8" />
            </div>
          </div>
          <div className="rounded-md border p-8 text-center text-muted-foreground bg-muted/20">
            <Users className="mx-auto h-10 w-10 opacity-20 mb-2" />
            <p>Student list will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
