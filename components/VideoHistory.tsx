import React from 'react';
import { GeneratedVideo } from '../types';
import { Film, Download, AlertCircle, Clock } from 'lucide-react';

interface VideoHistoryProps {
  videos: GeneratedVideo[];
}

export const VideoHistory: React.FC<VideoHistoryProps> = ({ videos }) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/20">
        <Film className="mx-auto text-slate-600 mb-4" size={48} />
        <h3 className="text-xl text-slate-400 font-medium">No videos generated yet</h3>
        <p className="text-slate-500 mt-2">Start by entering a prompt above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl transition-all hover:border-slate-600">
          <div className="aspect-video bg-black relative flex items-center justify-center">
            {video.status === 'completed' && video.url ? (
              <video 
                src={video.url} 
                controls 
                className="w-full h-full object-contain" 
                poster={video.thumbnail} // Optional if we had one
              />
            ) : video.status === 'failed' ? (
              <div className="text-red-400 flex flex-col items-center p-4 text-center">
                <AlertCircle size={32} className="mb-2" />
                <span>Generation Failed</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-blue-400 p-4">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mb-3"></div>
                 <span className="text-sm font-medium animate-pulse">Generating...</span>
                 <span className="text-xs text-slate-500 mt-2">This may take a few minutes</span>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-2">
                 <span className="bg-black/60 backdrop-blur-md text-xs font-mono text-white px-2 py-0.5 rounded border border-white/10">
                    {video.resolution}
                 </span>
                 <span className="bg-black/60 backdrop-blur-md text-xs font-mono text-white px-2 py-0.5 rounded border border-white/10">
                    {video.aspectRatio}
                 </span>
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-slate-300 line-clamp-2 mb-3 h-10" title={video.prompt}>
              {video.prompt}
            </p>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{new Date(video.timestamp).toLocaleTimeString()}</span>
              </div>
              
              {video.status === 'completed' && video.url && (
                <a 
                  href={video.url} 
                  download={`veo-video-${video.id}.mp4`}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Download size={14} />
                  Download
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};