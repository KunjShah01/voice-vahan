import { Lightbulb, Utensils, Coffee, Fuel } from "lucide-react";
import type { SmartSuggestionsOutput } from "@/ai/flows/smart-contextual-suggestions";
import DashboardWidget from "./DashboardWidget";
import { Button } from "./ui/button";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

type SuggestionsProps = {
  suggestions: SmartSuggestionsOutput['suggestions'];
  onBookNow: (name: string, type: string) => void;
};

const suggestionIcons = {
  'restaurant': Utensils,
  'coffee shop': Coffee,
  'gas station': Fuel,
  'default': Lightbulb
};

export default function Suggestions({ suggestions, onBookNow }: SuggestionsProps) {
  return (
    <DashboardWidget icon={Lightbulb} title="Smart Suggestions">
      {suggestions.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No suggestions right now.</p>
        </div>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex space-x-4 pb-4">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestionIcons[suggestion.type as keyof typeof suggestionIcons] || suggestionIcons.default;
              return (
                <div key={index} className="flex-shrink-0 w-64">
                    <div className="border rounded-lg p-4 h-full flex flex-col justify-between bg-card/50">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Icon className="w-5 h-5 text-primary" />
                                <h4 className="font-semibold truncate">{suggestion.name}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                        </div>
                        <Button className="w-full mt-4" size="sm" onClick={() => onBookNow(suggestion.name, suggestion.type)}>
                           {suggestion.type === 'gas station' ? 'Navigate' : 'Book Now'}
                        </Button>
                    </div>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </DashboardWidget>
  );
}
