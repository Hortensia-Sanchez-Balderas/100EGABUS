# 📋 INSTRUCCIONES: Crear Vista Dinámica en Supabase

## PASO 1: Crear la Vista en Supabase

1. Ve a tu proyecto Supabase en https://app.supabase.com
2. Selecciona tu proyecto (100EGABUS)
3. En la sidebar izquierda, ve a **SQL Editor**
4. Haz clic en **New Query**
5. Copia y pega TODO el contenido del archivo: `supabase/views/create_vista_paradas_estudiantes.sql`
6. Haz clic en **▶ Run** (Ejecutar)

✅ Deberías ver: "Instruction executed successfully"

---

## PASO 2: Verificar la Vista

En el mismo SQL Editor, ejecuta esta query para ver los datos:

```sql
SELECT * FROM vista_paradas_estudiantes LIMIT 1;
```

Deberías obtener un resultado similar a:

```json
{
  "id": "8a2b4c...",
  "nombre": "Villas de Alcalá OXXO",
  "ubicacion": "Villas de Alcalá",
  "coordenadas": "25.6867,-100.3161",
  "ruta": "Ruta 1",
  "capacidad": 50,
  "estado": "activa",
  "total_estudiantes": 43,
  "saturacion_porcentaje": 86,
  "estudiantes": [
    {
      "id": "...",
      "nombre": "Ana Martínez Luna",
      "escuela": "UANL",
      "horario_ida": "07:00",
      "horario_regreso": "14:00",
      "estado": "activo"
    }
  ],
  "horarios_pico": {
    "ida": "07:00",
    "regreso": "14:00"
  },
  "escuelas": ["UANL", "Preparatoria 17"],
  "actualizado_en": "2026-05-21T18:30:45.123Z"
}
```

---

## PASO 3: El componente Stops.tsx se actualizará automáticamente

Una vez creada la vista, el app buscará automáticamente desde:
- `vista_paradas_estudiantes` en lugar de hacer 2 queries

Esto proporciona:
✅ **Saturación %** - Cálculo automático
✅ **Estudiantes agrupados** - Sin hardcoding
✅ **Horarios pico** - Hora más usada
✅ **Escuelas por parada** - Demanda educativa
✅ **Actualización en tiempo real** - Fresh data cada consulta

---

## QUERIES Adicionales Disponibles

### Ver paradas saturadas (>80%):
```sql
SELECT nombre, total_estudiantes, saturacion_porcentaje, capacidad
FROM vista_paradas_estudiantes
WHERE saturacion_porcentaje > 80
ORDER BY saturacion_porcentaje DESC;
```

### Ver horarios pico:
```sql
SELECT nombre, horarios_pico
FROM vista_paradas_estudiantes
WHERE total_estudiantes > 0;
```

### Ver demanda por escuela/parada:
```sql
SELECT nombre, escuelas, total_estudiantes
FROM vista_paradas_estudiantes
WHERE total_estudiantes > 0;
```

### Ver necesidad de capacidad:
```sql
SELECT nombre, total_estudiantes, capacidad, 
       (total_estudiantes - capacidad) AS deficit_capacidad
FROM vista_paradas_estudiantes
WHERE total_estudiantes > capacidad;
```

---

## ¿Por qué usar VIEW en lugar de columna JSONB?

| Aspecto | VIEW | Columna JSONB |
|---------|------|---------------|
| **Duplicación de datos** | ❌ No | ⚠️ Sí (se actualiza manual) |
| **Performance** | ✅ Óptimo | ⚠️ Más peso por fila |
| **Actualizaciones** | ✅ Automáticas | ❌ Manual |
| **Flexibilidad queries** | ✅ Alta | ⚠️ Limitada |
| **Almacenamiento** | ✅ Eficiente | ⚠️ Redundante |

---

## Beneficios para el Dashboard

Con esta vista puedes extraer automáticamente:

1. **📊 Usuarios por parada** → `total_estudiantes`
2. **🔴 Saturación** → `saturacion_porcentaje`
3. **🕐 Horario más usado** → `horarios_pico`
4. **🏫 Demanda por colonia** → Agrupar por `ubicacion`
5. **🚐 Capacidad requerida** → `total_estudiantes / capacidad`

---

## Próximos Pasos

✅ Ejecutar el SQL en Supabase
✅ El componente Stops.tsx ya estará esperando la vista
✅ Los datos se mostrarán dinámicamente en tiempo real
