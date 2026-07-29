'use client';

import { Mic, MicOff } from 'lucide-react';
import { useRef, useState } from 'react';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

const languages = [
  { label: 'EN', value: 'en-IN' },
  { label: 'HI', value: 'hi-IN' },
  { label: 'KN', value: 'kn-IN' }
];

export default function VoiceSearchButton({ onResult }: { onResult: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState('en-IN');
  const [status, setStatus] = useState('');
  const recognitionRef = useRef<any>(null);

  function start() {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setListening(true);
      setStatus('Listening...');
    };
    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript ?? '';
      if (text) onResult(text);
      setStatus(text ? `Heard: ${text}` : 'No speech detected.');
    };
    recognition.onerror = () => setStatus('Voice search stopped. Try again.');
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-black/10 bg-paper p-1">
        {languages.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setLanguage(item.value)}
            className={`rounded-md px-2 py-1 text-[11px] font-semibold ${language === item.value ? 'bg-indigo text-paper-light' : 'text-ink/70'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={listening ? stop : start}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${listening ? 'bg-vermillion text-white' : 'bg-indigo text-paper-light'}`}
      >
        {listening ? <MicOff size={15} /> : <Mic size={15} />}
        {listening ? 'Stop' : 'Voice search'}
      </button>
      {status && <p className="text-xs opacity-65">{status}</p>}
    </div>
  );
}
