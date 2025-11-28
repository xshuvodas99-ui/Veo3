import React, { useState } from 'react';
import { VideoConfig, GeneratedVideo } from './types';
import { generateVideo } from './services/geminiService';
import { VideoHistory } from './components/VideoHistory';
import { ApiKeyManager } from './components/ApiKeyManager';
import { Sparkles, Video, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  
  const [isKeyReady, setIsKeyReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setError(null);
    setIsGenerating(true);
    
    // Create a placeholder video entry
    const newVideoId = crypto.randomUUID();
    const newVideo: GeneratedVideo = {
      id: newVideoId,
      url: null,
      prompt: prompt,
      timestamp: Date.now(),
      status: 'generating',
      aspectRatio,
      resolution
    };

    setVideos(prev => [newVideo, ...prev]);

    try {
      const config: VideoConfig = {
        prompt,
        image: selectedImage,
        aspectRatio,
        resolution
      };

      const videoUrl = await generateVideo(config);

      setVideos(prev => prev.map(v => 
        v.id === newVideoId 
          ? { ...v, status: 'completed', url: videoUrl } 
          : v
      ));
    } catch (err: any) {
      console.error("App Generation Error", err);
      setError(err.message || "Failed to generate video");
      setVideos(prev => prev.map(v => 
        v.id === newVideoId 
          ? { ...v, status: 'failed' } 
          : v
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Video className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Veo Studio</h1>
              <p className="text-xs text-slate-400 font-mono">POWERED BY GOOGLE VEO 3.1</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ApiKeyManager onKeySelected={() => setIsKeyReady(true)} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Intro / Banner */}
        <div className="mb-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4 pb-2">
              Transform Ideas into Motion
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Create cinematic 1080p videos from text descriptions and reference images using Google's state-of-the-art Veo generation model.
            </p>
        </div>

        {/* Generator Controls */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 mb-12 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          
          {/* Gradient Orb Background Effect */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {/* Input Column */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-400" />
                  Video Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your video in detail (e.g., A neon hologram of a cat driving at top speed in a cyberpunk city...)"
                  className="w-full h-32 bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 flex items-center gap-2">
                  <ImageIcon size={16} className="text-blue-400" />
                  Reference Image (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden" 
                    />
                    <div className={`border-2 border-dashed rounded-xl p-4 flex items-center justify-center gap-3 transition-all ${selectedImage ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 bg-slate-900/50 group-hover:border-slate-500'}`}>
                      {selectedImage ? (
                        <>
                          <div className="w-10 h-10 rounded bg-cover bg-center" style={{ backgroundImage: `url(${URL.createObjectURL(selectedImage)})` }}></div>
                          <span className="text-sm text-green-400 truncate font-medium">{selectedImage.name}</span>
                        </>
                      ) : (
                        <>
                          <span className="bg-slate-800 p-2 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                            <ImageIcon size={20} />
                          </span>
                          <span className="text-sm text-slate-400 group-hover:text-slate-300">Upload a starting frame...</span>
                        </>
                      )}
                    </div>
                  </label>
                  {selectedImage && (
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Config Column */}
            <div className="space-y-6 border-l border-slate-700/50 lg:pl-8">
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                  >
                    16:9 (Landscape)
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                  >
                    9:16 (Portrait)
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">Resolution</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResolution('720p')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${resolution === '720p' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                  >
                    720p (Faster)
                  </button>
                  <button
                    onClick={() => setResolution('1080p')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${resolution === '1080p' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                  >
                    1080p (HQ)
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleGenerate}
                  disabled={!isKeyReady || isGenerating || !prompt.trim()}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-95 ${
                    !isKeyReady 
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : isGenerating 
                        ? 'bg-indigo-900/50 text-indigo-300 cursor-wait' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate Video
                    </>
                  )}
                </button>
                {!isKeyReady && (
                  <p className="text-center text-xs text-orange-400 mt-3 flex items-center justify-center gap-1">
                    <AlertTriangle size={12} />
                    Please connect Project API Key first
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
             <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
             <div>
               <h4 className="text-red-400 font-semibold text-sm">Generation Failed</h4>
               <p className="text-red-300/80 text-sm mt-1">{error}</p>
             </div>
          </div>
        )}

        {/* Gallery Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <FilmIcon />
              Your Creations
            </h3>
            <span className="text-sm text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
              {videos.length} videos
            </span>
          </div>
          
          <VideoHistory videos={videos} />
        </div>

      </main>
    </div>
  );
};

const FilmIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
    <line x1="7" y1="2" x2="7" y2="22"></line>
    <line x1="17" y1="2" x2="17" y2="22"></line>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <line x1="2" y1="7" x2="7" y2="7"></line>
    <line x1="2" y1="17" x2="7" y2="17"></line>
    <line x1="17" y1="17" x2="22" y2="17"></line>
    <line x1="17" y1="7" x2="22" y2="7"></line>
  </svg>
)

export default App;