from django.db import models
from django.contrib.auth.models import User


class Producto(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.nombre


class Reserva(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    servicio = models.CharField(max_length=200)
    fecha_hora_reserva = models.DateTimeField()
    confirmada = models.BooleanField(default=False)

    def __str__(self):
        return f"Reserva de {self.usuario.username} para {self.servicio} en {self.fecha_hora_reserva}"

class Product(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    image = models.ImageField(upload_to='products/')  

    def __str__(self):
        return self.name