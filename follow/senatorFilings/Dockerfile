
# First stage: build
FROM python:3.9.12-slim AS build

WORKDIR /app

# Install build-essential
RUN apt-get update && apt-get install -y build-essential libxml2-dev libxslt1-dev libxslt-dev libblas-dev liblapack-dev gfortran libfreetype6-dev zlib1g-dev python3-dev
RUN pip install --upgrade pip setuptools

# Copy only requirements, to cache them in Docker layer
COPY requirements.txt .
RUN pip install --user -r requirements.txt



# Copy the rest of the code
COPY . .

# Second stage: runtime
FROM python:3.9.12-slim

WORKDIR /app

# Copy from build stage
COPY --from=build /root/.local /root/.local
COPY --from=build /app .

# Make sure scripts in .local are usable:
ENV PATH=/root/.local/bin:$PATH
# CMD ["python", "main.py"]
