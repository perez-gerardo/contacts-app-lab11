# Seleccionar imagen base de Node ligera
FROM node:18-alpine

# Instalar dependencias necesarias para compilar SQLite nativo en Alpine si es necesario
RUN apk add --no-cache python3 make g++ 

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el código del backend y frontend
COPY . .

# Exponer el puerto del monolito
EXPOSE 3000

# Comando para levantar la aplicación en producción
CMD ["npm", "start"]
