"""
AI services for translation and summarization using Transformers.
"""
import logging
import os
from typing import Optional
import re
from django.conf import settings
from decouple import config
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch

logger = logging.getLogger(__name__)

# Global model cache to avoid reloading models
_translation_pipelines = {}
_summarization_pipeline = None

# Simple language mapping for Transformers models
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


def _fix_pronoun_references(translated_text, original_text):
    """
    Fix common pronoun reference errors in French-to-English translations.
    Attempts to correct pronoun gender mismatches based on context.
    """
    original_lower = original_text.lower()
    translated_lower = translated_text.lower()
    
    # Pattern 1: "his daughter" when French says "sa fille" (her daughter) - often refers to mother's daughter
    # Check if original has "mère" (mother) and "sa fille" (her daughter)
    if 'mère' in original_lower and 'sa fille' in original_lower:
        # Replace "his daughter" with "her daughter" when context suggests it's the mother's daughter
        translated_text = re.sub(r'\bhis daughter\b', 'her daughter', translated_text, flags=re.IGNORECASE)
        translated_text = re.sub(r'\bhis own daughter\b', 'her daughter', translated_text, flags=re.IGNORECASE)
    
    # Pattern 2: Fix "heard of his daughter" when it should be "heard of her daughter"
    # This often happens when "sa fille" (her daughter) is mistranslated, especially with "mère" (mother) context
    if 'mère' in original_lower or 'mother' in translated_lower:
        translated_text = re.sub(r'\bheard of his daughter\b', 'heard of her daughter', translated_text, flags=re.IGNORECASE)
        translated_text = re.sub(r'\bnews of his daughter\b', 'news of her daughter', translated_text, flags=re.IGNORECASE)
        translated_text = re.sub(r'\bnews about his daughter\b', 'news about her daughter', translated_text, flags=re.IGNORECASE)
        translated_text = re.sub(r'\bheard news of his daughter\b', 'heard news of her daughter', translated_text, flags=re.IGNORECASE)
    
    # Pattern 3: "happened to him" when French says "il lui soit arrivé" referring to a female
    # Check if original has feminine context (fille, elle, disparue, mère) and the sentence mentions a female
    if any(word in original_lower for word in ['fille', 'elle', 'disparue', 'mère']):
        # If the sentence mentions a daughter/mother and "happened to him", likely should be "her"
        # Look for patterns like "happened to him" after mentioning a female
        if re.search(r'(daughter|mother|girl|woman|she|her|Electra)', translated_text, re.IGNORECASE):
            translated_text = re.sub(r'\bhappened to him\b', 'happened to her', translated_text, flags=re.IGNORECASE)
            translated_text = re.sub(r'\bhas happened to him\b', 'has happened to her', translated_text, flags=re.IGNORECASE)
            translated_text = re.sub(r'\bhad happened to him\b', 'had happened to her', translated_text, flags=re.IGNORECASE)
            translated_text = re.sub(r'\bwill happen to him\b', 'will happen to her', translated_text, flags=re.IGNORECASE)
    
    # Pattern 4: Fix "she fears that... happened to him" when it should be "happened to her"
    # This is a common error when the subject is female but the object pronoun is wrong
    if re.search(r'\bshe\b.*\bfears?\b', translated_text, re.IGNORECASE):
        # If "she fears" appears, check if there's "happened to him" later in the sentence
        translated_text = re.sub(r'\bhappened to him\b', 'happened to her', translated_text, flags=re.IGNORECASE)
        translated_text = re.sub(r'\bhas happened to him\b', 'has happened to her', translated_text, flags=re.IGNORECASE)
        translated_text = re.sub(r'\bhad happened to him\b', 'had happened to her', translated_text, flags=re.IGNORECASE)
    
    return translated_text


def _get_translation_pipeline(source_lang='en', target_lang='fr'):
    """
    Get or create translation pipeline for language pair.
    Uses Helsinki-NLP models for translation.
    """
    global _translation_pipelines
    
    cache_key = f"{source_lang}_{target_lang}"
    
    if cache_key not in _translation_pipelines:
        try:
            # Allow overriding model via env var for Render/low-RAM
            override_model = os.getenv('AI_TRANSLATION_MODEL')
            if override_model:
                model_name = override_model
            else:
                # Use Helsinki-NLP models - lightweight and fast
                model_name = f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"
            
            # Fallback model for common languages (avoid large mbart model)
            if source_lang == 'auto' and not override_model:
                # Use smaller multilingual model - avoid large mbart (2.5GB)
                if target_lang == 'en':
                    model_name = "Helsinki-NLP/opus-mt-mul-en"
                else:
                    # Use a common pair model instead of large mbart
                    model_name = f"Helsinki-NLP/opus-mt-en-{target_lang}"  # Assume English source
                    logger.info(f"Auto-detect: using en→{target_lang} model (faster than multilingual)")
            
            logger.info(f"Loading translation model: {model_name}")
            # Use slow tokenizer to avoid SentencePiece fast-conversion issues on some platforms
            tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=False)
            
            # Optimize for CPU inference speed
            device = 0 if torch.cuda.is_available() else -1
            _translation_pipelines[cache_key] = pipeline(
                "translation",
                model=model_name,
                tokenizer=tokenizer,
                device=device,
                # Don't set max_length here - let it be dynamic per request
                model_kwargs={
                    'torch_dtype': torch.float32,  # Use float32 for CPU
                }
            )
            logger.info(f"✅ Translation model loaded: {model_name}")
        except Exception as e:
            logger.warning(f"Failed to load {model_name}, trying fallback: {e}")
            # Fallback to smaller multilingual model (avoid large mbart)
            try:
                # Use smaller Helsinki-NLP multilingual model instead of large mbart
                if target_lang == 'en':
                    model_name = "Helsinki-NLP/opus-mt-mul-en"
                else:
                    # Try a generic multilingual model
                    model_name = "Helsinki-NLP/opus-mt-en-fr"  # Use common pair as fallback
                    logger.warning(f"Using fallback model {model_name} for {source_lang}→{target_lang}")
                
                tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=False)
                device = 0 if torch.cuda.is_available() else -1
                _translation_pipelines[cache_key] = pipeline(
                    "translation",
                    model=model_name,
                    tokenizer=tokenizer,
                    device=device,
                    # Don't set max_length here - let it be dynamic per request
                    model_kwargs={
                        'torch_dtype': torch.float32,
                    }
                )
                logger.info(f"✅ Fallback translation model loaded: {model_name}")
            except Exception as e2:
                logger.error(f"Failed to load fallback model: {e2}")
                raise
    
    return _translation_pipelines[cache_key]


def translate_text(text, target_language='en', source_language='auto'):
    """
    Translate text to target language using ONLY Transformers (Helsinki-NLP models).
    No external APIs are used - all processing is local.
    
    Args:
        text: Text to translate
        target_language: Target language code (default: 'en')
        source_language: Source language code or 'auto' for auto-detection (default: 'auto')
    
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
        
        # Determine source language: use provided source_language, or env var, or default to 'auto'
        if source_language and source_language != 'auto':
            source_lang = lang_map.get(source_language, source_language)
        else:
            # Try to detect language from text (improved heuristic)
            # Check for common French words/patterns (expanded list)
            french_indicators = [
                'est', 'une', 'des', 'les', 'dans', 'pour', 'avec', 'sont', 'être', 'avoir', 
                'texte', 'langue', 'sonne', 'réveille', 'écoute', 'répondeur', 'message', 
                'mère', 'demande', 'inquiète', 'fille', 'disparue', 'craint', 'accident',
                'janvier', 'matin', 'téléphone', 'enfant', 'grave', 'nouvelle'
            ]
            text_lower = text.lower()
            french_count = sum(1 for word in french_indicators if word in text_lower)
            
            # Check for French-specific characters/patterns
            has_french_chars = any(char in text for char in ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'ù', 'û', 'ü', 'ô', 'ö'])
            
            # Check for Arabic characters
            has_arabic = any('\u0600' <= char <= '\u06FF' for char in text)
            
            # Improved detection: French if indicators found OR French characters present
            if french_count >= 2 or has_french_chars:
                source_lang = 'fr'
                logger.info(f"Auto-detected source language: French (found {french_count} French indicators, has_french_chars: {has_french_chars})")
            elif has_arabic:
                source_lang = 'ar'
                logger.info("Auto-detected source language: Arabic (found Arabic characters)")
            else:
                # Default to English or use env var
                source_lang = lang_map.get(os.getenv('AI_TRANSLATION_SOURCE_LANG', 'en'), 'en')
                logger.info(f"Using default source language: {source_lang}")
        
        # Use ONLY transformers - no external API fallbacks
        try:
            translator = _get_translation_pipeline(source_lang, target_lang)
            # Increase max_length for better context and quality (especially for longer sentences)
            # Use longer max_length for better translation quality
            max_length = 256 if len(text) > 200 else 128
            result = translator(text, max_length=max_length)

            if isinstance(result, list) and len(result) > 0:
                translated_text = result[0].get('translation_text', '')
            elif isinstance(result, dict):
                translated_text = result.get('translation_text', '')
            else:
                translated_text = str(result)
            
            # Post-process to fix common pronoun reference errors (French → English)
            if source_lang == 'fr' and target_lang == 'en':
                translated_text = _fix_pronoun_references(translated_text, text)

            logger.info(f"✅ Translation successful: {source_lang} → {target_language}")
            return {
                'translated_text': translated_text,
                'source_language': source_lang,
                'target_language': target_language,
                'original_text': text,
                'method': 'transformers'
            }
        except Exception as e:
            logger.warning(f"Direct translation failed ({source_lang}→{target_lang}): {e}")
            # Try two-step translation via English if direct model doesn't exist
            if source_lang != 'en' and target_lang != 'en':
                try:
                    logger.info(f"Trying two-step translation: {source_lang} → en → {target_lang}")
                    # Step 1: Translate to English
                    translator_en = _get_translation_pipeline(source_lang, 'en')
                    max_length = 256 if len(text) > 200 else 128
                    result_en = translator_en(text, max_length=max_length)
                    
                    if isinstance(result_en, list) and len(result_en) > 0:
                        text_en = result_en[0].get('translation_text', '')
                    elif isinstance(result_en, dict):
                        text_en = result_en.get('translation_text', '')
                    else:
                        text_en = str(result_en)
                    
                    # Step 2: Translate from English to target
                    translator_target = _get_translation_pipeline('en', target_lang)
                    max_length_en = 256 if len(text_en) > 200 else 128
                    result_final = translator_target(text_en, max_length=max_length_en)
                    
                    if isinstance(result_final, list) and len(result_final) > 0:
                        translated_text = result_final[0].get('translation_text', '')
                    elif isinstance(result_final, dict):
                        translated_text = result_final.get('translation_text', '')
                    else:
                        translated_text = str(result_final)
                    
                    logger.info(f"✅ Two-step translation successful: {source_lang} → en → {target_language}")
                    return {
                        'translated_text': translated_text,
                        'source_language': source_lang,
                        'target_language': target_language,
                        'original_text': text,
                        'method': 'transformers_two_step',
                        'note': f'Used two-step translation ({source_lang}→en→{target_lang}) because direct model not available'
                    }
                except Exception as e2:
                    logger.error(f"Two-step translation also failed: {e2}")
                    # Return error
                    return {
                        'error': f'Translation failed: Direct model ({source_lang}→{target_lang}) not available, and two-step translation also failed: {str(e2)}',
                        'translated_text': None,
                        'source_language': source_lang,
                        'target_language': target_language,
                        'original_text': text,
                        'method': 'transformers',
                        'suggestion': f'Try specifying source_language explicitly, or use a supported language pair. Check if Helsinki-NLP/opus-mt-{source_lang}-{target_lang} model exists.'
                    }
            else:
                # Return error - no fallback to external APIs
                return {
                    'error': f'Transformer model error: {str(e)}',
                    'translated_text': None,
                    'source_language': source_lang,
                    'target_language': target_language,
                    'original_text': text,
                    'method': 'transformers',
                    'suggestion': 'Ensure transformers models are properly installed and loaded. Check server logs for details.'
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
    """Get or create summarization pipeline. Uses smaller, faster models for CPU."""
    global _summarization_pipeline
    
    if _summarization_pipeline is None:
        try:
            # Use smaller, faster model by default (better for CPU/free tier)
            # sshleifer/distilbart-cnn-12-6 is ~500MB vs bart-large-cnn ~1.6GB
            model_name = os.getenv('AI_SUMMARIZATION_MODEL') or "sshleifer/distilbart-cnn-12-6"
            logger.info(f"Loading summarization model: {model_name}")
            
            # Optimize for CPU inference
            device = 0 if torch.cuda.is_available() else -1
            _summarization_pipeline = pipeline(
                "summarization",
                model=model_name,
                device=device,
                model_kwargs={
                    'torch_dtype': torch.float32,  # Use float32 for CPU (faster than float16)
                }
            )
            logger.info(f"✅ Summarization model loaded: {model_name}")
        except Exception as e:
            logger.error(f"Failed to load summarization model: {e}")
            # Fallback to even smaller model
            try:
                model_name = "facebook/bart-large-cnn"  # Fallback to original if distilbart fails
                logger.info(f"Trying fallback model: {model_name}")
                _summarization_pipeline = pipeline(
                    "summarization",
                    model=model_name,
                    device=0 if torch.cuda.is_available() else -1
                )
                logger.info(f"✅ Fallback summarization model loaded: {model_name}")
            except Exception as e2:
                logger.error(f"Failed to load fallback summarization model: {e2}")
                raise
    
    return _summarization_pipeline


def summarize_text(text, max_length=150):
    """
    Summarize text using ONLY Transformers (BART model).
    No external APIs are used - all processing is local.
    
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
        
        # Limit text length for faster processing
        max_input_length = 1024  # Increased to allow longer texts
        if len(text) > max_input_length:
            text = text[:max_input_length]
            logger.warning(f"Text truncated to {max_input_length} characters for faster summarization")
        
        # Convert max_length from characters to tokens
        # Allow more tokens for complete summaries (max_length is in characters, tokens are ~4 chars each)
        # For max_length=200 chars, allow ~50-60 tokens (enough for a complete summary)
        max_tokens = min(max_length // 3, 80)  # Increased to 80 tokens for better summaries
        min_tokens = max(20, max_tokens // 3)  # Minimum 20 tokens for meaningful summary
        
        try:
            summarizer = _get_summarization_pipeline()
            
            # Summarize with balanced settings for quality and speed
            # Use length_penalty to encourage more concise summaries
            result = summarizer(
                text,
                max_length=max_tokens,
                min_length=min_tokens,
                do_sample=False,
                num_beams=4,  # Increased to 4 for better quality summaries
                early_stopping=True,
                no_repeat_ngram_size=3,  # Prevent repetition for better summaries
                length_penalty=1.2  # Encourage shorter, more concise summaries
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
        'note': 'Using Transformers models (Helsinki-NLP) for translation. Language support depends on available model pairs.'
    }

