# Link Tracker
Este proyecto es un sistema para rastrear y enmascarar URLs, permitiendo obtener análisis de cuántas veces se accedió a cada enlace, así como también agregar reglas de negocio para el funcionamiento del redireccionamiento.

## Instalación
Para instalar las dependencias del proyecto, ejecuta el siguiente comando:

```bash
npm install
```

## Configuración
El proyecto utiliza variables de entorno para la configuración.
Crea un archivo .env en la raíz del proyecto y configura las variables necesarias. Puedes encontrar un ejemplo en el archivo .env.example.
El proyecto utiliza base de datos Postgresql, deberás tener creada la base de datos previamente para que funcione.

## Uso
### Ejecutar en modo desarrollo
```bash
npm run start:dev
```

Esto iniciará el servidor en modo de desarrollo y estará disponible en http://localhost:3001.

### Ejecutar en modo producción
```bash
npm run start:prod
```
Esto iniciará el servidor en modo de producción.

## Endpoints
### Crear un enlace
```bash
POST /links
```
Crea un enlace a partir de una URL válida y devuelve la URL enmascarada a utilizar.

#### Parámetros de entrada
- <b>url</b> (string): URL válida a enmascarar.
- <b>password</b> (string, opcional): Contraseña opcional para acceder al enlace.

#### Ejemplo de solicitud
```json
{
  "url": "https://www.ejemplo.com",
  "password": "secreto"
}
```

#### Ejemplo de respuesta
```json
{
  "target": "https://www.ejemplo.com",
  "link": "https://maskedurl.com/abcd",
  "valid": true
}
```


### Redireccionar a un enlace
```bash
GET /links/redirect?link=<link>&password=<password>
```
Redirecciona a la URL enmascarada. Si el enlace es inválido, devuelve un error 404.

#### Parámetros de entrada
- <b>link</b> (string): Enlace enmascarado.
- <b>password</b> (string, opcional): Contraseña si se requiere.


### Obtener estadísticas de un enlace
```bash
GET /links/:id/stats
```

Obtiene las estadísticas de cantidad de veces que se redirigió a un enlace.

#### Parámetros de entrada
- <b>id</b> (string): ID del enlace.

#### Ejemplo de respuesta
```json
{
  "count": 5
}
```

#### Invalidar un enlace
```bash
PUT /links/invalidate?link=<link>
```
Invalida un enlace, haciendo que devuelva un error 404 al intentar acceder.

#### Parámetros de entrada
- <b>link</b> (string): Enlace a invalidar.


Recuerda reemplazar <link> y <password> con los valores adecuados en las descripciones de los endpoints.