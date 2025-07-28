import { MapPin } from "lucide-react";
import DashboardWidget from "./DashboardWidget";
import Image from 'next/image';

type MapViewProps = {
  destination: string;
};

export default function MapView({ destination }: MapViewProps) {
  return (
    <DashboardWidget icon={MapPin} title="Navigation">
        <div className="flex flex-col h-full">
            <div className="relative w-full aspect-[16/10] rounded-md overflow-hidden mb-2">
                <Image src="https://placehold.co/600x400.png" alt="Map view" layout="fill" objectFit="cover" data-ai-hint="map satellite" />
            </div>
            <div className="text-center">
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-semibold truncate">{destination}</p>
            </div>
        </div>
    </DashboardWidget>
  );
}
