# Tu Radio Latina

## Stream en vivo

El botón **Escuchar** usa la variable `VITE_STREAM_URL` y, si falla, intenta `VITE_STREAM_FALLBACK_URL`.

1. Crea un archivo `.env` en la raíz del proyecto.
2. Agrega tu URL:

```env
VITE_STREAM_URL=http://31.97.168.251:8000/live
VITE_STREAM_FALLBACK_URL=https://radio.turadiolatina.com/live
```

Opcional (por defecto ya viene configurado):

```env
VITE_STREAM_PROXY_PATH=/stream-live
VITE_STREAM_STATUS_URL=http://31.97.168.251:8000/status-json.xsl
```

3. Reinicia el servidor de desarrollo (`npm run dev`).

## Subida de MP3 con Supabase (modo admin)

Para que el botón naranja de subida guarde audios de forma persistente:

1. Configura estas variables en `.env`:

```env
VITE_SUPABASE_URL=TU_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
VITE_SUPABASE_EPISODES_BUCKET=episodes
```

2. En Supabase crea tabla/policies/bucket (`profiles`, `episodes`, `storage.objects`) con RLS.
3. Marca tu usuario en `profiles.is_admin = true`.
4. Inicia sesión admin en la app con tu email/contraseña de Supabase.

Si `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` no están configuradas, el acceso admin y la subida de MP3 quedan deshabilitados.

## Nota importante (HTTP vs HTTPS)

Si tu web está publicada en `https://`, el navegador puede bloquear streams `http://` (mixed content).

En desarrollo con Vite (incluyendo túneles `*.app.github.dev`), la app usa automáticamente `VITE_STREAM_PROXY_PATH` para evitar ese bloqueo.
Para mostrar la canción actual en el panel "Sonando ahora", la app consulta `VITE_STREAM_STATUS_URL` (Icecast `status-json.xsl`).

Para producción, usa una de estas opciones:
- Servir el stream también por `https://`.
- O pasar el stream por un proxy/back-end en tu mismo dominio HTTPS.
