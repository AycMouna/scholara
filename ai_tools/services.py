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
        
        # Check if using RapidAPI or Azure Translator
        rapidapi_key = config('RAPIDAPI_KEY', default=None)
        rapidapi_host = config('RAPIDAPI_HOST', default=None)
        
        azure_key = config('AZURE_TRANSLATOR_KEY', default=None)
        azure_endpoint = config('AZURE_TRANSLATOR_ENDPOINT', default=None)
        azure_region = config('AZURE_TRANSLATOR_REGION', default=None)
        
        # Use RapidAPI if configured (priority)
        if rapidapi_key and rapidapi_host:
            # RapidAPI Microsoft Translator API call
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

