FROM nginx:alpine
COPY index.html /usr/share/nginx/html/
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
RUN chmod -R 755 /usr/share/nginx/html
EXPOSE 8000
