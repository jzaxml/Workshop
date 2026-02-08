// Pipeline de agregación para analizar el rendimiento de las categorías de productos
[
  { $unwind: "$categories" }, // Desglosamos el array de categorías
  {
    $group: {
      _id: "$categories",
      total_productos: { $sum: 1 },
      rating_promedio: { $avg: "$metrics.rating" },
      precio_promedio: { $avg: "$pricing.discounted_price" }
    }
  },
  { $match: { total_productos: { $gte: 5 } } }, // Filtramos categorías con volumen representativo
  { $sort: { rating_promedio: -1 } },
  {
    $project: {
      categoria: "$_id",
      rating_promedio: { $round: ["$rating_promedio", 1] },
      precio_promedio: { $round: ["$precio_promedio", 2] },
      total_productos: 1,
      _id: 0
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

// Pipeline para categorizar productos en rangos de precio y analizar su rendimiento
[
  {
    // 1. Limpieza previa de tipos (Asegurando que sean numéricos)
    $addFields: {
      numeric_price: { $convert: { input: "$pricing.discounted_price", to: "decimal", onError: 0 } },
      numeric_rating: { $convert: { input: "$metrics.rating", to: "double", onError: 0 } }
    }
  },
  {
    // 2. Aplicación del Bucket Pattern
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