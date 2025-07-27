# QA Professional Portfolio

Una aplicación de página única (SPA) moderna que muestra mis servicios y experiencia como profesional de Control de Calidad (QA), con soporte multilenguaje implementado a través de archivos de idioma JSON y atributos `data-lang` en el HTML.

## Estructura del Proyecto

```
│
├───index.html                 # Página principal de la SPA
├───README.md                  # Documentación del proyecto
│
├───.gitignore                 # Archivos y carpetas ignorados por Git
│
├───assets/
│   ├───icons/                 # Iconos (SVG, PNG, etc.)
│   └───images/                # Imágenes (banners, screenshots, fondos)
│
├───css/
│   │   styles.css             # Archivo CSS principal que importa todos los módulos
│   │
│   ├───base/                  # Estilos base y variables
│   │       _base.css          # Estilos generales para el body, html, etc.
│   │       _variables.css     # Variables CSS (colores, fuentes, espaciados)
│   │
│   ├───components/            # Estilos para componentes reutilizables
│   │       _banners.css       # Banners (welcome banner, mensajes)
│   │       _buttons.css       # Botones
│   │       _cards.css         # Tarjetas (stats, servicios, proyectos, testimonials)
│   │       _footer.css        # Pie de página
│   │       _forms.css         # Formularios y elementos de entrada
│   │       _navbar.css        # Barra de navegación
│   │       _portfolio.css     # Estilos específicos para la sección de portafolio
│   │
│   ├───layout/                # Estilos para secciones principales
│   │       _hero.css          # Sección hero (encabezado principal)
│   │       _sections.css      # Estilos generales para secciones (títulos, espaciado)
│   │
│   └───utilities/             # Clases de utilidad y helpers
│           _helpers.css       # Clases auxiliares (text-center, d-sm-flex, etc.)
│
├───js/
│   │   main.js                # Punto de entrada principal de la aplicación JS
│   │
│   ├───core/                  # Lógica central de la aplicación
│   │       _language-manager.js  # Gestiona la internacionalización (carga JSON, traduce elementos)
│   │       _router.js         # Maneja la navegación SPA y carga de vistas
│   │
│   └───modules/               # Módulos específicos con funcionalidades aisladas
│           _bootstrap-helpers.js  # Funciones para inicializar componentes Bootstrap dinámicos
│           _portafolio-filter.js  # Lógica para filtrar proyectos en el portafolio
│
├───lang/
│       en.json                # Archivo de traducción al inglés
│       es.json                # Archivo de traducción al español
│
└───views/
        contact.html           # Vista: Página de contacto
        home.html              # Vista: Página de inicio
        portfolio.html         # Vista: Página de portafolio
        services.html          # Vista: Página de servicios
```

## Implementación Técnica

### Stack del Frontend

*   **HTML5**: Marcado semántico para mejor accesibilidad y estructura.
*   **CSS3**: Estilos modernos con un enfoque de diseño atómico.
    *   Los estilos se dividen en `base`, `components`, `layout` y `utilities` para facilitar el mantenimiento.
*   **JavaScript (Módulos ES6)**:
    *   JavaScript vanilla para la funcionalidad principal.
    *   Utiliza Módulos ES6 (`import`/`export`) para un código organizado.
    *   Implementa un enrutador del lado del cliente para navegación SPA.
    *   Carga dinámicamente el contenido HTML desde la carpeta `views/`.
    *   Gestiona el soporte multilenguaje.
    *   Inicializa componentes de UI dinámicos.

### Sistema de Idioma

El sistema multilenguaje se implementa usando:

*   **Archivos de traducción JSON** (`lang/en.json`, `lang/es.json`): Almacenan pares clave-valor para todo el texto traducible.
*   **Atributos `data-lang`**: Los elementos HTML usan `data-lang="clave.nombre"` (ej. `data-lang="hero.title"`) para indicar qué texto deben mostrar. El `LanguageManager` encuentra estos elementos y reemplaza su contenido.
*   **Atributos `data-lang-title`**: Usado para traducir atributos `title` (ej. tooltips).
*   **Detección y Persistencia de Idioma**: El `LanguageManager` detecta el idioma preferido del usuario (desde `localStorage`, URL o configuración del navegador) y guarda su elección.
*   **Traducción Dinámica**: El contenido se traduce al cargar la página y cuando se cambia el idioma.

### Enrutamiento SPA

*   La navegación se maneja del lado del cliente usando fragmentos de URL (`#home`, `#servicios`).
*   El `_router.js` escucha los cambios en el hash y carga el archivo HTML correspondiente desde la carpeta `views/` en el área `#spa-content` de `index.html`.
*   También dispara la traducción del contenido recién cargado.

### Diseño Responsivo

*   Enfoque "mobile-first" usando Bootstrap 5.
*   Layouts fluidos y componentes adaptables.
*   Optimizado para todos los tamaños de dispositivo.
*   Interfaz amigable para dispositivos táctiles.

## Compatibilidad con Navegadores

*   Chrome (última versión)
*   Firefox (última versión)
*   Safari (última versión)
*   Edge (última versión)
*   Navegadores móviles (con soporte para Módulos ES6)

## Licencia

ISC License

Copyright (c) 2025 George Castrejón

Se concede permiso para usar, copiar, modificar y/o distribuir este software para cualquier propósito con o sin tarifa, siempre que el aviso de copyright anterior y este aviso de permiso aparezcan en todas las copias.

