import { Route } from "lucide-react";
import type { TripPlannerOutput } from "@/ai/flows/trip-planner";
import DashboardWidget from "./DashboardWidget";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

type TripPlannerProps = {
  plan: TripPlannerOutput['plan'];
};

export default function TripPlanner({ plan }: TripPlannerProps) {
  return (
    <DashboardWidget icon={Route} title="Trip Plan">
      <ScrollArea className="h-full pr-4 -mr-4">
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-2.5 top-0 h-full w-0.5 bg-border" />
          
          {plan.map((stop, index) => (
            <div key={index} className="relative pb-6">
              <div className="absolute left-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                <div className="h-2 w-2 rounded-full bg-primary-foreground" />
              </div>
              <div className="pl-2">
                <p className="font-semibold text-sm">{stop.location}</p>
                <p className="text-xs text-muted-foreground">{stop.type}</p>
                <p className="text-xs mt-1">{stop.description}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </DashboardWidget>
  );
}
