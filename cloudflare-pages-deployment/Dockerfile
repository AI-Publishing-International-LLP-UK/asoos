# Enhanced ASOOS Diamond SAO Interface - GCP Cloud Run Deployment
FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html/

# Create nginx config for SPA routing
RUN echo 'server {\n\
    listen 8080;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html light.html;\n\
    \n\
    location / {\n\
        try_files $uri $uri/ /light.html;\n\
    }\n\
    \n\
    location /health {\n\
        return 200 "healthy";\n\
        add_header Content-Type text/plain;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]