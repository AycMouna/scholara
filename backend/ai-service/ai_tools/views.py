"""
Views for AI tools (translation and summarization).
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ParseError
from .services import translate_text, summarize_text, get_supported_languages
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import logging
import json

logger = logging.getLogger(__name__)


@api_view(['POST', 'GET'])  # Updated: Now supports both GET and POST methods
def translate(request):
    """
    Translate text to target language.
    
    GET: Returns API documentation
    POST: Translates text
    
    Expected POST data:
    {
        "text": "Text to translate",
        "target_language": "en"  // optional, default: 'en'
    }
    """
    if request.method == 'GET':
        return Response({
            'endpoint': '/api/translate/',
            'method': 'POST',
            'description': 'Translate text to target language',
            'parameters': {
                'text': {
                    'type': 'string',
                    'required': True,
                    'description': 'Text to translate'
                },
                'target_language': {
                    'type': 'string',
                    'required': False,
                    'default': 'en',
                    'description': 'Target language code (en, fr, ar, es, de, it, pt, etc.)'
                },
                'source_language': {
                    'type': 'string',
                    'required': False,
                    'default': 'auto',
                    'description': 'Source language code or "auto" for auto-detection (en, fr, ar, es, de, it, pt, etc.)'
                }
            },
            'example': {
                'request': {
                    'text': 'Hello',
                    'target_language': 'fr'
                },
                'response': {
                    'translated_text': '[FR] Hello',
                    'source_language': 'auto',
                    'target_language': 'fr',
                    'original_text': 'Hello'
                }
            },
            'note': 'Using Transformers models (Helsinki-NLP) for translation. All processing is done locally - no external APIs required.'
        })
    
    try:
        # Handle JSON parsing errors
        try:
            text = request.data.get('text', '')
            target_language = request.data.get('target_language', 'en')
            source_language = request.data.get('source_language', 'auto')  # Allow source language specification
        except (ParseError, json.JSONDecodeError, ValueError) as parse_error:
            error_msg = str(parse_error)
            return Response(
                {
                    'error': 'Invalid JSON format in request body',
                    'details': error_msg,
                    'example': {
                        'text': 'Hello world',
                        'target_language': 'fr'
                    },
                    'tip': 'Ensure your JSON uses double quotes, no trailing commas, and valid syntax. Example: {"text":"Hello","target_language":"fr"}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not text:
            return Response(
                {'error': 'Text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = translate_text(text, target_language, source_language)

        if result.get('error'):
            # Return error with CORS headers (Response will handle this)
            # But provide a more helpful error message
            error_msg = result.get('error', 'Translation failed')
            
            # If it's a 502 (service down), return 503 Service Unavailable
            if '502' in error_msg or 'bad gateway' in error_msg.lower() or 'unavailable' in error_msg.lower():
                return Response(
                    {
                        'error': 'Translation service is currently unavailable. The API provider is down.',
                        'details': error_msg,
                        'translated_text': None,
                        'source_language': None,
                        'target_language': target_language,
                        'suggestion': result.get('suggestion', 'Please check server logs for model loading errors. Ensure transformers models are properly installed.')
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            # If it's a timeout, suggest fallback
            if 'timeout' in error_msg.lower() or 'timed out' in error_msg.lower():
                return Response(
                    {
                        'error': 'Translation service is currently slow. Please try again in a moment.',
                        'details': error_msg,
                        'translated_text': None,
                        'source_language': None,
                        'target_language': target_language,
                        'suggestion': 'The transformer model is taking longer than expected. This may be due to model loading or processing time. Please retry.'
                    },
                    status=status.HTTP_408_REQUEST_TIMEOUT
                )
            
            return Response(
                result,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"✅ Translation successful: {result.get('source_language')} → {target_language}")
        return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"❌ Translation error: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST', 'GET'])
def summarize(request):
    """
    Summarize text.
    
    GET: Returns API documentation
    POST: Summarizes text
    
    Expected POST data:
    {
        "text": "Text to summarize",
        "max_length": 150  // optional, default: 150
    }
    """
    if request.method == 'GET':
        return Response({
            'endpoint': '/api/summarize/',
            'method': 'POST',
            'description': 'Summarize text to a shorter version',
            'parameters': {
                'text': {
                    'type': 'string',
                    'required': True,
                    'description': 'Text to summarize'
                },
                'max_length': {
                    'type': 'integer',
                    'required': False,
                    'default': 150,
                    'description': 'Maximum length of summary in characters'
                }
            },
            'example': {
                'request': {
                    'text': 'This is a very long text that needs to be summarized into a shorter version.',
                    'max_length': 50
                },
                'response': {
                    'summary': 'This is a very long text...',
                    'original_length': 78,
                    'summary_length': 50,
                    'method': 'simple_extraction'
                }
            },
            'note': 'Using Transformers models (BART) for summarization. All processing is done locally - no external APIs required.'
        })
    
    try:
        # Handle JSON parsing errors
        try:
            text = request.data.get('text', '')
            max_length = request.data.get('max_length', 150)
        except (ParseError, json.JSONDecodeError, ValueError) as parse_error:
            error_msg = str(parse_error)
            return Response(
                {
                    'error': 'Invalid JSON format in request body',
                    'details': error_msg,
                    'example': {
                        'text': 'Long text to summarize here...',
                        'max_length': 150
                    },
                    'tip': 'Ensure your JSON uses double quotes, no trailing commas, and valid syntax. Example: {"text":"Your text here","max_length":150}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not text:
            return Response(
                {'error': 'Text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert max_length to int if it's a string
        try:
            max_length = int(max_length)
        except (ValueError, TypeError):
            max_length = 150
        
        result = summarize_text(text, max_length)
        
        if result.get('error') and not result.get('summary'):
            return Response(
                result,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"✅ Summarization successful: {result.get('original_length')} → {result.get('summary_length')} chars")
        return Response(result, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"❌ Summarization error: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def supported_languages(request):
    """Get list of supported languages for translation."""
    try:
        result = get_supported_languages()
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"❌ Error getting supported languages: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def health(request):
    """Health check endpoint."""
    return Response({'status': 'ok', 'service': 'ai-service'}, status=status.HTTP_200_OK)

