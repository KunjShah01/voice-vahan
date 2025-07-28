"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SmartSuggestionsOutput } from "@/ai/flows/smart-contextual-suggestions";
import { getSmartSuggestions } from "@/ai/flows/smart-contextual-suggestions";
import { multilingualVoiceProcessing } from "@/ai/flows/multilingual-voice-processing";
import { useToast } from "@/hooks/use-toast";
import VehicleStatus from "@/components/VehicleStatus";
import MapView from "@/components/MapView";
import ClimateControl from "@/components/ClimateControl";
import MediaPlayer from "@/components/MediaPlayer";
import Suggestions from "@/components/Suggestions";
import VoiceControl from "@/components/VoiceControl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


type CarState = {
  fuel: number;
  temperature: number;
  speed: number;
  destination: string;
};

type MediaState = {
  status: 'playing' | 'paused';
  song: string;
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
  const [mediaState, setMediaState] = useState<MediaState>({ status: 'paused', song: 'Chaiyya Chaiyya' });
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

  const fetchSuggestions = useCallback(async () => {
    try {
      const response = await getSmartSuggestions({
        location: "28.6129° N, 77.2295° E",
        fuelLevel: carState.fuel,
        currentTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        lastKnownDestination: carState.destination,
      });
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        variant: "destructive",
        title: "Suggestion Error",
        description: "Could not fetch smart suggestions.",
      });
    }
  }, [carState.fuel, carState.destination, toast]);

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
    try {
      const { processedText } = await multilingualVoiceProcessing({ userSpeech: command });
      
      let response = "I'm not sure how to handle that. Please try again.";
      let commandHandled = false;

      const lowerCaseCommand = processedText.toLowerCase();
      const numberMatch = lowerCaseCommand.match(/\d+/);
      const number = numberMatch ? parseInt(numberMatch[0], 10) : null;

      if (lowerCaseCommand.includes('temperature') && number !== null) {
        setCarState(prev => ({ ...prev, temperature: number }));
        response = `Temperature set to ${number} degrees.`;
        commandHandled = true;
      } else if (lowerCaseCommand.includes('play music')) {
        setMediaState(prev => ({ ...prev, status: 'playing' }));
        response = `Playing ${mediaState.song}.`;
        commandHandled = true;
      } else if (lowerCaseCommand.includes('pause music')) {
        setMediaState(prev => ({ ...prev, status: 'paused' }));
        response = "Music paused.";
        commandHandled = true;
      } else if (lowerCaseCommand.includes('navigate to')) {
        const destination = processedText.split('navigate to')[1]?.trim();
        if (destination) {
          setCarState(prev => ({ ...prev, destination }));
          response = `Navigating to ${destination}.`;
          commandHandled = true;
        }
      }

      if (!commandHandled) {
        response = `I understood: "${processedText}". But I can't perform that action yet.`;
      }
      
      speak(response);

    } catch (error) {
      console.error("Error processing command:", error);
      speak("Sorry, I had trouble understanding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [speak, mediaState.song]);
  
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
      toast({
        variant: "destructive",
        title: "Speech Error",
        description: `An error occurred: ${event.error}`,
      });
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

    return () => {
      recognitionRef.current?.stop();
    };
  }, [processCommand, toast]);

  useEffect(() => {
    fetchSuggestions();
    const intervalId = setInterval(fetchSuggestions, 30000);
    return () => clearInterval(intervalId);
  }, [fetchSuggestions]);
  
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

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <MapView destination={carState.destination} />
          <VehicleStatus {...carState} />
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
          <MediaPlayer {...mediaState} />
        </div>
        
        <div className="col-span-1 md:col-span-2 lg:col-span-5">
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
