# Use Python 3.11 as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install Node.js for frontend build
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY sg-school-frontend/package*.json ./sg-school-frontend/
COPY sg_school_backend/requirements.txt ./sg_school_backend/

# Install dependencies
RUN cd sg-school-frontend && npm ci
RUN cd sg_school_backend && pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Build frontend and copy to backend static folder
RUN cd sg-school-frontend && npm run build
RUN cp -r sg-school-frontend/dist/* sg_school_backend/src/static/

# Expose port
EXPOSE 8080

# Set environment variables
ENV FLASK_ENV=production
ENV PORT=8080

# Start the application
CMD ["python", "sg_school_backend/src/main.py"] 