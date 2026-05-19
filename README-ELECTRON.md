# 100EGABUS - Guía de Compilación como Ejecutable

Este proyecto ahora puede compilarse como una aplicación de escritorio usando **Electron**.

## Instalación

Las dependencias necesarias ya están instaladas:
- `electron` - Framework para crear aplicaciones de escritorio
- `electron-builder` - Tool para empaquetar como ejecutable
- `concurrently` - Para ejecutar múltiples procesos
- `wait-on` - Para esperar a que Vite esté listo

## Compilar como Ejecutable

### Windows (Genera .exe instalable)

```bash
npm run build-electron
```

Esto creará un instalador en la carpeta `dist/`:
- `dist/100EGABUS Setup 1.0.0.exe` - Instalador
- `dist/100EGABUS 1.0.0.exe` - Ejecutable portable

### Ejecutar en Desarrollo

Para probar la aplicación mientras desarrollas:

```bash
npm run dev-electron
```

Esto iniciará:
1. El servidor Vite en `http://localhost:5173`
2. La aplicación Electron que cargará la página

## Después de Compilar

1. Los archivos ejecutables estarán en la carpeta `dist/`
2. Busca el archivo `.exe` (instalador o portable)
3. Haz doble clic para ejecutar o instalar
4. Se creará un acceso directo en el escritorio automáticamente

## Archivos Modificados

- `electron-main.js` - Configuración principal de Electron
- `preload.js` - Scripts de seguridad
- `package.json` - Scripts nuevos y configuración de compilación

## Notas Importantes

- Se recomienda compilar después de hacer cambios finales
- El ejecutable tendrá la versión `1.0.0` (modifica en `package.json` si necesario)
- El instalador crea un acceso directo en el escritorio
