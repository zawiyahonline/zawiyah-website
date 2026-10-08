# =============================================================================
# Zawiyah Online Islamic School - Production Container
# =============================================================================
FROM python:3.11-slim

# Set environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    HOST=0.0.0.0 \
    DATA_DIR=/data

# Create working directory and persistent data directory
WORKDIR /app
RUN mkdir -p /data /app/assets

# Copy application files
COPY . /app

# Ensure correct permissions
RUN chmod -R 755 /app

# Expose standard application port
EXPOSE 8080

# Run production server
CMD ["python3", "server.py"]
