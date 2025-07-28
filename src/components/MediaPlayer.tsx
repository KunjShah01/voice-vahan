import { Music } from "lucide-react";
import DashboardWidget from "./DashboardWidget";

type MediaPlayerProps = {
  status: 'playing' | 'paused';
  song: string;
};

export default function MediaPlayer({ status, song }: MediaPlayerProps) {
  return (
    <DashboardWidget icon={Music} title="Media Player">
      <div className="flex flex-col items-center justify-center h-full text-center aspect-video">
        <iframe
          className="w-full h-full rounded-md"
          src="https://www.youtube.com/embed/KzBa4ZKTVjE"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </DashboardWidget>
  );
}
