# your_app/exceptions.py
from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    # Llama al manejador de excepciones predeterminado
    response = exception_handler(exc, context)

    # Aquí puedes agregar lógica personalizada para manejar excepciones
    if response is not None:
        response.data['custom_message'] = 'Ha ocurrido un error.'

    return response
