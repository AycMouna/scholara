"""
Script to pre-download AI models during Docker build.
This will cache the models in the Docker image to speed up deployment.
"""
import os
import logging
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def download_translation_models():
    """Download commonly used translation models."""
    models_to_download = [
        "Helsinki-NLP/opus-mt-en-fr",
        "Helsinki-NLP/opus-mt-fr-en",
        "Helsinki-NLP/opus-mt-en-es",
        "Helsinki-NLP/opus-mt-es-en",
        "Helsinki-NLP/opus-mt-en-ar",
        "Helsinki-NLP/opus-mt-ar-en",
        "Helsinki-NLP/opus-mt-en-de",
        "Helsinki-NLP/opus-mt-de-en",
        "Helsinki-NLP/opus-mt-en-it",
        "Helsinki-NLP/opus-mt-it-en",
        "Helsinki-NLP/opus-mt-en-pt",
        "Helsinki-NLP/opus-mt-pt-en",
        "Helsinki-NLP/opus-mt-mul-en"  # Multilingual model for other languages
    ]
    
    for model_name in models_to_download:
        try:
            logger.info(f"Downloading translation model: {model_name}")
            # Download tokenizer
            tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=False)
            # Download model
            model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
            logger.info(f"✅ Successfully downloaded: {model_name}")
        except Exception as e:
            logger.warning(f"Failed to download {model_name}: {e}")

def download_summarization_model():
    """Download the summarization model."""
    model_name = "sshleifer/distilbart-cnn-12-6"
    try:
        logger.info(f"Downloading summarization model: {model_name}")
        # Download tokenizer
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        # Download model
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        logger.info(f"✅ Successfully downloaded: {model_name}")
    except Exception as e:
        logger.warning(f"Failed to download {model_name}: {e}")
        # Try fallback model
        fallback_model = "facebook/bart-large-cnn"
        try:
            logger.info(f"Downloading fallback summarization model: {fallback_model}")
            tokenizer = AutoTokenizer.from_pretrained(fallback_model)
            model = AutoModelForSeq2SeqLM.from_pretrained(fallback_model)
            logger.info(f"✅ Successfully downloaded fallback: {fallback_model}")
        except Exception as e2:
            logger.error(f"Failed to download fallback model {fallback_model}: {e2}")

if __name__ == "__main__":
    logger.info("Starting model download process...")
    download_translation_models()
    download_summarization_model()
    logger.info("Model download process completed.")