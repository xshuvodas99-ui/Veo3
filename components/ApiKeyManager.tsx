import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, CheckCircle } from 'lucide-react';

interface ApiKeyManagerProps {
  onKeySelected: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    try {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setHasKey(true);
        onKeySelected();
      } else {
        setHasKey(false);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setHasKey(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (window.aistudio) {
        try {
            await window.aistudio.openSelectKey();
            // Assume success if no error thrown, per instructions
            setHasKey(true);
            onKeySelected();
        } catch (error: any) {
            console.error("Key selection failed", error);
             if (error.message && error.message.includes("Requested entity was not found")) {
                setHasKey(false);
                alert("Project not found. Please try selecting a key again.");
             }
        }
    } else {
        alert("AI Studio environment not detected.");
    }
  };

  if (loading) return null;

  if (hasKey) {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
        <CheckCircle size={14} />
        <span>GCP Project Connected</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-xl p-6 mb-8 text-center max-w-2xl mx-auto backdrop-blur-sm">
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
          <Key size={32} />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Connect Google Cloud Project</h3>
      <p className="text-slate-300 mb-6 max-w-lg mx-auto">
        To use Veo 3.1 video generation, you must connect a Google Cloud Project with billing enabled.
      </p>
      
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleConnect}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
        >
          <Key size={18} />
          Select API Key
        </button>
        
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          View Billing Documentation <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
};