"""
AI services for translation and summarization.
Using Azure Translator API for real translation.
"""
import logging
import re
import requests
from django.conf import settings
from decouple import config

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
    Translate text to target language using Azure Translator API.
    
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
        
        # Get Azure Translator credentials from settings
        azure_key = config('AZURE_TRANSLATOR_KEY', default=None)
        azure_endpoint = config('AZURE_TRANSLATOR_ENDPOINT', default=None)
        azure_region = config('AZURE_TRANSLATOR_REGION', default=None)
        
        # Fallback to placeholder if Azure credentials are not configured
        if not azure_key or not azure_endpoint:
            logger.warning("Azure Translator credentials not configured. Using placeholder.")
            return {
                'translated_text': f"[{target_language.upper()}] {text}",
                'source_language': 'auto',
                'target_language': target_language,
                'original_text': text,
                'note': 'Azure Translator API credentials not configured. Set AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_ENDPOINT environment variables.'
            }
        
        # Azure Translator API call
        endpoint = azure_endpoint.rstrip('/')
        path = '/translate'
        constructed_url = f"{endpoint}{path}"
        
        params = {
            'api-version': '3.0',
            'to': target_language
        }
        
        headers = {
            'Ocp-Apim-Subscription-Key': azure_key,
            'Content-Type': 'application/json'
        }
        
        if azure_region:
            headers['Ocp-Apim-Subscription-Region'] = azure_region
        
        body = [{'text': text}]
        
        response = requests.post(constructed_url, params=params, headers=headers, json=body, timeout=10)
        response.raise_for_status()
        
        result = response.json()
        
        if result and len(result) > 0:
            translation = result[0]['translations'][0]
            translated_text = translation['text']
            detected_language = result[0].get('detectedLanguage', {}).get('language', 'auto')
            
            logger.info(f"✅ Translation successful: {detected_language} → {target_language}")
            
            return {
                'translated_text': translated_text,
                'source_language': detected_language,
                'target_language': target_language,
                'original_text': text
            }
        else:
            raise Exception("No translation result returned from Azure API")
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Azure Translator API request error: {e}")
        return {
            'error': f'Translation API error: {str(e)}',
            'translated_text': None,
            'source_language': None,
            'target_language': target_language
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

