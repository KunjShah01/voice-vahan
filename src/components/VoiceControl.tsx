import { Mic, Bot } from "lucide-react";
import DashboardWidget from "./DashboardWidget";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";

type VoiceControlProps = {
  isListening: boolean;
  isLoading: boolean;
  toggleListening: () => void;
  transcript: string;
  assistantResponse: string;
};

export default function VoiceControl({
  isListening,
  isLoading,
  toggleListening,
  transcript,
  assistantResponse,
}: VoiceControlProps) {
  const PulseIcon = () => (
    <div className="relative">
      <Mic className="relative z-10 w-8 h-8" />
      <div className="absolute inset-0 bg-primary/80 rounded-full animate-ping z-0" />
    </div>
  );

  return (
    <DashboardWidget icon={Bot} title="Voice Assistant" className="h-full">
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-grow mb-4 pr-4 -mr-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="bg-accent text-accent-foreground rounded-lg p-3 max-w-[85%]">
                <p className="text-sm">{assistantResponse}</p>
              </div>
            </div>
            {transcript && (
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[85%]">
                  <p className="text-sm">{transcript}</p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Mic className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex-shrink-0 flex justify-center items-center pt-4 border-t">
          <Button
            variant="default"
            size="icon"
            className={cn(
                "w-20 h-20 rounded-full shadow-lg transition-all duration-300",
                isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90",
                isLoading && "bg-gray-500 cursor-not-allowed"
            )}
            onClick={toggleListening}
            disabled={isLoading}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? <PulseIcon /> : <Mic className="w-8 h-8" />}
          </Button>
        </div>
      </div>
    </DashboardWidget>
  );
}
