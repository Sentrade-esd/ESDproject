# FROM python:3.11-slim-bookworm

# WORKDIR /app

# # Copy only requirements, to cache them in Docker layer
# COPY requirements.txt .
# RUN pip install -r requirements.txt

# # Copy the rest of the code
# COPY . .

# # Uncomment this if you want to install xformers
# # RUN pip install xformers

# # Uncomment this if you want to start the service when the container starts
# # CMD ["python", "sentimentApp.py"]

# First stage: build
FROM python:3.11-slim AS build

WORKDIR /app

# Install build-essential
# RUN apt-get update && apt-get install -y build-essential

# Copy only requirements, to cache them in Docker layer
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Copy the rest of the code
COPY . .

# Second stage: runtime
FROM python:3.11-slim

WORKDIR /app

# Copy from build stage
COPY --from=build /root/.local /root/.local
COPY --from=build /app .

# Make sure scripts in .local are usable:
ENV PATH=/root/.local/bin:$PATH

# Uncomment this if you want to start the service when the container starts
# CMD ["python", "your_app.py"]
