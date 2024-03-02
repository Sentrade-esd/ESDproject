# FROM python:3.11-slim-bookworm

# WORKDIR /app

# COPY requirements.txt .

# RUN pip install -r requirements.txt

# COPY . .

# RUN chmod +x ./healthcheck.sh

# RUN pip install -r requirements.txt

# First stage: build
FROM python:3.11-slim AS build

WORKDIR /app

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

RUN chmod +x healthcheck.sh
# Make sure scripts in .local are usable:
ENV PATH=/root/.local/bin:$PATH

# Uncomment this if you want to start the service when the container starts
# CMD ["python", "your_app.py"]