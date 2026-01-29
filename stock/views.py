from django.shortcuts import render, redirect
from .models import Producto, Movimiento

def inventario_view(request):
    # Si el usuario envía el formulario (POST)
    if request.method == 'POST':
        # Verificar si es para agregar un nuevo producto
        if 'nombre_producto' in request.POST:
            nombre = request.POST.get('nombre_producto')
            cantidad_inicial = request.POST.get('cantidad_inicial', 0)
            
            # Crear el nuevo producto
            Producto.objects.create(
                nombre=nombre,
                cantidad_actual=int(cantidad_inicial)
            )
            return redirect('/')
        
        # Si es un movimiento de inventario
        else:
            prod_id = request.POST.get('producto_id')
            tipo_mov = request.POST.get('tipo')
            cant = request.POST.get('cantidad')

            # Buscamos el producto y creamos el movimiento
            producto_obj = Producto.objects.get(id=prod_id)
            Movimiento.objects.create(
                producto=producto_obj,
                tipo=tipo_mov,
                cantidad=int(cant)
            )
            return redirect('/') # Recarga la página para ver los cambios

    # Si el usuario solo entra a ver la página (GET)
    todos_los_productos = Producto.objects.all()
    return render(request, 'index.html', {'productos': todos_los_productos})