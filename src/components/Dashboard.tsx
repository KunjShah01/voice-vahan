"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SmartSuggestionsOutput } from "@/ai/flows/smart-contextual-suggestions";
import { getSmartSuggestions } from "@/ai/flows/smart-contextual-suggestions";
import { multilingualVoiceProcessing } from "@/ai/flows/multilingual-voice-processing";
import { planTrip, TripPlannerOutput } from "@/ai/flows/trip-planner";
import { conversationalFlow } from "@/ai/flows/conversational-flow";
import { useToast } from "@/hooks/use-toast";
import VehicleStatus from "@/components/VehicleStatus";
import MapView from "@/components/MapView";
import ClimateControl from "@/components/ClimateControl";
import MediaPlayer from "@/components/MediaPlayer";
import VoiceControl from "@/components/VoiceControl";
import TripPlanner from "@/components/TripPlanner";
import Suggestions from "@/components/Suggestions";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";

type CarState = {
  fuel: number;
  temperature: number;
  speed: number;
  destination: string;
};

const playlist = [
  { title: "Chaiyya Chaiyya", artist: "Sukhwinder Singh, Sapna Awasthi", albumArt: "https://placehold.co/300x300.png" },
  { title: "Kajra Re", artist: "Alisha Chinai, Shankar Mahadevan, Javed Ali", albumArt: "https://placehold.co/300x300.png" },
  { title: "Jai Ho", artist: "A. R. Rahman, Sukhwinder Singh, Tanvi Shah", albumArt: "https://placehold.co/300x300.png" },
  { title: "Genda Phool", artist: "Badshah, Payal Dev", albumArt: "https://placehold.co/300x300.png" },
  { title: "Apna Bana Le", artist: "Arijit Singh", albumArt: "https://placehold.co/300x300.png" },
];

type MediaState = {
  status: 'playing' | 'paused';
  currentSongIndex: number;
};

// Extend the Window interface for speech recognition
interface IWindow extends Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

export default function Dashboard() {
  const [carState, setCarState] = useState<CarState>({
    fuel: 75,
    temperature: 22,
    speed: 60,
    destination: "India Gate, New Delhi",
  });
  const [mediaState, setMediaState] = useState<MediaState>({ status: 'paused', currentSongIndex: 0 });
  const [tripPlan, setTripPlan] = useState<TripPlannerOutput['plan'] | null>(null);
  const [suggestions, setSuggestions] = useState<SmartSuggestionsOutput['suggestions']>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState("Hi! How can I help you? Tap the mic to speak.");
  const [isMounted, setIsMounted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({ name: "", type: "" });
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.pitch = 1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
    setAssistantResponse(text);
  }, []);

  const processCommand = useCallback(async (command: string) => {
    setIsLoading(true);
    setTranscript(command);
    
    let response = "I'm not sure how to handle that. Please try again.";
    let commandHandled = false;

    const lowerCaseCommand = command.toLowerCase();
    const numberMatch = lowerCaseCommand.match(/\d+/);
    const number = numberMatch ? parseInt(numberMatch[0], 10) : null;

    if (lowerCaseCommand.includes('temperature') && number !== null) {
      setCarState(prev => ({ ...prev, temperature: number }));
      response = `Temperature set to ${number} degrees.`;
      commandHandled = true;
    } else if (lowerCaseCommand.includes('play music')) {
      setMediaState(prev => ({ ...prev, status: 'playing' }));
      response = `Playing ${playlist[mediaState.currentSongIndex].title}.`;
      commandHandled = true;
    } else if (lowerCaseCommand.includes('pause music')) {
      setMediaState(prev => ({ ...prev, status: 'paused' }));
      response = "Music paused.";
      commandHandled = true;
    } else if (lowerCaseCommand.includes('next song')) {
        setMediaState(prev => ({ ...prev, currentSongIndex: (prev.currentSongIndex + 1) % playlist.length, status: 'playing' }));
        const nextSongIndex = (mediaState.currentSongIndex + 1) % playlist.length;
        response = `Playing next song: ${playlist[nextSongIndex].title}.`;
        commandHandled = true;
    } else if (lowerCaseCommand.includes('previous song')) {
        setMediaState(prev => ({ ...prev, currentSongIndex: (prev.currentSongIndex - 1 + playlist.length) % playlist.length, status: 'playing' }));
        const prevSongIndex = (mediaState.currentSongIndex - 1 + playlist.length) % playlist.length;
        response = `Playing previous song: ${playlist[prevSongIndex].title}.`;
        commandHandled = true;
    } else if (lowerCaseCommand.includes('navigate to')) {
      const destination = command.split(/navigate to/i)[1]?.trim();
      if (destination) {
        setCarState(prev => ({ ...prev, destination }));
        setTripPlan(null);
        response = `Navigating to ${destination}.`;
        commandHandled = true;
      }
    } else if (lowerCaseCommand.includes('plan a trip')) {
      response = "Okay, planning your trip...";
      speak(response);
      const tripResponse = await planTrip({ query: command });
      setTripPlan(tripResponse.plan);
      const finalDestination = tripResponse.plan[tripResponse.plan.length - 1].location;
      setCarState(prev => ({ ...prev, destination: finalDestination }));
      response = `I've planned a trip to ${finalDestination} for you. You can see the details on the screen.`;
      commandHandled = true;
    }
    
    if (!commandHandled) {
      try {
        const conversationalResponse = await conversationalFlow({ query: command });
        response = conversationalResponse.answer;
      } catch (error) {
        console.error("Error with conversational flow:", error);
        response = "I'm having a little trouble right now. Please try again later.";
      }
    }
    
    speak(response);
    setIsLoading(false);
  }, [speak, mediaState.currentSongIndex]);
  
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setTranscript('');
      setAssistantResponse("Listening...");
    }
  }, [isListening]);

  useEffect(() => {
    setIsMounted(true);
    const SpeechRecognition = (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Compatibility Error",
        description: "Speech recognition is not supported in your browser.",
      });
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech') {
        toast({
          variant: "destructive",
          title: "Speech Error",
          description: `An error occurred: ${event.error}`,
        });
      }
    };

    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setTranscript(currentTranscript);
      
      if (event.results[0].isFinal) {
        processCommand(currentTranscript);
      }
    };

    // Fetch smart suggestions on mount
    const fetchSuggestions = async () => {
      try {
        const now = new Date();
        const suggestions = await getSmartSuggestions({
          location: "28.6139, 77.2090", // Approx. New Delhi
          fuelLevel: carState.fuel,
          currentTime: `${now.getHours()}:${now.getMinutes()}`,
          lastKnownDestination: carState.destination,
        });
        setSuggestions(suggestions.suggestions);
      } catch (error) {
        console.error("Failed to fetch smart suggestions:", error);
        toast({
          variant: "destructive",
          title: "Suggestion Error",
          description: "Could not load smart suggestions.",
        });
      }
    };
    fetchSuggestions();


    return () => {
      recognitionRef.current?.stop();
    };
  }, [processCommand, toast, carState.fuel, carState.destination]);
  
  const handleBookNow = (name: string, type: string) => {
    setBookingDetails({ name, type });
    setIsBooking(true);
    speak(`Booking a ${type} at ${name}. Please confirm.`);
  };

  const confirmBooking = () => {
    setIsBooking(false);
    speak(`Your booking at ${bookingDetails.name} is confirmed.`);
    toast({
      title: "Booking Confirmed!",
      description: `Enjoy your ${bookingDetails.type} at ${bookingDetails.name}.`,
    });
  };

  const handleMediaControl = (action: 'toggle' | 'next' | 'prev') => {
    if (action === 'toggle') {
      setMediaState(prev => ({ ...prev, status: prev.status === 'playing' ? 'paused' : 'playing' }));
    } else if (action === 'next') {
      setMediaState(prev => ({ ...prev, currentSongIndex: (prev.currentSongIndex + 1) % playlist.length, status: 'playing' }));
    } else if (action === 'prev') {
      setMediaState(prev => ({ ...prev, currentSongIndex: (prev.currentSongIndex - 1 + playlist.length) % playlist.length, status: 'playing' }));
    }
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <MapView destination={carState.destination} />
          {tripPlan ? (
            <TripPlanner plan={tripPlan} />
          ) : (
            <VehicleStatus {...carState} />
          )}
        </div>

        <div className="lg:col-span-2 row-span-1 lg:row-span-2">
          <VoiceControl
            isListening={isListening}
            isLoading={isLoading}
            toggleListening={toggleListening}
            transcript={transcript}
            assistantResponse={assistantResponse}
          />
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ClimateControl temperature={carState.temperature} setTemperature={(temp) => setCarState(s => ({ ...s, temperature: temp }))} />
          <MediaPlayer 
            song={playlist[mediaState.currentSongIndex]}
            status={mediaState.status}
            onControl={handleMediaControl}
          />
        </div>
        
        <div className="lg:col-span-5">
           <Suggestions suggestions={suggestions} onBookNow={handleBookNow} />
        </div>

      </div>

      <AlertDialog open={isBooking} onOpenChange={setIsBooking}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to confirm your {bookingDetails.type} booking at {bookingDetails.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsBooking(false)}>Cancel</Button>
            <Button onClick={confirmBooking}>Confirm</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
