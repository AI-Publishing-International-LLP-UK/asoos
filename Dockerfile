FROM nginx:alpine

# Copy the MOCOA interface files
COPY mocoa-current.html /usr/share/nginx/html/index.html
COPY mocoa-current.html /usr/share/nginx/html/mocoa-current.html
COPY index.html /usr/share/nginx/html/main.html
COPY sally-port-auth-page.html /usr/share/nginx/html/auth.html
COPY test-dana-voice.html /usr/share/nginx/html/voice-test.html

# Create nginx config for Cloud Run
RUN echo 'server { listen 8080; server_name _; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
