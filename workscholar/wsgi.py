"""
WSGI config for workscholar project.
It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'workscholar.settings')

application = get_wsgi_application()
app = application  # Add this line for Vercel
