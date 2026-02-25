# 🔴 Error RLS - Solución Rápida

## El Error
```
Error: new row violates row-level security policy for table "palets"
```

## ✅ Solución en 3 pasos

### PASO 1️⃣: Ir a Supabase
- Abrir Supabase (https://supabase.com)
- Ingresar al proyecto
- Ir a **SQL Editor** (panel izquierdo)

### PASO 2️⃣: Ejecutar el Script de Limpieza
- Hacer clic en **Nueva query**
- Copiar TODO el contenido del archivo `FIX_RLS_POLICIES.sql`
- Pegar el contenido en el editor
- Hacer clic en el botón **play** (ejecutar)

### PASO 3️⃣: Verificar que Funcionó
- Debe aparecer el mensaje: `Politicas RLS reconfiguradas exitosamente ✅`
- Si aparece error, **COPIAR el error** y revisar la sección "Errores Adicionales" abajo

---

## 🔄 Después de Ejecutar

1. **Cierra la pestaña** del navegador con la app
2. **Abre nuevamente** `index.html`
3. Intenta crear un nuevo palet
4. **Debe funcionar ahora** ✅

---

## ⚠️ Si Sigue Sin Funcionar

### Verificar Credenciales
Abrir `app.js` línea 2-3:
```javascript
const SUPABASE_URL = 'https://tuproyecto.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6I...';
```
- ¿Son tus URLs y KEYs reales?
- ¿No tienen espacios o caracteres rotos?

### Verificar Tablas Existen
En Supabase SQL Editor:
```sql
SELECT * FROM palets LIMIT 1;
```
- ¿Funciona? → Sí = Las tablas existen ✅
- ¿Error "Tabla no existe"? → No ejecutaste `schema.sql`

### Verificar Navegador
Abrir DevTools (F12 → Console):
- ¿Aparece algún error rojo?
- Si hay, **COPIAR el error** y revisar abajo

---

## 🐛 Errores Específicos

### "Usuario anónimo no tiene permisos"
**Causa**: Políticas RLS requieren usuario autenticado  
**Solución**: → Ejecutar `FIX_RLS_POLICIES.sql` ✅

### "undefined is not a function"
**Causa**: Supabase no cargó  
**Solución**: Verificar que `index.html` tiene acceso a internet

### "Table "palets" does not exist"
**Causa**: No ejecutaste `schema.sql`  
**Solución**:
1. SQL Editor → Nueva query
2. Copiar TODO `schema.sql`
3. Ejecutar

---

## 💡 Pro Tips

- **No cambiar app.js de SUPABASE_KEY**: Es la key pública (anon), está bien exponerla
- **¿Datos no aparecen?**: Abrir DevTools (F12) → Network y ver si las requests a Supabase funcionan
- **¿Datos se guardan pero no se ven?**: Recargar página (F5)

---

**¿Aún hay problemas?** Escribir el error exacto de la consola (F12 → Console) 🚀
