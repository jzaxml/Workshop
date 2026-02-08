// Pipeline: prueba de Atlas search con búsqueda de texto completo y tolerancia a errores ortográficos
[
  {
    $search: {
      index: "default", // El nombre del índice que creaste
      text: {
        query: "soni", // Lo que el usuario escribe
        path: ["product_name", "about_product"], // En qué campos buscar
        fuzzy: {
          maxEdits: 2 // Permite errores ortográficos (ej: "breded" -> "braided")
        }
      }
    }
  },
  {
    $project: {
      product_name: 1,
      score: { $meta: "searchScore" } // Te dice qué tan buena fue la coincidencia
    }
  },
  { $limit: 5 }
]
/**"Para la función de búsqueda de GlobalMarket, no utilizamos consultas tradicionales de base de datos.
 * Implementamos Atlas Search, un motor basado en Apache Lucene. Esto nos permite ofrecer una búsqueda
 * de nivel empresarial que soporta Fuzzy Matching, permitiendo errores de dedo del usuario, y un sistema
 * de Ranking por Relevancia. Lo mejor de esta arquitectura es que el motor de búsqueda vive dentro de
 * la misma base de datos, eliminando la necesidad de sincronizar datos con servicios externos."
 **/
