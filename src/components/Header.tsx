"use client"

import { Voicemail } from 'lucide-react';
import { Card } from './ui/card';

const VoiceVahanLogo = () => (
    <div className="flex items-center justify-center h-8 w-8 bg-primary rounded-lg text-primary-foreground">
        <Voicemail className="h-5 w-5" />
    </div>
);


export default function Header() {
  return (
    <header className="p-4">
      <div className="mx-auto max-w-7xl">
        <Card className="p-3 bg-card/80 backdrop-blur-sm border-border/80">
            <div className="flex items-center gap-4">
                <VoiceVahanLogo />
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Voice<span className="text-primary">Vahan</span>
                </h1>
            </div>
        </Card>
      </div>
    </header>
  );
}
