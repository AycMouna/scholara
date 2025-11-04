"""
Custom middleware to allow Render hostnames dynamically.
"""
from django.http import Http404


class AllowRenderHostsMiddleware:
    """
    Middleware to allow any .onrender.com hostname.
    Django doesn't support wildcards in ALLOWED_HOSTS,
    so we check here and allow if it ends with .onrender.com
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if host ends with .onrender.com
        host = request.get_host().split(':')[0]  # Remove port if present
        if host.endswith('.onrender.com'):
            # Allow this host dynamically
            request._allowed_hosts = True
        return self.get_response(request)

