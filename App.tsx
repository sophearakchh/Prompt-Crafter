import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Zap, Brain, Sliders, Image as ImageIcon, Video, RefreshCw, Sun, Moon } from 'lucide-react';
import FileUploader from './components/FileUploader';
import Button from './components/Button';
import { UploadedFile, ModelType, PromptStyle, AnalysisState } from './types';
import { generatePromptFromMedia } from './services/geminiService';

const App: React.FC = () => {
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.FLASH);
  const [selectedStyle, setSelectedStyle] = useState<PromptStyle>(PromptStyle.DESCRIPTIVE);
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
  });
  
  const [copied, setCopied] = useState(false);

  const handleFileSelect = (file: UploadedFile) => {
    setCurrentFile(file);
    setAnalysis({ isLoading: false, result: null, error: null });
  };

  const handleClear = () => {
    setCurrentFile(null);
    setAnalysis({ isLoading: false, result: null, error: null });
  };

  const handleGenerate = async () => {
    if (!currentFile) return;

    setAnalysis({ isLoading: true, result: null, error: null });

    try {
      const result = await generatePromptFromMedia(
        currentFile.file,
        selectedModel,
        selectedStyle
      );
      setAnalysis({ isLoading: false, result, error: null });
    } catch (error: any) {
      setAnalysis({
        isLoading: false,
        result: null,
        error: error.message || "An unexpected error occurred",
      });
    }
  };

  const copyToClipboard = () => {
    if (analysis.result) {
      navigator.clipboard.writeText(analysis.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              PromptCrafter
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs font-medium px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-800 hidden sm:block">
              Powered by Gemini 2.5 & 3.0
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                    {currentFile ? (currentFile.type === 'video' ? <Video size={18} className="text-slate-700 dark:text-slate-300"/> : <ImageIcon size={18} className="text-slate-700 dark:text-slate-300"/>) : <ImageIcon size={18} className="text-slate-700 dark:text-slate-300"/>}
                </div>
                Input Media
              </h2>
              <FileUploader 
                onFileSelect={handleFileSelect} 
                onClear={handleClear} 
                currentFile={currentFile} 
              />
            </div>

            {/* Controls (Sticky on Mobile, inline on Desktop) */}
            <div className={`
              bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all duration-500
              ${!currentFile ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}
            `}>
              <div className="flex flex-col gap-6">
                
                {/* Model Selection */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block flex items-center gap-2">
                    <Brain size={16} /> AI Model
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedModel(ModelType.FLASH)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        selectedModel === ModelType.FLASH
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${selectedModel === ModelType.FLASH ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-slate-200'}`}>Flash 2.5</span>
                        <Zap size={16} className={selectedModel === ModelType.FLASH ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Fast analysis. Great for quick captions and simple descriptions.</p>
                    </button>

                    <button
                      onClick={() => setSelectedModel(ModelType.PRO)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        selectedModel === ModelType.PRO
                          ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${selectedModel === ModelType.PRO ? 'text-purple-900 dark:text-purple-100' : 'text-slate-900 dark:text-slate-200'}`}>Pro 3.0</span>
                        <Sparkles size={16} className={selectedModel === ModelType.PRO ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'} />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Deep reasoning. Best for complex scenes, details, and nuances.</p>
                    </button>
                  </div>
                </div>

                {/* Style Selection */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block flex items-center gap-2">
                    <Sliders size={16} /> Output Style
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: PromptStyle.DESCRIPTIVE, label: 'Descriptive' },
                      { id: PromptStyle.MIDJOURNEY, label: 'Midjourney/Art' },
                      { id: PromptStyle.ACCESSIBILITY, label: 'Accessibility' },
                      { id: PromptStyle.TAGS, label: 'Tags & Keywords' }
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id as PromptStyle)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                          selectedStyle === style.id
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/50'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  isLoading={analysis.isLoading} 
                  disabled={!currentFile}
                  className="w-full py-3 text-base shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
                  icon={<Sparkles size={18} />}
                >
                  {analysis.isLoading ? 'Analyzing Media...' : 'Generate Prompt'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-5">
             {/* Sticky Result Container */}
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] transition-all duration-300 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50">
                 <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      Generated Result
                    </h3>
                    {analysis.result && (
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-full transition-colors"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                 </div>

                 <div className="flex-1 p-6 relative bg-white dark:bg-slate-900">
                    {analysis.error && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 text-sm">
                        <p className="font-semibold mb-1">Error Generating Prompt</p>
                        {analysis.error}
                      </div>
                    )}

                    {!analysis.result && !analysis.isLoading && !analysis.error && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <Sparkles className="text-slate-300 dark:text-slate-600" size={32} />
                        </div>
                        <p className="text-sm font-medium">Upload media and click generate to see the AI magic happen here.</p>
                      </div>
                    )}

                    {analysis.isLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent mb-4"></div>
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">Consulting the oracle...</p>
                      </div>
                    )}

                    {analysis.result && (
                      <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                          {analysis.result}
                        </p>
                      </div>
                    )}
                 </div>
                 
                 {analysis.result && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                       <Button variant="ghost" size="sm" onClick={handleGenerate} icon={<RefreshCw size={14}/>}>
                          Regenerate
                       </Button>
                    </div>
                 )}
              </div>
              
              {/* Tips Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                   <Zap size={18} className="text-yellow-300" /> Pro Tip
                </h4>
                <p className="text-indigo-100 text-sm leading-relaxed">
                   Use <strong>Gemini 3 Pro</strong> for complex images containing text, multiple subjects, or when you need detailed artistic analysis for style replication. Use <strong>Flash</strong> for speed.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;