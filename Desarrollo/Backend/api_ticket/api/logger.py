import logging
from logging.handlers import RotatingFileHandler

# Create a logger object
logger = logging.getLogger(__name__)  # This will use the name of the module it's used in
logger.setLevel(logging.DEBUG)  # Set the default level to DEBUG

# Define a formatter for the log messages
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Create a file handler to log to a file
"""file_handler = RotatingFileHandler('apps/app.log', maxBytes=1e6, backupCount=5)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)"""

# Create a console handler to also output logs to the console
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(formatter)

# Add the handlers to the logger
"""logger.addHandler(file_handler)"""
logger.addHandler(console_handler)