## Para correr la Aplicación
1. Primero Restaurar la base de datos:
Es necesario tener Postgresql y para restaurar `prueba_hilagro.sql` ejecutar el siguiente comando:
    ```
    psql -U [usuario] -h [host] -d [nombre_base_de_datos] < prueba_hilagro.sql
    ```

---

2. Es necesario tener una versión de `Nodejs` 20 para arriba. (Yo tengo la 20.19.5)

Instalar dependencias
```bash
npm install
```
Correr la aplicación
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la magia.

## Usuarios ya disponibles
La contraseña de todos ya es por defecto `123456`

##### Administrador
 * admin@demo.com
##### Supervisores
 * super1@demo.com
 * super2@demo.com
 ##### Vendedores
 * vend1@demo.com
 * vend2@demo.com
 * vend3@demo.com