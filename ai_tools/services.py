"""
AI services for translation and summarization using Transformers.
"""
import logging
import re
from django.conf import settings
from decouple import config
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch

logger = logging.getLogger(__name__)

# Global model cache to avoid reloading models
_translation_pipelines = {}
_summarization_pipeline = None

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


def _get_translation_pipeline(source_lang='en', target_lang='fr'):
    """
    Get or create translation pipeline for language pair.
    Uses Helsinki-NLP models for translation.
    """
    global _translation_pipelines
    
    cache_key = f"{source_lang}_{target_lang}"
    
    if cache_key not in _translation_pipelines:
        try:
            # Use Helsinki-NLP models - they're lightweight and fast
            # For most common pairs, use opus-mt models
            model_name = f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"
            
            # Fallback model for common languages
            if source_lang == 'auto':
                # Use multilingual model
                model_name = "Helsinki-NLP/opus-mt-mul-en" if target_lang == 'en' else "facebook/mbart-large-50-many-to-many-mmt"
            
            logger.info(f"Loading translation model: {model_name}")
            _translation_pipelines[cache_key] = pipeline(
                "translation",
                model=model_name,
                device=0 if torch.cuda.is_available() else -1,
                max_length=512
            )
            logger.info(f"✅ Translation model loaded: {model_name}")
        except Exception as e:
            logger.warning(f"Failed to load {model_name}, trying fallback: {e}")
            # Fallback to multilingual model
            try:
                model_name = "facebook/mbart-large-50-many-to-many-mmt"
                _translation_pipelines[cache_key] = pipeline(
                    "translation",
                    model=model_name,
                    device=0 if torch.cuda.is_available() else -1,
                    max_length=512
                )
            except Exception as e2:
                logger.error(f"Failed to load fallback model: {e2}")
                raise
    
    return _translation_pipelines[cache_key]


def translate_text(text, target_language='en'):
    """
    Translate text to target language using Transformers.
    
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
        
        # Limit text length to avoid memory issues
        if len(text) > 1000:
            text = text[:1000]
            logger.warning("Text truncated to 1000 characters for translation")
        
        # Map language codes to model language codes
        lang_map = {
            'en': 'en', 'fr': 'fr', 'ar': 'ar', 'es': 'es', 
            'de': 'de', 'it': 'it', 'pt': 'pt'
        }
        
        target_lang = lang_map.get(target_language, 'en')
        source_lang = 'auto'  # Auto-detect or use English as default
        
        # Get translation pipeline
        try:
            translator = _get_translation_pipeline(source_lang, target_lang)
            
            # Translate
            result = translator(text, max_length=512)
            
            # Extract translated text
            if isinstance(result, list) and len(result) > 0:
                translated_text = result[0].get('translation_text', '')
            elif isinstance(result, dict):
                translated_text = result.get('translation_text', '')
            else:
                translated_text = str(result)
            
            logger.info(f"✅ Translation successful: auto → {target_language}")
            
            return {
                'translated_text': translated_text,
                'source_language': 'auto',
                'target_language': target_language,
                'original_text': text,
                'method': 'transformers'
            }
            
        except Exception as e:
            logger.error(f"Translation error with transformers: {e}")
            # Fallback to simple placeholder
            return {
                'translated_text': f"[{target_language.upper()}] {text}",
                'source_language': 'auto',
                'target_language': target_language,
                'original_text': text,
                'error': f'Translation model error: {str(e)}. Please ensure transformers models are properly installed.',
                'method': 'fallback'
            }
    
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return {
            'error': str(e),
            'translated_text': None,
            'source_language': None,
            'target_language': target_language
        }


def _get_summarization_pipeline():
    """Get or create summarization pipeline."""
    global _summarization_pipeline
    
    if _summarization_pipeline is None:
        try:
            # Use BART model for summarization - fast and accurate
            model_name = "facebook/bart-large-cnn"
            logger.info(f"Loading summarization model: {model_name}")
            _summarization_pipeline = pipeline(
                "summarization",
                model=model_name,
                device=0 if torch.cuda.is_available() else -1,
                max_length=512,
                min_length=30
            )
            logger.info(f"✅ Summarization model loaded: {model_name}")
        except Exception as e:
            logger.error(f"Failed to load summarization model: {e}")
            # Fallback to smaller model
            try:
                model_name = "google/pegasus-xsum"
                _summarization_pipeline = pipeline(
                    "summarization",
                    model=model_name,
                    device=0 if torch.cuda.is_available() else -1
                )
            except Exception as e2:
                logger.error(f"Failed to load fallback summarization model: {e2}")
                raise
    
    return _summarization_pipeline


def summarize_text(text, max_length=150):
    """
    Summarize text using Transformers (BART model).
    
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
        
        # Limit text length to avoid memory issues
        max_input_length = 1024
        if len(text) > max_input_length:
            text = text[:max_input_length]
            logger.warning(f"Text truncated to {max_input_length} characters for summarization")
        
        # Convert max_length from characters to tokens (rough estimate)
        # Average 4 characters per token, add some buffer
        max_tokens = min(max_length // 3, 142)  # BART max is 142 tokens
        min_tokens = max(30, max_tokens // 3)
        
        try:
            summarizer = _get_summarization_pipeline()
            
            # Summarize
            result = summarizer(
                text,
                max_length=max_tokens,
                min_length=min_tokens,
                do_sample=False
            )
            
            # Extract summary
            if isinstance(result, list) and len(result) > 0:
                summary = result[0].get('summary_text', '')
            elif isinstance(result, dict):
                summary = result.get('summary_text', '')
            else:
                summary = str(result)
            
            summary = summary.strip()
            
            logger.info(f"✅ Summarization successful: {len(text)} → {len(summary)} chars")
            
            return {
                'summary': summary,
                'original_length': len(text),
                'summary_length': len(summary),
                'method': 'transformers_bart',
                'note': 'Using BART transformer model for summarization.'
            }
            
        except Exception as e:
            logger.error(f"Summarization error with transformers: {e}")
            # Fallback to simple sentence extraction
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            summary = ""
            for sentence in sentences:
                if len(summary) + len(sentence) + 1 <= max_length:
                    summary += sentence + ". "
                else:
                    break
            
            if not summary.strip():
                words = text.split()
                summary = ' '.join(words[:max_length // 10]) + '...'
            
            return {
                'summary': summary.strip(),
                'original_length': len(text),
                'summary_length': len(summary),
                'method': 'fallback_extraction',
                'error': f'Transformer model error: {str(e)}'
            }
            
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        # Final fallback
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

