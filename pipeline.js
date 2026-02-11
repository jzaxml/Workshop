// Copiar desde el [ hasta el ] para cada pipeline y pegar en el archivo pipeline.js

// Pipeline para analizar el rendimiento de las categorías en términos de cantidad de productos, valoración promedio y precio promedio
// Utilizando agrupaciones y proyecciones para crear un dashboard informativo
// que ayude a identificar las categorías más destacadas
// en función de estos indicadores clave de rendimiento
[
  { $unwind: "$categories" }, // Desglosamos el array de categorías
  {
    // 1. Agrupación por categoría
    // Calculamos el total de productos, valoración promedio y precio promedio por categoría
    $group: {
      _id: "$categories",
      total_productos: { $sum: 1 },
      rating_promedio: { $avg: "$metrics.rating" },
      precio_promedio: { $avg: "$pricing.discounted_price" }
    }
  },
  // 2. Filtrado para asegurar que solo se muestren categorías con un número representativo de productos
  { $match: { total_productos: { $gte: 5 } } }, // Filtramos categorías con volumen representativo
  { $sort: { rating_promedio: -1 } },
  {
    // 3. Proyección final para el Dashboard
    // Redondeamos valores para mejor presentación
    $project: {
      categoria: "$_id",
      rating_promedio: { $round: ["$rating_promedio", 1] },
      precio_promedio: { $round: ["$precio_promedio", 2] },
      total_productos: 1,
      _id: 0
    }
  }
]

// Pipeline para identificar los productos con mejor valoración y mayor descuento
// Utilizando múltiples etapas de filtrado, cálculo y ordenamiento para destacar los productos más atractivos para los clientes
// Este pipeline se enfoca en productos con alta valoración y un descuento significativo, lo que puede ser útil para promociones o recomendaciones en el Dashboard
// El objetivo es crear un Dashboard que muestre los productos más destacados en términos de valoración y descuento, ayudando a los clientes a tomar decisiones informadas y a la empresa a identificar oportunidades de promoción
// El pipeline se estructura en varias etapas para asegurar que solo se muestren productos que realmente ofrecen un valor significativo a los clientes, basándose en métricas de valoración y descuentos atractivos
// El resultado final es un Dashboard que resalta los productos más atractivos, facilitando la toma de decisiones tanto para los clientes como para la empresa en términos de promociones y recomendaciones
[
  {
    // 1. Filtrado inicial para asegurar que solo se consideren productos con métricas de valoración válidas
    $match: {
      "metrics.rating": { $gte: 4.5 }, // Solo productos con alta valoración
      "metrics.rating_count": { $gte: 10 } //
    }
  },
  {
    // 2. Cálculo del porcentaje de descuento para cada producto
    $addFields: {
      discount_percentage: {
        $multiply: [ // Cálculo del porcentaje de descuento basado en el precio real y el precio potencial
          {
            $divide: [ // Evitamos división por cero y aseguramos que el precio potencial sea mayor que cero
              {
                $subtract: [
                  "$pricing.actual_price",
                  "$pricing.discounted_price"
                ]
              },
              "$pricing.actual_price"
            ]
          },
          100 // Convertimos a porcentaje
        ]
      }
    }
  },
  { // 3. Filtrado para mostrar solo productos con un descuento significativo
    $match: { discount_percentage: { $gte: 20 } }
  },
  { // 4. Ordenamiento por valoración, cantidad de valoraciones y porcentaje de descuento para destacar los mejores productos
    $sort: {
      "metrics.rating": -1,
      "metrics.rating_count": 1,
      discount_percentage: -1
    }
  },
  { // 5. Proyección final para el Dashboard, mostrando solo los campos más relevantes para la toma de decisiones
    $project: {
      _id: 0,
      product_name: 1,
      categories: 1,
      "pricing.discounted_price": 1,
      "pricing.actual_price": 1,
      discount_percentage: 1,
      "metrics.rating": 1,
      "metrics.rating_count": 1,
      product_link: 1,
      img_link: 1,
      description: 1
    }
  }
]

// Pipeline para calcular la brecha financiera entre el precio potencial y el precio real pagado por los clientes
[
  {
    // 1. Filtrar solo productos que tienen stock o métricas válidas
    $match: {
      "pricing.discounted_price": { $gt: 0 }
    }
  },
  {
    // 2. Agrupación General (o por categoría si prefieres)
    $group: {
      _id: null,
      ventas_potenciales: { $sum: "$pricing.actual_price" },
      ingresos_reales: { $sum: "$pricing.discounted_price" },
      total_productos_vendidos: { $sum: 1 },
      descuento_promedio: { $avg: "$discount_percentage" }
    }
  },
  {
 // 3. Cálculo de la brecha financiera
    $project: {
      _id: 0,
      total_productos_vendidos: 1,
      ingresos_reales: { $round: ["$ingresos_reales", 2] },
      ahorro_total_clientes: { 
        $round: [{ $subtract: ["$ventas_potenciales", "$ingresos_reales"] }, 2] 
      },
      eficiencia_precio: { 
        $round: [{ $divide: ["$ingresos_reales", "$ventas_potenciales"] }, 2] 
      },
      descuento_promedio: { $round: ["$descuento_promedio", 1] }
    }
  }
]

// dashboard para identificar los productos más vendidos por categoría y analizar su rendimiento en términos de ventas y valoración
// Utilizando agrupaciones y ordenamientos para destacar los productos top en cada categoría
[
  { $unwind: "$categories" }, // Desglosamos el array de categorías
  {
    // 1. Agrupación por categoría y producto para contar ventas
    $group: {
      _id: { category: "$categories", product: "$product_name" },
      total_vendidos: { $sum: 1 }
    }
  },
  {
    // 2. Ordenamos por categoría y luego por cantidad vendida para obtener los top productos
    $sort: { total_vendidos: -1 }
  },
  {
    // 3. Agrupamos nuevamente por categoría para obtener un array de productos ordenados por ventas
    $group: {
      _id: "$_id.category",
      top_productos: { $push: { product: "$_id.product", vendidos: "$total_vendidos" } }
    }
  },
  {
    // 4. Proyectamos el resultado final mostrando solo los top 5 productos por categoría
    $project: {
      categoria: "$_id",
      top_productos: { $slice: ["$top_productos", 5] }, // Solo los top 5
      _id: 0
    }
  }
]
// dashboard para analizar la relación entre el precio y la valoración de los productos
// Utilizando "buckets" para categorizar los productos en rangos de precio y observar cómo varía la valoración promedio en cada rango
[
  {
    // 1. Limpieza previa de tipos (Asegurando que sean numéricos)
    $addFields: {
      numeric_price: { $convert: { input: "$pricing.discounted_price", to: "decimal", onError: 0 } },
      numeric_rating: { $convert: { input: "$metrics.rating", to: "double", onError: 0 } }
    }
  },
  {
    // 2. Agrupación por rango de precio para analizar la relación con la valoración
    $bucket: {
      groupBy: "$numeric_price", // Agrupamos por precio
      boundaries: [0, 500, 2000, 10000], // Definimos los "baldes": Económico, Medio, Lujo
      default: "Premium", // Para precios > 10,000
      output: {
        "cantidad_productos": { $sum: 1 },
        "rating_promedio": { $avg: "$numeric_rating" },
        "nombres_muestra": { $push: "$product_name" } // Guardamos nombres en un array interno (Bucket)
      }
    }
  },
  {
    // 3. Formateo final para el Dashboard
    $project: {
      rango_precio: "$_id",
      cantidad_productos: 1,
      rating_promedio: { $round: ["$rating_promedio", 2] },
      muestreo: { $slice: ["$nombres_muestra", 3] } // Solo mostramos 3 ejemplos por cubo
    }
  }
]