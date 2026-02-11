// Consulta optimizada para encontrar los mejores cables con descuento y buenas reseñas:
// indices compuestos en 'categories' + 'pricing', y 'metrics.rating', además de un índice en 'reviews.product_id' para el $lookup.
db.products.aggregate([
  {
    // 1. Filtramos usando el índice de 'categories' y 'pricing'
    $match: {
      categories: "Cables",
      "pricing.discounted_price": { $lte: 500 },
      "metrics.rating": { $gte: 4 }
    }
  },
  {
    // 2. Ordenamos por los mejor calificados (usa el índice compuesto)
    $sort: { "metrics.rating": -1 }
  },
  { $limit: 3 }, // Limitamos a los 3 mejores
  {
    // 3. Unimos con la colección de reviews (usa el índice product_id)
    $lookup: {
      from: "reviews",
      localField: "_id",        // product_id en la colección products
      foreignField: "product_id",
      as: "customer_reviews"
    }
  },
  {
    // 4. Limpiamos la salida para ver solo lo importante
    $project: {
      _id: 0,
      product_name: 1,
      "pricing.discounted_price": 1,
      "metrics.rating": 1,
      // Solo mostramos las 2 reseñas más recientes para no saturar
      recent_feedback: { $slice: ["$customer_reviews", 2] }
    }
  }
])

// Pipeline para crear un Dashboard de productos destacados con descuentos y buenas reseñas
// Este pipeline se enfoca en identificar los productos que ofrecen un gran valor a los clientes, combinando métricas de valoración y descuentos atractivos para destacar las mejores ofertas en el Dashboard.
db.products.aggregate([
  {
    // 1. Filtramos para mostrar solo productos con alta valoración y un descuento significativo
    $match: {
      "metrics.rating": { $gte: 4.5 }, // Solo productos con alta valoración
      "metrics.rating_count": { $gte: 10 }, // Solo productos con al menos 10 reseñas para asegurar confiabilidad
      "pricing.discounted_price": { $lte: 1000 } // Solo productos con un precio atractivo
    }
  },
  {
    // 2. Calculamos el porcentaje de descuento para cada producto
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
  { // 3. Filtramos para mostrar solo productos con un descuento significativo
    $match: { discount_percentage: { $gte: 20 } }
  },
  { // 4. Ordenamiento por valoración y porcentaje de descuento para destacar los mejores productos
    $sort: {
      "metrics.rating": -1,
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
])

// Pipeline: prueba de Atlas search con búsqueda de texto completo y tolerancia a errores ortográficos
db.products.aggregate([
  {
    $search: {
      index: "default", // El nombre del índice que creaste
      text: {
        query: "soni", // Lo que el usuario escribe (¿quiere decir "Sony"?)
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
])


// Búsqueda rápida por categorías (Índice Multikey porque es un Array)
db.products.createIndex({ "categories": 1 });

// Búsqueda por precio y rating (Índice Compuesto)
// Ideal para filtros como "Cables de menos de 500 con más de 4 estrellas"
db.products.createIndex({ 
  "pricing.discounted_price": 1, 
  "metrics.rating": -1 
});

// Búsqueda de texto para el nombre del producto
db.products.createIndex({ "product_name": "text" });



// La "Llave Foránea" (Crucial para hacer $lookup rápidos)
db.reviews.createIndex({ "product_id": 1 });

// Búsqueda por ID de usuario (Para ver el historial de un cliente)
db.reviews.createIndex({ "user.id": 1 });

// Índice de texto para buscar palabras clave dentro de los comentarios
db.reviews.createIndex({ "title": "text", "content": "text" });