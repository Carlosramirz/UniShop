from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils import timezone
from datetime import datetime
from .forms import CustomUserCreationForm, Product
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required, user_passes_test
from .models import Reserva
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from .forms import ProductForm 
import pytz
import traceback

def index(request):
    return render (request, 'info/index.html')

def contacto(request):
    return render (request, 'info/contacto.html')

# Inicio methos Reserva
@login_required
def reserva(request):
    context = {'user_name': request.user.get_full_name() or request.user.username}
    return render (request, 'info/reserva.html', context)

@csrf_exempt
@login_required
def crearReserva(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            fecha_hora_reserva = datetime.fromisoformat(data['start']).replace(tzinfo=pytz.UTC)
            fecha_hora_reserva = fecha_hora_reserva.astimezone(timezone.get_current_timezone())

            if Reserva.objects.filter(usuario=request.user, fecha_hora_reserva=fecha_hora_reserva).exists():
                return JsonResponse({
                    "status": "error",
                    "message": "Ya tienes una reserva a esa hora."
                }, status=400)
            # Comprobar si la fecha de la reserva es en el pasado
            if fecha_hora_reserva < timezone.now():
                return JsonResponse({
                    "status": "error",
                    "message": "No se pueden hacer reservas en el pasado."
                }, status=400)

            # Obtener el nombre del usuario y el servicio
            nombre_usuario = request.user.get_full_name() or request.user.username
            servicio = data.get('servicio', 'Servicio no especificado')

            # Crear la reserva
            nueva_reserva = Reserva.objects.create(
                usuario=request.user,
                servicio=f"{servicio} - Reservado por: {nombre_usuario}",
                fecha_hora_reserva=fecha_hora_reserva,
                confirmada=True
            )

            return JsonResponse({
                "status": "success",
                "id": nueva_reserva.id,
                "title": nueva_reserva.servicio,
                "start": nueva_reserva.fecha_hora_reserva.isoformat(),
                "confirmada": nueva_reserva.confirmada
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Formato JSON inválido."}, status=400)
        except ValueError:
            return JsonResponse({'message': 'No se puede reservar la misma hora dos veces.'}, status=400)
        except Exception as e:
            # Esto imprimirá el rastro de la pila del error en tu consola del servidor
            traceback.print_exc()
            return JsonResponse({"status": "error", "message": str(e)}, status=500)


@login_required
def get_reservas(request):
    reservas = Reserva.objects.filter(usuario=request.user).values('id', 'fecha_hora_reserva')
    return JsonResponse(list(reservas), safe=False)

@login_required
@require_http_methods({'DELETE'})
def eliminarReserva(request, reserva_id):
    reserva = get_object_or_404(Reserva, pk=reserva_id, usuario=request.user)
    reserva.delete()
    return JsonResponse({"status": "success"}, status = 200)
#Fin de methodos Reserva

def tienda(request):
    return render (request, 'info/tienda.html')

def pago(request):
    return render (request, 'info/pago.html')

def registro(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.email = form.cleaned_data['email']
            user.first_name = form.cleaned_data['first_name']
            user.last_name = form.cleaned_data['last_name']
            user.username = form.cleaned_data['username']
            user.save()
            return redirect('index')
    else:
        form = CustomUserCreationForm()

    return render(request, 'info/registro.html', {'form': form})


def login_view(request):
    error_message = None
    if request.method == 'POST':
        username = request.POST.get('username')  # Cambia 'email' por 'username'
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if user.is_superuser:
                return redirect('dashboard')
            else:
                return redirect('index')
        else:
            error_message = "Nombre de usuario o contraseña incorrectos."
    return render(request, 'info/registro.html', {'error_message': error_message})

def user_api(request):
    users = User.objects.all().values('id', 'username', 'email', 'date_joined')  # Ajusta los campos según tus necesidades
    return JsonResponse(list(users), safe=False)


# funcion para verificar usuarios
def is_superuser(user):
    return user.is_superuser

@login_required
@user_passes_test(is_superuser)
def view_dashboard(request):
    users = User.objects.all()
    return render(request, 'info/dashboard.html', {'users': users})

@login_required
def agendas(request):
    # Filtras las reservas para que solo obtengas las del usuario actual
    reservas_usuario = Reserva.objects.filter(usuario=request.user)

    # Pasas las reservas al contexto del template
    context = {
        'reservas': reservas_usuario
    }
    return render(request, 'info/agendas.html', context)
def productos(request):
    # Lógica para agregar productos al e-commerce
    return render(request, 'info/productos.html')  # Crea este template

# methodos para los productos
def product_api(request):
    products = Product.objects.all().values('id', 'name', 'price', 'image')  # o los campos que necesites
    return JsonResponse(list(products), safe=False)

def product_list(request):
    products = Product.objects.all()
    return render(request, 'product_list.html', {'products': products})

def product_add(request):
    if request.method == 'POST':
        form = ProductForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': form.errors})
    else:
        form = ProductForm()
    return render(request, 'dashboard.html', {'form': form})


@require_http_methods(["POST"])
def edit_product(request, product_id):
    try:
        product = Product.objects.get(pk=product_id)
        form = ProductForm(request.POST, request.FILES, instance=product)
        if form.is_valid():
            form.save()
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': form.errors})
    except Product.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Producto no encontrado'}, status=404)


def get_product(request, product_id):
    try:
        product = Product.objects.get(pk=product_id)
        product_data = {
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'image': product.image.url if product.image else None
        }
        return JsonResponse(product_data)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Producto no encontrado'}, status=404)


@require_http_methods(["DELETE"])
def delete_product(request, product_id):
    try:
        product = Product.objects.get(pk=product_id)
        product.delete()
        return JsonResponse({'success': True})
    except Product.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Producto no encontrado'}, status=404)
