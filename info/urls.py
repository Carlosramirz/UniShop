from django.urls import path
from django.contrib.auth import views as auth_views
from .views import (
    index, contacto, reserva, tienda, registro, login_view, view_dashboard, agendas, productos, pago, get_reservas, crearReserva, eliminarReserva, 
    product_list, product_add, edit_product, delete_product, product_api, get_product, user_api)

urlpatterns = [
    path('', index, name='index'),
    path('contacto/', contacto, name='contacto'),
    path('reserva/', reserva, name='reserva'),
    path('crearReserva/', crearReserva, name='crearReserva'),
    path('eliminarReserva/<int:reserva_id>/', eliminarReserva, name='eliminarReserva'),
    path('get_reservas/', get_reservas, name='get_reservas'),
    path('tienda/', tienda, name='tienda'),
    path('registro/', registro, name='registro'),
    path('pago/', pago, name='pago'),
    path('login/', login_view, name='login'),
    path('api/users/', user_api, name='user_api'),
    path('logout/', auth_views.LogoutView.as_view(next_page='index'), name='logout'),
    path('dashboard/',view_dashboard, name='dashboard'),
    path('agendas/', agendas, name='agendas'),
    path('products/', product_list, name='product_list'),
    path('api/product/', product_api, name='product_api'),
    path('products/add/', product_add, name='product_add'),
    path('api/product/edit/<int:product_id>/', edit_product, name='edit_product'),
    path('api/product/delete/<int:product_id>/', delete_product, name='delete_product'),
    path('api/product/<int:product_id>/', get_product, name='get_product'),

]