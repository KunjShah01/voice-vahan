import { Gauge, Fuel } from "lucide-react";
import DashboardWidget from "./DashboardWidget";

type VehicleStatusProps = {
  speed: number;
  fuel: number;
};

export default function VehicleStatus({ speed, fuel }: VehicleStatusProps) {
  return (
    <DashboardWidget icon={Gauge} title="Vehicle Status">
      <div className="flex flex-col justify-around h-full gap-4">
        <div className="flex items-center gap-4">
            <Gauge className="w-8 h-8 text-primary" />
            <div>
                <p className="text-xs text-muted-foreground">Speed</p>
                <p className="text-2xl font-bold">{speed} km/h</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Fuel className="w-8 h-8 text-primary" />
            <div>
                <p className="text-xs text-muted-foreground">Fuel Level</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{fuel}%</p>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${fuel}%` }} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardWidget>
  );
}
