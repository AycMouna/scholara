"""
Views for AI tools (translation and summarization).
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import translate_text, summarize_text, get_supported_languages
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
def translate(request):
    """
    Translate text to target language.
    
    Expected POST data:
    {
        "text": "Text to translate",
        "target_language": "en"  // optional, default: 'en'
    }
    """
    try:
        text = request.data.get('text', '')
        target_language = request.data.get('target_language', 'en')
        
        if not text:
            return Response(
                {'error': 'Text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = translate_text(text, target_language)
        
        if result.get('error'):
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


@api_view(['POST'])
def summarize(request):
    """
    Summarize text.
    
    Expected POST data:
    {
        "text": "Text to summarize",
        "max_length": 150  // optional, default: 150
    }
    """
    try:
        text = request.data.get('text', '')
        max_length = request.data.get('max_length', 150)
        
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

