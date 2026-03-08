# Stage 1: Build Python environment
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Environment
ENV PYTHONUNBUFFERED=1

# Start worker
CMD ["python", "main.py"]
