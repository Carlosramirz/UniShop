document.addEventListener('DOMContentLoaded', function () {
    const datetimeInput = document.getElementById('datetimeInput');
    if (datetimeInput) {
        const now = new Date();
        const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        datetimeInput.min = localDate;
    }

    // Muestra la ventana modal con el horario de atención
    $('#horarioModal').modal('show');

    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'es',
        timeZone: 'America/Santiago',
        initialView: 'dayGridMonth',
        editable: true,
        eventClick: function (info) {
            if (confirm('¿Deseas eliminar esta reserva?')) {
                const eventId = info.event.id;
                fetch(`/eliminarReserva/${eventId}/`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                })
                .then(response => {
                    if (response.ok) {
                        info.event.remove();
                    } else {
                        throw new Error('La solicitud falló con el estado: ' + response.status);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        },
        events: function (fetchInfo, successCallback, failureCallback) {
            fetch('/get_reservas/')
                .then(response => response.json())
                .then(data => {
                    const events = data.map(event => ({
                        id: event.id,
                        title: 'Reservado',
                        start: event.fecha_hora_reserva,
                        end: new Date(new Date(event.fecha_hora_reserva).getTime() + 60 * 60 * 1000).toISOString(),
                        allDay: false
                    }));
                    successCallback(events);
                })
                .catch(error => {
                    failureCallback(error);
                });
        },
    });
    calendar.render();

    const reservationForm = document.getElementById('reservationForm');
    reservationForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const start = datetimeInput.value;

        if (start) {
            fetch('/crearReserva/', {
                method: 'POST',
                body: JSON.stringify({ start: start }),
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || 'Error desconocido al hacer la reserva.');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    const localStart = new Date(data.start + 'Z');
                    const localEnd = new Date(localStart.getTime() + 60 * 60 * 1000);
                    calendar.addEvent({
                        id: data.id,
                        title: 'Reservado',
                        start: localStart.toISOString(),
                        end: localEnd.toString(),
                        allDay: false
                    });
                    reservationForm.reset();

                    showAlert('success', 'Reserva creada exitosamente.');
                } else {
                    console.error('Error al crear la reserva:', data.message);
                    showAlert('danger', data.message);
                }
            })
            .catch(error => {
                showAlert('danger', error.message);
            });
        } else {
            console.error('Fecha y hora de inicio no están definidas');
        }
    });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showAlert(type, message) {
    let alertPlaceholder = document.getElementById('alertPlaceholder');
    if (!alertPlaceholder) {
        const reservationContainer = document.getElementById('calendar-container');
        alertPlaceholder = document.createElement('div');
        alertPlaceholder.id = 'alertPlaceholder';
        reservationContainer.after(alertPlaceholder);
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
        `   <strong>${message}</strong>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('');

    alertPlaceholder.append(wrapper);

    setTimeout(() => {
        $(wrapper).alert('close'); // Cerrar la alerta usando jQuery
    }, 5000);
}