# First stage: build
FROM python:3.9-slim AS build

WORKDIR /app

# Copy only requirements, to cache them in Docker layer
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Copy the rest of the code
COPY . .

# Second stage: runtime
FROM python:3.9-slim

WORKDIR /app

# Copy from build stage
COPY --from=build /root/.local /root/.local
COPY --from=build /app .

# Make sure scripts in .local are usable:
ENV PATH=/root/.local/bin:$PATH

# Start the service when the container starts
# CMD ["python", "User.py"]