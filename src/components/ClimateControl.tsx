import { Thermometer, Minus, Plus } from "lucide-react";
import DashboardWidget from "./DashboardWidget";
import { Button } from "./ui/button";

type ClimateControlProps = {
  temperature: number;
  setTemperature: (temp: number) => void;
};

export default function ClimateControl({ temperature, setTemperature }: ClimateControlProps) {
  return (
    <DashboardWidget icon={Thermometer} title="Climate Control">
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setTemperature(temperature - 1)}>
          <Minus className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <p className="text-4xl font-bold tracking-tighter">{temperature}°C</p>
          <p className="text-xs text-muted-foreground">Cabin Temp</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setTemperature(temperature + 1)}>
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </DashboardWidget>
  );
}
