"use client";

import { useState, useRef } from "react";

type AnalysisResult = {
    matchName: string;
    matchReason: string;
    matchComment: string;
    matchImageUrl: string | null;
};

export default function StadiumView() {
    const [status, setStatus] = useState<"IDLE" | "ANALYZING" | "MATCH_FOUND">("IDLE");
    const [userImage, setUserImage] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = async (file: File) => {
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => setUserImage(e.target?.result as string);
        reader.readAsDataURL(file);

        setStatus("ANALYZING");

        const formData = new FormData();
        formData.append("image", file);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Analysis failed");

            const data = await res.json();
            setResult(data);
            setStatus("MATCH_FOUND");
        } catch (error) {
            console.error(error);
            alert("Something went wrong with the referee! Try again.");
            setStatus("IDLE");
        }
    };

    const reset = () => {
        setStatus("IDLE");
        setUserImage(null);
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1510596713412-56d7732d8478?q=80&w=2692&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-fixed">
            {/* Overlay to darken background */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>

            <div className="relative z-10 w-full max-w-6xl">
                {/* Main Jumbotron Frame */}
                <div className="jumbotron-frame bg-black border-4 border-gray-800 rounded-3xl overflow-hidden shadow-2xl relative">
                    <div className="text-center py-6 bg-gradient-to-r from-blue-900 to-purple-900 border-b-4 border-yellow-400">
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white neon-text uppercase transform -skew-x-12">
                            Lookalike Cam
                        </h1>
                    </div>

                    <div className="relative min-h-[500px] flex flex-col items-center justify-center p-8 scanlines bg-gray-900">

                        {status === "IDLE" && (
                            <div
                                className={`border-4 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${dragActive ? "border-neon-blue bg-blue-900/30 scale-105" : "border-gray-500 hover:border-white hover:bg-white/5"
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleChange}
                                />
                                <div className="text-6xl mb-4">📸</div>
                                <h3 className="text-2xl font-bold mb-2 text-white">DROP YOUR PHOTO HERE</h3>
                                <p className="text-gray-400">or click to upload</p>
                            </div>
                        )}

                        {status === "ANALYZING" && (
                            <div className="text-center">
                                <div className="animate-spin text-6xl mb-4">⚾️</div>
                                <h2 className="text-4xl font-black text-yellow-400 animate-pulse">
                                    SCANNING CROWD...
                                </h2>
                                {userImage && (
                                    <img
                                        src={userImage}
                                        alt="Analyzing"
                                        className="w-48 h-48 object-cover rounded-full border-4 border-yellow-400 mt-8 mx-auto animate-bounce"
                                    />
                                )}
                            </div>
                        )}

                        {status === "MATCH_FOUND" && result && (
                            <div className="w-full h-full flex flex-col items-center animate-in fade-in duration-700">
                                <div className="flex flex-col md:flex-row items-center justify-around w-full gap-8">

                                    {/* User Side */}
                                    <div className="text-center group perspective-1000">
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                            <img
                                                src={userImage!}
                                                alt="You"
                                                className="relative w-64 h-64 md:w-80 md:h-80 object-cover rounded-lg border-4 border-white shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <h3 className="text-2xl font-bold mt-4 text-cyan-300">YOU</h3>
                                    </div>

                                    {/* VS Badge */}
                                    <div className="text-6xl md:text-8xl font-black text-yellow-400 italic neon-text-pink vs-anim z-20">
                                        LOOKS<br />LIKE
                                    </div>

                                    {/* Match Side */}
                                    <div className="text-center group perspective-1000">
                                        <div className="relative">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                            {result.matchImageUrl ? (
                                                <img
                                                    src={result.matchImageUrl}
                                                    alt={result.matchName}
                                                    className="relative w-64 h-64 md:w-80 md:h-80 object-cover rounded-lg border-4 border-white shadow-lg transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gray-800 flex items-center justify-center rounded-lg border-4 border-white">
                                                    <span className="text-4xl">?</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-bold mt-4 text-pink-300">{result.matchName}</h3>
                                    </div>
                                </div>

                                <div className="mt-12 text-center max-w-2xl bg-black/50 p-6 rounded-xl border border-white/20 backdrop-blur">
                                    <p className="text-xl text-yellow-300 font-bold mb-2 uppercase tracking-wide">
                                        ANNOUNCER SAYS:
                                    </p>
                                    <p className="text-3xl md:text-4xl font-black text-white italic">
                                        "{result.matchComment}"
                                    </p>
                                    <p className="mt-4 text-gray-400 text-sm">
                                        Reason: {result.matchReason}
                                    </p>
                                </div>

                                <button
                                    onClick={reset}
                                    className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xl shadow-lg hover:shadow-red-500/50 transition-all uppercase tracking-widest"
                                >
                                    Play Again
                                </button>
                            </div>
                        )}

                    </div>

                    {/* Decorative Footer */}
                    <div className="bg-gray-900 border-t-4 border-gray-800 p-2 flex justify-between items-center text-xs text-gray-500 font-mono">
                        <span>CAM-01 [REC]</span>
                        <span>LIVE BROADCAST // STADIUM FEED</span>
                        <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
