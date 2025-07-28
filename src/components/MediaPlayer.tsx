import { Music, Play, Pause, SkipForward, SkipBack } from "lucide-react";
import DashboardWidget from "./DashboardWidget";
import { Button } from "./ui/button";

type MediaPlayerProps = {
  status: 'playing' | 'paused';
  song: string;
};

export default function MediaPlayer({ status, song }: MediaPlayerProps) {
  return (
    <DashboardWidget icon={Music} title="Media Player">
        <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm font-semibold truncate">{song}</p>
            <p className="text-xs text-muted-foreground mb-4">A. R. Rahman, Sukhwinder Singh</p>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><SkipBack className="w-5 h-5" /></Button>
                <Button variant="primary" size="icon" className="w-12 h-12 rounded-full">
                    {status === 'playing' ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                </Button>
                <Button variant="ghost" size="icon"><SkipForward className="w-5 h-5" /></Button>
            </div>
        </div>
    </DashboardWidget>
  );
}
