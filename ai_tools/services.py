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
            # Ensure host has https:// scheme
            rapidapi_host = rapidapi_host.strip()  # Remove any whitespace
            if not rapidapi_host.startswith('http://') and not rapidapi_host.startswith('https://'):
                rapidapi_host = f"https://{rapidapi_host}"
            
            # Clean up the URL
            rapidapi_host = rapidapi_host.rstrip('/')
            
            # Extract host name from URL (remove https:// and any path) for X-RapidAPI-Host header
            host_name = rapidapi_host.replace('https://', '').replace('http://', '').split('/')[0]
            
            # RapidAPI Microsoft Translator API3 - try /translate first (faster), then /largetranslate
            endpoints_to_try = ['/translate', '/largetranslate']
            
            # Validate URL format
            if not rapidapi_host.startswith('http://') and not rapidapi_host.startswith('https://'):
                logger.error(f"❌ Invalid RapidAPI URL: {rapidapi_host}")
                return {
                    'error': f'Invalid RapidAPI host URL. Please set RAPIDAPI_HOST to a valid URL (e.g., https://microsoft-translator-text-api3.p.rapidapi.com or microsoft-translator-text-api3.p.rapidapi.com)',
                    'translated_text': None,
                    'source_language': None,
                    'target_language': target_language
                }
            
            # RapidAPI Microsoft Translator API3 uses query parameters
            params = {
                'to': target_language,
                'from': 'auto'  # Auto-detect source language
            }
            
            headers = {
                'X-RapidAPI-Key': rapidapi_key.strip(),  # Remove any whitespace
                'X-RapidAPI-Host': host_name,
                'Content-Type': 'application/json'
            }
            
            # RapidAPI API3 uses body format: {"text": "..."} or {"sep":"|","text":"..."}
            body_rapidapi = {'text': text}
            
            # Try endpoints in order: /translate first (faster), then /largetranslate
            last_error = None
            for endpoint_path in endpoints_to_try:
                constructed_url = f"{rapidapi_host}{endpoint_path}"
                logger.info(f"🔍 Trying RapidAPI: {constructed_url} with host: {host_name}")
                
                try:
                    # Use very short timeout to avoid worker timeout (Render free tier has 30s limit)
                    # Keep requests fast to avoid worker timeout
                    timeout = 5  # Short timeout for both endpoints to prevent worker timeout
                    response = requests.post(constructed_url, params=params, headers=headers, json=body_rapidapi, timeout=timeout)
                    
                    # Log response for debugging
                    logger.info(f"📡 RapidAPI Response Status: {response.status_code}")
                    
                    # If 401, don't try other endpoints
                    if response.status_code == 401:
                        logger.error("❌ 401 Unauthorized - Check RapidAPI key and subscription")
                        try:
                            error_body = response.text[:200]
                            logger.error(f"❌ Error response: {error_body}")
                        except:
                            pass
                        return {
                            'error': f'RapidAPI authentication failed (401). Please verify: 1) Your RapidAPI key is correct, 2) You have subscribed to Microsoft Translator API on RapidAPI, 3) Your subscription is active. Host: {host_name}',
                            'translated_text': None,
                            'source_language': None,
                            'target_language': target_language
                        }
                    
                    # If 403, don't try other endpoints
                    if response.status_code == 403:
                        logger.error("❌ 403 Forbidden - Not subscribed to API")
                        try:
                            error_body = response.text[:200]
                            logger.error(f"❌ Error response: {error_body}")
                        except:
                            pass
                        return {
                            'error': 'RapidAPI subscription required. Please subscribe to Microsoft Translator API on RapidAPI: https://rapidapi.com',
                            'translated_text': None,
                            'source_language': None,
                            'target_language': target_language
                        }
                    
                    # If 502 (Bad Gateway), API provider is down
                    if response.status_code == 502:
                        logger.error("❌ 502 Bad Gateway - RapidAPI service is down")
                        try:
                            error_body = response.json()
                            error_msg = error_body.get('messages', error_body.get('message', 'RapidAPI service is unavailable'))
                            logger.error(f"❌ Error response: {error_msg}")
                        except:
                            try:
                                error_msg = response.text[:200]
                            except:
                                error_msg = 'RapidAPI service is currently unavailable'
                        
                        # Don't try other endpoints if it's a 502 - the service is down
                        return {
                            'error': f'RapidAPI service is currently unavailable (502 Bad Gateway). The Microsoft Translator API provider is not responding. Please try again later or use Azure Translator API instead.',
                            'details': error_msg,
                            'translated_text': None,
                            'source_language': None,
                            'target_language': target_language,
                            'suggestion': 'Set up Azure Translator API as an alternative, or wait for RapidAPI to restore service.'
                        }
                    
                    # If successful, parse and return
                    if response.status_code == 200:
                        response.raise_for_status()
                        result = response.json()
                        
                        # Parse RapidAPI response - handle different response formats
                        translated_text = None
                        detected_language = 'auto'
                        
                        # Try different response formats
                        if isinstance(result, list) and len(result) > 0:
                            # Azure format response: [{"translations": [{"text": "..."}]}]
                            if 'translations' in result[0]:
                                translation = result[0]['translations'][0]
                                translated_text = translation.get('text', '')
                                detected_language = result[0].get('detectedLanguage', {}).get('language', 'auto')
                            else:
                                # Direct translation in result
                                translated_text = result[0].get('text', '') or result[0].get('translatedText', '')
                        # RapidAPI format: {"text": "..."} or {"translatedText": "..."} or {"translation": "..."}
                        elif isinstance(result, dict):
                            # Try various possible keys
                            translated_text = (
                                result.get('text') or 
                                result.get('translatedText') or 
                                result.get('translation') or
                                result.get('translated')
                            )
                            detected_language = result.get('detectedLanguage', result.get('from', result.get('sourceLanguage', 'auto')))
                        
                        if translated_text:
                            logger.info(f"✅ Translation successful (RapidAPI {endpoint_path}): {detected_language} → {target_language}")
                            return {
                                'translated_text': translated_text,
                                'source_language': detected_language,
                                'target_language': target_language,
                                'original_text': text
                            }
                        else:
                            logger.error(f"❌ Could not parse translation result: {result}")
                            last_error = f"No translation in response: {result}"
                            continue  # Try next endpoint
                    
                    # If 400 or other error, try next endpoint
                    if response.status_code == 400:
                        logger.warning(f"⚠️ {endpoint_path} returned 400, trying next endpoint...")
                        last_error = response.text[:200]
                        continue
                    
                    # Other status codes, try next endpoint
                    logger.warning(f"⚠️ {endpoint_path} returned {response.status_code}, trying next endpoint...")
                    last_error = f"Status {response.status_code}: {response.text[:200]}"
                    continue
                    
                except requests.exceptions.Timeout:
                    logger.warning(f"⏱️ Timeout on {endpoint_path}, trying next endpoint...")
                    last_error = f"Timeout on {endpoint_path}"
                    continue
                except requests.exceptions.RequestException as e:
                    logger.warning(f"⚠️ Error on {endpoint_path}: {e}, trying next endpoint...")
                    last_error = str(e)
                    continue
            
            # All endpoints failed
            logger.error(f"❌ All RapidAPI endpoints failed. Last error: {last_error}")
            
            # If it's a timeout, provide a more helpful error
            if 'timeout' in str(last_error).lower() or 'timed out' in str(last_error).lower():
                return {
                    'error': f'RapidAPI request timed out. The translation service is responding slowly. Please try again or check your RapidAPI subscription status.',
                    'details': str(last_error),
                    'translated_text': None,
                    'source_language': None,
                    'target_language': target_language,
                    'suggestion': 'Try again in a few moments, or verify your RapidAPI subscription is active and has not exceeded rate limits.'
                }
            
            return {
                'error': f'RapidAPI request failed after trying all endpoints. Last error: {last_error}',
                'translated_text': None,
                'source_language': None,
                'target_language': target_language
            }
        
        # Fallback to Azure Translator if configured
        elif azure_key and azure_endpoint:
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
                
                logger.info(f"✅ Translation successful (Azure): {detected_language} → {target_language}")
                
                return {
                    'translated_text': translated_text,
                    'source_language': detected_language,
                    'target_language': target_language,
                    'original_text': text
                }
            else:
                raise Exception("No translation result returned from Azure API")
        
        # Fallback to placeholder if neither is configured
        else:
            logger.warning("No translation API credentials configured. Using placeholder.")
            return {
                'translated_text': f"[{target_language.upper()}] {text}",
                'source_language': 'auto',
                'target_language': target_language,
                'original_text': text,
                'note': 'Translation API credentials not configured. Set RAPIDAPI_KEY and RAPIDAPI_HOST (for RapidAPI) or AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_ENDPOINT (for Azure).'
            }
            
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

