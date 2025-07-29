import { Music, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import DashboardWidget from "./DashboardWidget";
import Image from 'next/image';
import { Button } from "./ui/button";

type Song = {
  title: string;
  artist: string;
  albumArt: string;
};

type MediaPlayerProps = {
  status: 'playing' | 'paused';
  song: Song;
  onControl: (action: 'toggle' | 'next' | 'prev') => void;
};

export default function MediaPlayer({ status, song, onControl }: MediaPlayerProps) {
  return (
    <DashboardWidget icon={Music} title="Media Player">
      <div className="flex flex-col items-center justify-between h-full text-center">
        <div className="relative w-32 h-32 rounded-md overflow-hidden shadow-lg mb-4">
            <Image src={song.albumArt} alt={song.title} layout="fill" objectFit="cover" data-ai-hint="album art" />
        </div>
        <div>
            <h3 className="font-bold text-lg truncate">{song.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button variant="ghost" size="icon" onClick={() => onControl('prev')}>
            <SkipBack className="w-6 h-6" />
          </Button>
          <Button variant="default" size="icon" className="w-12 h-12" onClick={() => onControl('toggle')}>
            {status === 'playing' ? <Pause className="w-6 h-6 fill-primary-foreground" /> : <Play className="w-6 h-6 fill-primary-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onControl('next')}>
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </DashboardWidget>
  );
}
