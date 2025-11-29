from django.apps import AppConfig
import threading
import logging


logger = logging.getLogger(__name__)


class AiToolsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ai_tools'

    def ready(self):
        # Warm up models in background to avoid first-request latency
        def _warmup():
            try:
                logger.info('🔥 Starting model warmup in background...')
                from .services import _get_summarization_pipeline, _get_translation_pipeline
                
                # Warm up summarization model
                logger.info('Loading summarization model...')
                _get_summarization_pipeline()
                
                # Warm up common translation pairs
                logger.info('Loading translation models (en↔fr)...')
                _get_translation_pipeline('en', 'fr')
                
                logger.info('✅ AI models warmed up successfully!')
            except Exception as e:
                logger.warning(f'⚠️ AI warmup skipped: {e}')

        # Start warmup in background thread (non-blocking)
        threading.Thread(target=_warmup, daemon=True).start()

