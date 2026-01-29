from django.contrib import admin
from django.urls import path
from stock.views import inventario_view  # Aquí llamamos a la función que creamos en views.py

urlpatterns = [
    path('admin/', admin.site.urls),  # La dirección para el panel de control
    path('', inventario_view),        # La dirección vacía '' significa la página principal
]