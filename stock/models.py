from django.db import models

# Aquí definimos el Producto
class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    cantidad_actual = models.IntegerField(default=0)

    def __str__(self):
        return self.nombre

# Aquí definimos cuando entra o sale algo
class Movimiento(models.Model):
    # Solo permitimos dos opciones
    OPCIONES = (
        ('ENTRADA', 'Entrada (+)'),
        ('SALIDA', 'Salida (-)'),
    )
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=10, choices=OPCIONES)
    cantidad = models.IntegerField()

    def save(self, *args, **kwargs):
        # Esta es la "magia" que suma o resta sola
        if self.tipo == 'ENTRADA':
            self.producto.cantidad_actual += self.cantidad
        else:
            self.producto.cantidad_actual -= self.cantidad
        
        self.producto.save() # Guarda el nuevo total en el producto
        super().save(*args, **kwargs) # Guarda el registro del movimiento