# 🏗️ GestorPalet - Guía de Configuración

## ✅ Estado de Sincronización

Se han corregido todos los errores de compatibilidad entre:
- ✅ **HTML** - Todos los elementos y IDs corriges
- ✅ **CSS** - Todas las clases y estilos completados
- ✅ **JavaScript** - Funciones sincronizadas con elementos HTML
- ✅ **SQL** - Tablas y políticas RLS actualizadas

## 🚀 Pasos de Instalación

### 1. Crear el Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear una cuenta
2. Crear un nuevo proyecto (anotar la URL y las keys)

### 2. Ejecutar el Schema SQL

1. En el panel de Supabase, ir a **SQL Editor**
2. Crear una nueva query vacía
3. Copiar **TODO** el contenido de `schema.sql`
4. Ejecutar la query

### 3. Configurar las Credenciales en app.js

Abrir `app.js` y reemplazar:

```javascript
const SUPABASE_URL = 'https://tuproyecto.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

Con **tus** valores:
- `SUPABASE_URL`: Copia la URL del proyecto (Settings → API)
- `SUPABASE_KEY`: Copia el **anon_public_key** (Settings → API)

### 4. Abrir en el Navegador

Abrir `index.html` en un navegador web. ¡Funciona!

---

## 📋 Estructura de Datos

### Tabla: `palets`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | ID único (auto) |
| nombre | VARCHAR | Nombre del palet |
| usuario_creador_id | UUID | ID del usuario que lo creó |
| fecha_creacion | TIMESTAMP | Fecha de creación |
| created_at | TIMESTAMP | Timestamp de creación |

### Tabla: `paquetes`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | BIGINT | ID único (auto) |
| palet_id | BIGINT | Referencia al palet |
| nombre | VARCHAR | Nombre del producto |
| codigo | VARCHAR | Código de barras (opcional) |
| cantidad | INTEGER | Cantidad de paquetes |
| vencimiento | DATE | Fecha de vencimiento (opcional) |
| fecha_creacion | TIMESTAMP | Fecha de creación |
| created_at | TIMESTAMP | Timestamp de creación |

---

## 🎨 Características Implementadas

✨ **Palets**: Crear, editar, eliminar palets
📦 **Paquetes**: Agregar productos con cantidad y fecha de vencimiento
⏰ **Vencimientos**: Indicadores visuales (vencido/próximo a vencer/ok)
🔍 **Búsqueda**: Buscar productos por nombre o código
📊 **Resumen**: Estadísticas y export a Excel
🔄 **Sincronización**: Actualizaciones en tiempo real con Supabase
🎯 **Interfaz Responsive**: Optimizada para móviles y desktop

---

## 🔧 Problemas Comunes

### ❌ Error: "new row violates row-level security policy for table "palets""

**Causa**: Las políticas RLS están bloqueando las inserciones.

**Solución (ejecutar en orden)**:

1. En Supabase → **SQL Editor** → Nueva query vacía
2. Copiar TODO el contenido de `FIX_RLS_POLICIES.sql`
3. Ejecutar (botón play)
4. Esperar a que aparezca: "Politicas RLS reconfiguradas exitosamente ✅"
5. **Recargar** la página web de la app
6. Intentar crear un nuevo palet → **Debe funcionar ✅**

**Si sigue sin funcionar**:
- Verificar que SUPABASE_URL y SUPABASE_KEY son correctos en `app.js`
- Abrir Console del navegador (F12 → Console) para ver errores exactos

---

### Error: "Cannot read property 'createClient' of undefined"
**Solución**: La librería de Supabase no se cargó. Verificar conexión a internet.

### Error: "Row-level security violation" en búsqueda/resumen
**Solución**: Ejecutar nuevamente `FIX_RLS_POLICIES.sql` en Supabase.

### No aparecen datos guardados
**Solución**: 
1. Verificar que SUPABASE_URL y SUPABASE_KEY son correctos
2. Revisar en la consola del navegador (F12) si hay errores
3. Verificar que las tablas existen en Supabase (SQL Editor → "palets" y "paquetes" deben aparecer)
4. Si no aparecen las tablas, ejecutar TODO el contenido de `schema.sql`

---

## 📱 Guía de Uso

### Pestañas Principales
- **📦 Palets**: Vista principal con todos los palets y paquetes
- **📊 Resumen**: Estadísticas y export a Excel
- **🔍 Buscar**: Búsqueda de productos en todos los palets

### Crear un Palet
1. Tocar el botón **+** (FAB)
2. Ingresar nombre
3. Tocar "Guardar"

### Agregar Paquete a un Palet
1. Tocar el palet para expandir
2. Tocar "**+ Paquete**"
3. Completar: nombre, código (opcional), cantidad, vencimiento
4. Tocar "Agregar"

### Ver Info de Vencimiento
- 🟢 **Verde**: Vence en más de 30 días
- 🟡 **Amarillo**: Vence en 30 días o menos
- 🔴 **Rojo**: Producto vencido

---

## 💾 Archivos

- `index.html` - Estructura HTML
- `styles.css` - Estilos CSS (COMPLETADO ✅)
- `app.js` - Lógica JavaScript + conexión Supabase
- `schema.sql` - Estructura de base de datos (ACTUALIZADO ✅)

---

## 🔐 Seguridad (Producción)

Para usar en producción, modificar `schema.sql`:
- Cambiar RLS policies para validar `auth.uid()`
- Implementar autenticación de usuarios
- Validar datos en backend

---

**¿Preguntas?** Revisar los comentarios en el código de cada archivo.
