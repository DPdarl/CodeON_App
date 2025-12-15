import { FileText, Download, BarChart3 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function UserReportsTab() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground">
            Generate and view platform usage analytics.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" /> User Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
            <span className="text-muted-foreground text-sm">
              Chart Placeholder
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" /> Activity Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
            <span className="text-muted-foreground text-sm">
              Log Table Placeholder
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
