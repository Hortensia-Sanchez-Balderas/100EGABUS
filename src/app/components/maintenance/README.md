# Módulo de Mantenimiento - 100EGABUS

Este módulo es completamente independiente y se puede migrar fácilmente a otro proyecto.

## 📁 Estructura del Módulo

```
src/app/components/maintenance/
├── Maintenance.tsx              # Componente para administradores (CRUD completo)
├── OperatorMaintenance.tsx      # Componente para operadores (solo alertas)
├── SUPABASE_QUERIES.sql         # Queries SQL para crear las tablas
└── README.md                    # Este archivo
```

## 🔧 Instalación

### 1. Ejecutar Queries en Supabase

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido de `SUPABASE_QUERIES.sql`
4. Ejecuta todas las queries en orden
5. Verifica que la tabla `mantenimientos` se creó correctamente

### 2. Integrar en el Menú de Administrador

**Archivo a modificar:** `/workspaces/default/code/src/app/App.tsx`

#### Paso 2.1: Agregar el import (línea ~17)
```typescript
// Añade esta línea después de los otros imports
import { Maintenance } from './components/maintenance/Maintenance';
```

#### Paso 2.2: Agregar al type AdminView (línea ~28)
```typescript
// Modifica esta línea:
type AdminView = 'dashboard' | 'students' | 'stops' | 'routes' | 'units' | 'drivers' | 'trips' | 'incidents' | 'reports' | 'optimization' | 'users' | 'maintenance';
```

#### Paso 2.3: Agregar al renderAdminView (línea ~105-131)
```typescript
// Añade este case antes del default:
case 'maintenance':
  return <Maintenance />;
```

#### Paso 2.4: Agregar al menú adminMenuItems (línea ~151-163)
```typescript
// Añade este item después de 'drivers' y antes de 'trips':
{ id: 'maintenance' as AdminView, label: 'Mantenimiento', icon: Wrench },
```

#### Paso 2.5: Importar el ícono Wrench (línea ~2)
```typescript
// Modifica la línea de imports de lucide-react para incluir Wrench:
import { LayoutDashboard, Users, MapPin, FileText, Menu, X, Bus, Route, Wrench, UserCircle, ClipboardList, AlertTriangle, Zap, LogOut, Clock, Shield } from 'lucide-react';
```

### 3. Integrar en el Menú de Operador

**Mismo archivo:** `/workspaces/default/code/src/app/App.tsx`

#### Paso 3.1: Agregar el import (línea ~18-21)
```typescript
// Añade esta línea después de los otros imports de operator
import { OperatorMaintenance } from './components/maintenance/OperatorMaintenance';
```

#### Paso 3.2: Agregar al type OperatorView (línea ~29)
```typescript
// Modifica esta línea:
type OperatorView = 'welcome' | 'trips' | 'incidents' | 'routes' | 'units' | 'maintenance';
```

#### Paso 3.3: Agregar al renderOperatorView (línea ~134-149)
```typescript
// Añade este case antes del default:
case 'maintenance':
  return <OperatorMaintenance />;
```

#### Paso 3.4: Agregar al menú operatorMenuItems (línea ~165-171)
```typescript
// Añade este item al final del array:
{ id: 'maintenance' as OperatorView, label: 'Mantenimiento', icon: Wrench },
```

## 📋 Resumen de Cambios en App.tsx

**Total de modificaciones:** 8 líneas en un solo archivo

1. ✅ Import de `Maintenance` (admin)
2. ✅ Import de `OperatorMaintenance` (operator)
3. ✅ Import del ícono `Wrench`
4. ✅ Agregar 'maintenance' a `AdminView`
5. ✅ Agregar 'maintenance' a `OperatorView`
6. ✅ Agregar case en `renderAdminView()`
7. ✅ Agregar case en `renderOperatorView()`
8. ✅ Agregar item en `adminMenuItems`
9. ✅ Agregar item en `operatorMenuItems`

## 🎯 Funcionalidades

### Para Administradores:
- ✅ CRUD completo de mantenimientos
- ✅ Calendario de mantenimientos programados
- ✅ Historial completo por unidad
- ✅ Filtros por unidad y estado
- ✅ Vista de lista y vista de historial
- ✅ Estadísticas de costos y mantenimientos

### Para Operadores:
- ✅ Alertas de mantenimientos próximos (7 días)
- ✅ Lista de todos los mantenimientos pendientes
- ✅ Indicadores de urgencia con códigos de color
- ✅ Información detallada de costos
- ✅ Solo lectura (no pueden crear/editar/eliminar)

## 🗄️ Estructura de la Base de Datos

### Tabla: `mantenimientos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (auto-generado) |
| unidad_id | TEXT | Número de unidad (ej: "101") |
| tipo | TEXT | 'preventivo', 'correctivo', 'emergencia' |
| fecha_programada | DATE | Fecha en que está programado |
| fecha_realizada | DATE | Fecha en que se realizó (nullable) |
| descripcion | TEXT | Descripción del mantenimiento |
| costo | NUMERIC | Costo en pesos mexicanos |
| estado | TEXT | 'pendiente', 'completado', 'cancelado' |
| notas | TEXT | Notas adicionales (nullable) |
| created_at | TIMESTAMP | Fecha de creación del registro |

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Políticas de acceso configuradas para CRUD completo

## 🚀 Migración a Visual Studio Code

Para migrar este módulo a otro proyecto:

1. Copia la carpeta completa `maintenance/`
2. Ejecuta las queries SQL en tu nueva base de datos Supabase
3. Importa `supabase` desde la ubicación correcta en tu proyecto
4. Modifica tu App.tsx o router según las instrucciones arriba
5. Asegúrate de tener instalados los íconos de `lucide-react`

## 📦 Dependencias

Este módulo requiere:
- React (useState, useEffect)
- @supabase/supabase-js
- lucide-react (para los íconos)

No tiene dependencias de otros componentes del proyecto.

## 💡 Notas

- El módulo es completamente independiente
- Puede funcionar en cualquier proyecto con Supabase
- Solo necesitas ajustar la ruta del import de `supabase`
- Los estilos usan Tailwind CSS
