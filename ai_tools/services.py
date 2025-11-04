"""
AI services for translation and summarization.
Using simple built-in functions and basic text processing.
For production, integrate with Azure Translator API or Google Cloud Translation.
"""
import logging
import re

logger = logging.getLogger(__name__)

# Simple language mapping (can be extended with Azure/Google APIs)
LANGUAGE_MAP = {
    'en': 'English',
    'fr': 'French',
    'ar': 'Arabic',
    'es': 'Spanish',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
}

LANGUAGE_CODES = list(LANGUAGE_MAP.keys())


def translate_text(text, target_language='en'):
    """
    Translate text to target language.
    
    NOTE: This is a placeholder implementation.
    For production, integrate with:
    - Azure Translator API (https://azure.microsoft.com/services/cognitive-services/translator/)
    - Google Cloud Translation API
    - AWS Translate
    
    Args:
        text: Text to translate
        target_language: Target language code (default: 'en')
    
    Returns:
        dict with translated text and source language
    """
    try:
        if not text or not text.strip():
            return {
                'error': 'Text is required',
                'translated_text': None,
                'source_language': None,
                'target_language': target_language
            }
        
        # Placeholder: Return original text with note
        # In production, replace this with actual translation API call
        # Example for Azure:
        # from azure.ai.translation.text import TextTranslationClient, TranslatorCredential
        # client = TextTranslationClient(credential=TranslatorCredential(key, region))
        # result = client.translate(content=[text], to=[target_language])
        # translated = result[0].translations[0].text
        
        return {
            'translated_text': f"[{target_language.upper()}] {text}",
            'source_language': 'auto',
            'target_language': target_language,
            'original_text': text,
            'note': 'This is a placeholder. Integrate with Azure Translator API or Google Cloud Translation for production.'
        }
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return {
            'error': str(e),
            'translated_text': None,
            'source_language': None,
            'target_language': target_language
        }


def summarize_text(text, max_length=150):
    """
    Summarize text using simple sentence extraction.
    
    NOTE: This is a basic implementation.
    For production, integrate with:
    - Azure Text Analytics API
    - Google Cloud Natural Language API
    - Or use libraries like sumy, transformers
    
    Args:
        text: Text to summarize
        max_length: Maximum length of summary in characters (default: 150)
    
    Returns:
        dict with summarized text
    """
    try:
        if not text or not text.strip():
            return {
                'error': 'Text is required',
                'summary': None,
                'original_length': 0,
                'summary_length': 0
            }
        
        # Simple summarization: Extract first few sentences
        # Split by sentence endings (. ! ?)
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Take first sentence(s) that fit within max_length
        summary = ""
        for sentence in sentences:
            if len(summary) + len(sentence) + 1 <= max_length:
                summary += sentence + ". "
            else:
                break
        
        # If no sentences fit, truncate by words
        if not summary.strip():
            words = text.split()
            summary = ' '.join(words[:max_length // 10]) + '...'
        
        summary = summary.strip()
        
        return {
            'summary': summary,
            'original_length': len(text),
            'summary_length': len(summary),
            'method': 'simple_extraction',
            'note': 'This is a basic implementation. For production, use Azure Text Analytics or advanced NLP libraries.'
        }
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        # Fallback to simple truncation
        words = text.split()
        summary = ' '.join(words[:min(max_length // 10, len(words))])
        return {
            'summary': summary + '...' if len(words) > max_length // 10 else summary,
            'original_length': len(text),
            'summary_length': len(summary),
            'method': 'truncation_fallback',
            'error': str(e)
        }


def get_supported_languages():
    """Get list of supported languages for translation."""
    return {
        'languages': LANGUAGE_MAP,
        'language_codes': LANGUAGE_CODES,
        'note': 'Extend with Azure Translator API or Google Cloud Translation for full language support.'
    }

