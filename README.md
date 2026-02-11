# Workshop
Presentación MongoDB Performance
# databaseII
## Profesora:
 Clinia Cordero 
## Integrantes
 Jesús Ramírez 31074731**
 Anarella Mendez 30298370**
 Jose zambrano 20808434**
# Proyecto : GlobalMarket Analytics & Search Engine

## 1. Introducción

Este proyecto fue desarrollado para la asignatura **Sistemas de Bases de Datos II** de la UNEG, con el objetivo de simular la migración y optimización de un sistema de comercio electrónico (*GlobalMarket*) desde una base de datos relacional ineficiente a una arquitectura NoSQL moderna con **MongoDB Atlas**. El foco del proyecto fue el diseño documental, la validación de integridad de datos y la implementación de analíticas avanzadas (BI).

## 2. Herramientas y Tecnologías Utilizadas

| Herramienta | Versión / Plataforma | Uso Principal |
| :--- | :--- | :--- |
| **Plataforma de Base de Datos** | MongoDB Atlas (M0 Free Tier) | Hosting del clúster y configuración de Atlas Search. |
| **Cliente de Escritorio** | MongoDB Compass | Ingesta de datos, diseño de Aggregation Pipelines y análisis de rendimiento (Explain Plan). |
| **Motor de Búsqueda** | MongoDB Atlas Search (Lucene) | Implementación de búsquedas tolerantes a fallos (`fuzzy search`). |
| **Visualización (BI)** | MongoDB Atlas Charts | Creación del Dashboard para visualizar Reporte de Ventas y Bucket Pattern. |
| **Modelado de Datos** | JSON Schema Validation | Garantía de integridad de datos (p.ej., Rating entre 0 y 5). |

## 3. Dataset Utilizado

El proyecto utiliza un conjunto de datos real para simular condiciones de producción auténticas:

*   **Nombre del Dataset:** Amazon Sales Dataset
*   **Fuente:** [https://www.kaggle.com/datasets/karkavelrajaj/amazon-sales-dataset](https://www.kaggle.com/datasets/karkavelrajaj/amazon-sales-dataset)
*   **Volumen:** Aproximadamente 1,400 documentos (suficiente para pruebas de rendimiento).
*   **Justificación:** Permite modelar escenarios de variabilidad de atributos de productos y la necesidad de análisis de sentimientos/calidad sobre reseñas de clientes.

## 4. Estructura de Archivos y Scripts

Este repositorio contiene los siguientes scripts esenciales para la operatividad del proyecto:

| Archivo | Descripción | Uso |
| :--- | :--- | :--- |
| **`clean.js`** | Contiene el *Aggregation Pipeline* utilizado para transformar la data plana del CSV en el modelo documental optimizado. Incluye la lógica de limpieza de precios y el patrón de **Embedding** (embebido) de las reseñas dentro del documento `products`. | Script de **Modelado y Limpieza** |
| **`index.js`** | Contiene el codigo de la creacion de los indices necesarios para la optimizacion de las busque de documentos | Scripts **Optimizacion redimiento** |
| **`validation.js`** | Contiene el código de **JSON Schema Validation** aplicado a la colección `products`. Asegura la integridad de datos críticos (p.ej., precios no negativos, rating entre 0 y 5, campos obligatorios en las reseñas). | Script de **Integridad de Datos** |
| **`pipeline.js`** | Contiene todos los *Aggregation Pipelines* solicitados en el proyecto (Reporte de Ventas, Top Productos, Bucket Pattern), listos para ser ejecutados en la consola. | Scripts de **Consultas Analíticas** |
| **`AtlasSearch.js`** | Contiene la consulta de demostración para el motor de **Atlas Search**, incluyendo la configuración de la búsqueda `fuzzy` y la proyección del `searchScore`. | Script de **Búsqueda Avanzada** |

## 5. Instrucciones para Levantar el Proyecto

1.  **Clonar este Repositorio: **
2.  **git clone https://github.com/jzaxml/Workshop.git** 
3.  **Configurar Atlas:** Asegurar que el clúster M0 esté activo y se haya configurado el acceso IP.
4.  **Conexión con Compass:** Conectar MongoDB Compass usando el *Connection String* de Atlas.
5.  **Carga Inicial:** Importar el CSV del *Amazon Sales Dataset* a una colección temporal.
6.  **Ejecución de `clean.js`:** Ejecutar el pipeline en `clean.js` para generar la colección final `products`.
7.  **Validación y Consultas:** Aplicar el esquema de `validation.js` y ejecutar los scripts de `queries.js` para las demos.
#
