import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type DashboardWidgetProps = {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function DashboardWidget({ icon: Icon, title, children, className }: DashboardWidgetProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        {children}
      </CardContent>
    </Card>
  );
}
