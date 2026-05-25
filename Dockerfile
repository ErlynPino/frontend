# Los archivos estáticos son generados por el step "Build" de Cloud Build
# antes de que Docker construya esta imagen. No se necesita stage de build aquí.
FROM nginx:1.27-alpine

# Copiar los archivos estáticos de Angular (generados por `npm run build`)
COPY dist/frontend/browser /usr/share/nginx/html

# Config de nginx para SPA (client-side routing + caché + compresión)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
