
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, encode, decodeAudioData } from '../services/geminiService';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

const VoiceView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [visualizer, setVisualizer] = useState<number[]>(new Array(20).fill(5));
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const toggleSession = async () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const stopSession = () => {
    setIsActive(false);
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
    inputContextRef.current?.close();
    setVisualizer(new Array(20).fill(5));
  };

  const startSession = async () => {
    try {
      setIsActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Live Session Connected');
            const source = inputContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple Visualizer logic
              const rms = Math.sqrt(inputData.reduce((acc, v) => acc + v * v, 0) / inputData.length);
              setVisualizer(prev => prev.map(() => 5 + rms * 100));

              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContextRef.current!.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNodeRef.current!);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                if (text) setTranscript(prev => [...prev.slice(-4), `You: ${text}`]);
            }
            if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                if (text) setTranscript(prev => [...prev.slice(-4), `WallAI: ${text}`]);
            }
          },
          onerror: (e) => { console.error('Live Error', e); stopSession(); },
          onclose: () => { console.log('Live Session Closed'); stopSession(); },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: 'You are WallAI, a high-end wallpaper assistant. Help users find the perfect style for their phone screens. You are helpful, artistic, and brief.',
        },
      });
    } catch (err) {
      console.error(err);
      setIsActive(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-[calc(100vh-200px)] pt-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Talk to WallAI</h2>
        <p className="text-gray-400">Ask for wallpaper ideas or design tips</p>
      </div>

      <div className="flex flex-col items-center w-full max-w-sm">
        <div className="flex items-end justify-center h-20 space-x-1 mb-8">
          {visualizer.map((height, i) => (
            <div 
              key={i} 
              className="w-1.5 bg-blue-500 rounded-full transition-all duration-75"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        <button 
          onClick={toggleSession}
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ${
            isActive ? 'bg-red-500 scale-110 shadow-red-500/20' : 'bg-blue-600 hover:scale-105'
          }`}
        >
          {isActive ? <StopIcon className="w-10 h-10" /> : <MicrophoneIcon className="w-10 h-10" />}
        </button>
      </div>

      <div className="w-full glass rounded-2xl p-4 min-h-[120px] flex flex-col justify-end">
        {transcript.length === 0 ? (
          <p className="text-gray-500 text-center italic text-sm">Transcriptions will appear here...</p>
        ) : (
          transcript.map((line, i) => (
            <p key={i} className={`text-xs mb-1 ${line.startsWith('You:') ? 'text-blue-300' : 'text-gray-300'}`}>
              {line}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default VoiceView;
