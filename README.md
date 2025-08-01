# QA Professional Portfolio
![Banner del Proyecto](assets/images/banner.png) 

Una SPA (Single Page Application) moderna que muestra mis servicios y experiencia como profesional de Control de Calidad (QA), con arquitectura escalable y diseño atómico.

## 🌟 Características Principales

* SPA con navegación sin recargas
* Soporte para 2 idiomas (español/inglés)
* Formulario seguro con reCAPTCHA
* Diseño responsive

## 🏗️ Arquitectura del Proyecto

```mermaid
graph TD
    A[index.html] --> B[SPA Router]
    B --> C[Vistas Dinámicas]
    C --> D[Home]
    C --> E[Servicios]
    C --> F[Portafolio]
    C --> G[Contacto]
    B --> H[Language Manager]
    H --> I[Traducciones JSON]
    G --> J[Formspree + reCAPTCHA]
```

## **🚀 Stack Tecnológico**  

### **🌐 Frontend**  
| Tecnología       | Uso en el Proyecto                          | Versión |  
|------------------|---------------------------------------------|---------|  
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) | Estructura semántica y vistas SPA.          | 5       |  
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) | Estilos modulares con diseño atómico.       | 3       |  
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) | Lógica SPA, formularios y animaciones.      | ES6+    |  

### **🔌 Integraciones**  
| Servicio         | Función                                     | Versión/Plan |  
|------------------|---------------------------------------------|--------------|  
| ![Formspree](https://img.shields.io/badge/Formspree-Formularios-3C3C3C?logo=formspree) | Procesamiento de formularios y envío a Gmail. | Free Tier    |  
| ![reCAPTCHA](https://img.shields.io/badge/reCAPTCHA-v2-4285F4?logo=google) | Protección contra spam en formularios.       | v2           |  
| ![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap) | Componentes responsive y utilidades CSS.     | 5.3.x        |  


## Licencia

ISC License

Copyright (c) 2025 George Castrejón

Se concede permiso para usar, copiar, modificar y/o distribuir este software para cualquier propósito con o sin tarifa, siempre que el aviso de copyright anterior y este aviso de permiso aparezcan en todas las copias.

