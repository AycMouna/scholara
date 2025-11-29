import { useState } from 'react';
import Layout from '../components/Layout';
import { aiApi } from '../services/apiService';

function Chatbot() {
  const [translateInput, setTranslateInput] = useState('');
  const [summarizeInput, setSummarizeInput] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [summary, setSummary] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [translating, setTranslating] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');

  const incrementAiCalls = () => {
    try {
      const current = parseInt(localStorage.getItem('aiCallsCount') || '0', 10);
      localStorage.setItem('aiCallsCount', String((isNaN(current) ? 0 : current) + 1));
    } catch {}
  };

  const handleTranslate = async () => {
    if (!translateInput.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setTranslating(true);
    setError('');
    setTranslatedText('');

    try {
      const result = await aiApi.translate(translateInput, targetLanguage);
      if (result.error) {
        // Show error message and suggestion if available
        let errorMessage = result.error;
        if (result.suggestion) {
          errorMessage += `\n\n💡 ${result.suggestion}`;
        }
        if (result.details) {
          errorMessage += `\n\nDetails: ${result.details}`;
        }
        setError(errorMessage);
      } else {
        setTranslatedText(result.translated_text);
        incrementAiCalls();
      }
    } catch (err) {
      setError('Translation failed. Please try again.');
      console.error('Translation error:', err);
    } finally {
      setTranslating(false);
    }
  };

  const handleSummarize = async () => {
    if (!summarizeInput.trim()) {
      setError('Please enter text to summarize');
      return;
    }

    setSummarizing(true);
    setError('');
    setSummary('');

    try {
      const result = await aiApi.summarize(summarizeInput, 200);
      if (result.error && !result.summary) {
        // Show error message and suggestion if available
        let errorMessage = result.error;
        if (result.suggestion) {
          errorMessage += `\n\n💡 ${result.suggestion}`;
        }
        if (result.details) {
          errorMessage += `\n\nDetails: ${result.details}`;
        }
        setError(errorMessage);
      } else {
        setSummary(result.summary);
        incrementAiCalls();
      }
    } catch (err) {
      setError('Summarization failed. Please try again.');
      console.error('Summarization error:', err);
    } finally {
      setSummarizing(false);
    }
  };

  const handleClear = () => {
    setTranslateInput('');
    setSummarizeInput('');
    setTranslatedText('');
    setSummary('');
    setError('');
  };

  return (
    <Layout title="AI Chatbot Service">
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2 flex items-center gap-3">
            AI Chatbot Service
          </h1>
          <p className="text-gray-600 mb-6">
            Translate text to different languages or get AI-powered summaries
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Translation Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <span>🌐</span> Translation
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text to Translate
              </label>
              <textarea
                value={translateInput}
                onChange={(e) => setTranslateInput(e.target.value)}
                placeholder="Enter text to translate..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleTranslate}
              disabled={translating || summarizing || !translateInput.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {translating ? 'Translating...' : 'Translate'}
            </button>

            {translatedText && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-2">Translated Text:</p>
                <p className="text-gray-800">{translatedText.replace(/^\[.*?\]\s*/, '')}</p>
              </div>
            )}
          </div>

          {/* Summarization Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <span>📝</span> Summarization
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text to Summarize
              </label>
              <textarea
                value={summarizeInput}
                onChange={(e) => setSummarizeInput(e.target.value)}
                placeholder="Enter text to summarize..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSummarize}
              disabled={translating || summarizing || !summarizeInput.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {summarizing ? 'Summarizing...' : 'Summarize'}
            </button>

            {summary && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm font-medium text-emerald-700 mb-2">Summary:</p>
                <p className="text-gray-800">{summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Clear Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleClear}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300"
          >
            Clear All
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default Chatbot;

