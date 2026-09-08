<div align="center">
  <a href="https://chromewebstore.google.com/detail/roedex/fgdehjebfkbdefdnenpgjejjnhlkchjh" target="_blank">
    <img src="public/logo.png" alt="Logotipo de ROEDEX" width="136" style="filter: drop-shadow(0 0 24px rgba(251, 146, 60, 0.45));" />
  </a>
  
  <h1 align="center" style="font-size: 2.2rem; font-weight: 900; letter-spacing: 2px;">⚡ HERRAMIENTA DE ACOMPAÑAMIENTO ROEDEX</h1>
  
  <p align="center"><b>La suite definitiva de superposición táctica y rastreador en tiempo real para <i>Roots of Embervault</i></b></p>
  <p align="center"><i>Motor de Sincronización a 60 FPS • Analizador de Paquetes en Sub-milisegundos • 100% Lado Cliente y Seguro Anti-Cheat</i></p>

  <p align="center">
    <a href="README.md"><b>🇺🇸 English</b></a> &nbsp;•&nbsp; 
    <a href="README.es.md"><b>🇪🇸 Español</b></a> &nbsp;•&nbsp; 
    <a href="README.ru.md"><b>🇷🇺 Русский</b></a> &nbsp;•&nbsp; 
    <a href="README.ko.md"><b>🇰🇷 한국어</b></a>
  </p>

  <p align="center">
    <a href="https://chromewebstore.google.com/detail/roedex/fgdehjebfkbdefdnenpgjejjnhlkchjh" target="_blank">
      <img src="https://img.shields.io/badge/Chrome_Web_Store-v0.0.5-22d3ee?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Web Store" />
    </a>
    <img src="https://img.shields.io/badge/Versi%C3%B3n-v0.0.5_Estable-3b82f6?style=for-the-badge&logo=github&logoColor=white" alt="Versión 0.0.5" />
    <img src="https://img.shields.io/badge/Motor-60_FPS_Sync-8b5cf6?style=for-the-badge&logo=speedtest&logoColor=white" alt="60 FPS" />
    <img src="https://img.shields.io/badge/Seguridad-Anti--Cheat_Seguro-10b981?style=for-the-badge&logo=shield&logoColor=white" alt="Anti-Cheat Seguro" />
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19.0.0-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.7" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind 4" />
    <img src="https://img.shields.io/badge/Vite-6.4-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Licencia-MIT-10b981?style=flat-square" alt="Licencia MIT" />
  </p>

  <p align="center">
    <a href="#-características-clave"><b>🌟 Características</b></a> &nbsp;•&nbsp; 
    <a href="#-novedades-en-v005"><b>📢 Novedades</b></a> &nbsp;•&nbsp; 
    <a href="#-rendimiento-del-motor-y-benchmarks"><b>⚡ Rendimiento</b></a> &nbsp;•&nbsp; 
    <a href="#-atajos-de-teclado"><b>🎮 Atajos</b></a> &nbsp;•&nbsp; 
    <a href="#️-guía-de-instalación"><b>🛠️ Instalación</b></a> &nbsp;•&nbsp; 
    <a href="#-créditos-y-agradecimientos"><b>🏆 Créditos</b></a>
  </p>
</div>

> [!IMPORTANT]
> **Aviso Legal del Proyecto de la Comunidad y Atribuciones:**  
> ROEDEX es una herramienta independiente gestionada por la comunidad y **no** está auditada ni respaldada oficialmente por **Ruyui Studios**.  
> Las funciones avanzadas de mapas y los rastreadores de coordenadas funcionan gracias a los datos brutos de mapas proporcionados generosamente por **Voxel Queen** (Co-Fundadora de *Roots of Embervault*).

---

## 📖 Tabla de Contenidos
1. [🌟 Resumen](#-resumen)
2. [✨ Características Clave](#-características-clave)
3. [⚡ Rendimiento del Motor y Benchmarks](#-rendimiento-del-motor-y-benchmarks)
4. [📢 Novedades en v0.0.5](#-novedades-en-v005)
5. [🎮 Atajos de Teclado](#-atajos-de-teclado)
6. [🔒 Seguridad y Privacidad](#-seguridad-y-privacidad)
7. [🛠️ Guía de Instalación](#️-guía-de-instalación)
8. [🏆 Créditos y Agradecimientos](#-créditos-y-agradecimientos)
9. [🤝 Soporte y Contribuciones](#-soporte-y-contribuciones)

---

## 🌟 Resumen

**ROEDEX** es una extensión de superposición en el lado del cliente premium y no intrusiva para *Roots of Embervault*. Al leer de forma pasiva el tráfico entrante de WebSockets, ROEDEX proporciona a los jugadores acceso instantáneo a estadísticas en tiempo real, rastreadores de aparición, registros de botín y compañeros interactivos.

Construido utilizando **Manifest V3**, **React**, y **Tailwind CSS**, cuenta con una hermosa interfaz de usuario flotante con estilo Glassmorphism que coincide con la sensación de alta calidad de los paneles de juego AAA.

---

## ✨ Características Clave

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🗺️ Radar Táctico y Minimapa Dinámico</h3>
      <p>Renderizado en lienzo fuera de pantalla en tiempo real sin tirones del DOM. Impulsado por Web Workers dedicados para pathfinding A*, enrutador automático de recuperación tras muerte y cuenta atrás de reapariciones.</p>
      <p>
        <img src="https://img.shields.io/badge/Motor-Canvas_Offscreen-8b5cf6?style=flat-square" />
        <img src="https://img.shields.io/badge/A*-Web_Worker-3b82f6?style=flat-square" />
        <img src="https://img.shields.io/badge/O(1)-Spatial_Hash-10b981?style=flat-square" />
      </p>
    </td>
    <td width="50%" valign="top">
      <h3>🏪 Inteligencia de Mercado y Bazar</h3>
      <p>Libros de órdenes en vivo, gráficos de tendencia de precios en miniatura (sparklines), vista en cuadrícula de bazar y telemetría de ganancias por hora (XP/h, Piedras Rúnicas/h, Oro/h) en el HUD.</p>
      <p>
        <img src="https://img.shields.io/badge/Datos-Sparklines-f59e0b?style=flat-square" />
        <img src="https://img.shields.io/badge/En_Vivo-Libro_de_Órdenes-06b6d4?style=flat-square" />
        <img src="https://img.shields.io/badge/Telemetría-HUD_XP%2FOro-ec4899?style=flat-square" />
      </p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>⚔️ HUD de Combate y Durabilidad</h3>
      <p>Monitores de durabilidad de armas y armaduras en tiempo real, barras de vida con fijación de objetivo y alertas visuales de baja salud. Evita la rotura imprevista de equipo valioso.</p>
      <p>
        <img src="https://img.shields.io/badge/Alertas-Aviso_Durabilidad-ef4444?style=flat-square" />
        <img src="https://img.shields.io/badge/HUD-Fijar_Objetivo-3b82f6?style=flat-square" />
        <img src="https://img.shields.io/badge/Pulso-Brillo_Baja_HP-f43f5e?style=flat-square" />
      </p>
    </td>
    <td width="50%" valign="top">
      <h3>🤖 Compañeros de IA Interactivos</h3>
      <p>Cuatro personalidades únicas (<b>Bob</b>, <b>Kaya</b>, <b>Lia</b> y <b>Crash</b>) con expresiones faciales animadas estilo CRT y comentarios dinámicos en combate y botines raros.</p>
      <p>
        <img src="https://img.shields.io/badge/Personajes-4_Únicos-a855f7?style=flat-square" />
        <img src="https://img.shields.io/badge/Animación-Rostros_CRT-14b8a6?style=flat-square" />
        <img src="https://img.shields.io/badge/Estado-Reactivo_Eventos-6366f1?style=flat-square" />
      </p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🔍 Búsqueda Global Instantánea</h3>
      <p>Buscador activado por atajo (<code>Ctrl + Shift + F</code>) que permite consultas difusas instantáneas entre todos los NPCs, tablas de botín, recursos y misiones del juego.</p>
      <p>
        <img src="https://img.shields.io/badge/Atajo-Ctrl+Shift+F-64748b?style=flat-square" />
        <img src="https://img.shields.io/badge/Búsqueda-DB_LOOKUP-10b981?style=flat-square" />
        <img src="https://img.shields.io/badge/Velocidad-%3C5ms-22c55e?style=flat-square" />
      </p>
    </td>
    <td width="50%" valign="top">
      <h3>🎨 Arquitectura Glassmorphism Obsidian</h3>
      <p>Interfaz flotante personalizable con redimensionamiento en 8 direcciones, alternancia de diseño (columna/fila) y ventanas desacoplables que memorizan sus posiciones exactas.</p>
      <p>
        <img src="https://img.shields.io/badge/UI-Glassmorphism-f59e0b?style=flat-square" />
        <img src="https://img.shields.io/badge/Tamaño-8_Direcciones-8b5cf6?style=flat-square" />
        <img src="https://img.shields.io/badge/Ventanas-Desacoplables-06b6d4?style=flat-square" />
      </p>
    </td>
  </tr>
</table>

---

## ⚡ Rendimiento del Motor y Benchmarks

ROEDEX está diseñado con estándares de rendimiento de nivel AAA. Opera puramente como un espectador fuera de proceso sin sobrecarga en el lienzo del juego:

| Métrica / Subsistema | Benchmark | Implementación de Ingeniería |
| :--- | :---: | :--- |
| **Estabilidad de FPS** | **60 FPS Sólidos** | `RafScheduler.ts` sincroniza todas las actualizaciones en un bucle único |
| **Consumo de Memoria** | **< 45 MB** | Renderizado fuera de pantalla y depuración automática de registros cada 30 días |
| **Latencia de Paquetes** | **< 1 ms** | Opera directamente en el contexto espectador WebSocket en `world: MAIN` |
| **Velocidad de Pathfinding** | **< 3 ms / consulta** | Algoritmo A* con MinHeap aislado en un Web Worker dedicado |
| **Arquitectura de Paquete** | **Fragmentos < 500 kB** | División manual de módulos externos (`vendor_charts`, `vendor_motion`, `vendor_db`) |
| **Privacidad de Datos** | **100% Local** | Cero telemetría externa; almacenamiento en IndexedDB con procesamiento por lotes |

---

## 📢 Novedades en v0.0.5

*   🔔 **Banner de Novedades:** Notificación animada con estilo Glassmorphic que avisa de las actualizaciones con acceso directo al registro de cambios.
*   🏪 **Centro de Mercado y Economía:** Listados en vivo, gráficos de tendencias de precios y pestaña de análisis de mercado.
*   📊 **Panel de Perfil y Estadísticas:** Resumen diario de juego, registros de combate y estadísticas históricas completas.
*   🔍 **Buscador Global:** Atajo de teclado para buscar instantáneamente entre NPCs, recursos, misiones y tablas de botín.
*   ⚡ **Rendimiento y Motor a 60 FPS:** Reducción del paquete en más del 50%, renderizado fuera de pantalla y sincronización RAF.
*   🗺️ **Enrutador Dinámico de Puntos de Ruta:** Navegación multizona con Web Workers y ruta automática a tu punto de muerte.
*   ❤️ **Barras de Salud de Objetivo y Jugador:** Barras de vida independientes con alertas visuales de salud baja.
*   🛡️ **Almacenamiento Reforzado:** Base de datos IndexedDB unificada con guardado por lotes y respaldo de emergencia.

---

## 🎮 Atajos de Teclado

Todos los atajos de teclado pueden reconfigurarse en el panel **Ajustes → Controles**:

| Acción | Atajo Predeterminado | Descripción |
| :--- | :---: | :--- |
| **Búsqueda Global Instantánea** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd> | Búsqueda difusa instantánea entre NPCs, botines y recursos. |
| **Minimizar / Maximizar HUD** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>M</kbd> | Contrae la interfaz completa en un orbe flotante animado. |
| **Alternar Modo de Diseño** | <kbd>Shift</kbd> + <kbd>H</kbd> | Alterna entre barra lateral vertical y barra horizontal. |
| **Restablecer Posiciones** | <kbd>Shift</kbd> + <kbd>R</kbd> | Restablece las dimensiones y posiciones a los valores predeterminados. |
| **Modo Bloqueo / Clic Transparente** | <kbd>Shift</kbd> + <kbd>U</kbd> | Bloquea la UI para transferir los clics directamente al juego. |

---

## 🔒 Seguridad y Privacidad

Creemos en la transparencia absoluta. **ROEDEX recopila CERO datos de usuario.**

*   **100% en el Cliente:** Todos los ajustes, historiales de botín y diseños personalizados se almacenan localmente en tu máquina a través de IndexedDB/localStorage.
*   **Sin Inyección:** ROEDEX no inyecta scripts ni modifica el cliente de juego. Cumple con los sistemas anti-trampas.
*   **Escucha Pasiva:** La extensión funciona puramente como un espectador del tráfico WebSocket del juego para mostrar los datos.
*   **Permisos Acotados:** La extensión solo solicita permiso de host para el dominio oficial del juego.

Para más detalles, consulta nuestra [Política de Privacidad](PRIVACY_POLICY.md).

---

## 🛠️ Guía de Instalación

### Opción A: Web Store (Recomendado)
1. Visita la página de **ROEDEX** en Chrome Web Store.
2. Haz clic en **Añadir a Chrome**.
3. Fija la extensión en la barra de herramientas de tu navegador.
4. Inicia el juego; ¡la extensión se inicializará automáticamente!

### Opción B: Modo Desarrollador (Desde el Código Fuente)
1. Clona el repositorio:
   ```bash
   git clone https://github.com/LordCyberr/ROEDEX.git
   ```
2. Navega al directorio e instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el compilador:
   ```bash
   npm run build
   ```
4. Abre Chrome y navega a `chrome://extensions/`.
5. Activa el **Modo de desarrollador** (interruptor superior derecho).
6. Haz clic en **Cargar descomprimida** y selecciona la carpeta `dist` generada.

---

## 🏆 Créditos y Agradecimientos

ROEDEX es posible gracias a la dedicación de nuestra comunidad y el apoyo de los creadores del juego:

*   👑 **Lord Cyberr** – Desarrollador Principal y Creador del Proyecto
*   🛠️ **MrSnorch** – Contribuciones, orientación y soporte de arquitectura.
*   💎 **Voxel Queen** – Co-Fundadora de *Roots of Embervault* — por sus llamadas, orientación y por proveer los archivos brutos de los mapas.
*   🎮 **Ruyui Studios** – Los desarrolladores de *Roots of Embervault* (Nota: ROEDEX es un proyecto independiente y no está afiliado oficialmente a Ruyui Studios).

---

## 🤝 Soporte y Contribuciones

ROEDEX es gratuito, de código abierto y mantenido en nuestro tiempo libre. Si esta herramienta ha hecho que tus aventuras sean más eficientes, ¡considera darle una estrella al repositorio ⭐!

Si deseas apoyar con los costos del servidor, recursos y actualizaciones futuras, puedes enviar donaciones opcionales a:

<details>
<summary><b>🪙 Haz clic para expandir las direcciones de donación de EVM y Solana</b></summary>

*   **Abstract Chain**: `0xeb6C0506F624239dAa704c375d0494B14ea81322`
*   **Billetera Global (EVM)**: `0x364aC821eEf0D90678F0B6df44b700d3Df14D89a`
*   **Solana**: `GzRU5v4Tyqx7iGrc7Saed943gMnbMuEDwrpC9vZWyreq`

</details>

*Las contribuciones son completamente opcionales. ¡Gracias por apoyar a la comunidad!*

---
<div align="center">
  <p><i>Creado con ❤️ para la comunidad de Roots of Embervault.</i></p>
</div>
