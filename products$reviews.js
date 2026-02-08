// Este script realiza una limpieza y transformación de los datos de la colección 'amazon_products_clean' para crear una nueva colección 'products' con una estructura optimizada para consultas.
db.amazon_products_clean.aggregate([
  {
    // 1. Agrupamos por product_id para eliminar duplicados
    $group: {
      _id: "$product_id",
      product_name: { $first: "$product_name" },
      category_list: { $first: "$category_list" },
      discounted_price: { $first: "$discounted_price" },
      actual_price: { $first: "$actual_price" },
      discount_percentage: { $first: "$discount_percentage" },
      rating: { $first: "$rating" },
      rating_count: { $first: "$rating_count" },
      about_product: { $first: "$about_product" },
      img_link: { $first: "$img_link" },
      product_link: { $first: "$product_link" }
    }
  },
  {
    // 2. Ahora estructuramos y convertimos tipos de datos
    $project: {
      _id: 1, // El _id ya es el product_id por el $group
      product_name: 1,
      categories: "$category_list",
      pricing: {
        discounted_price: { $toDecimal: "$discounted_price" },
        actual_price: { $toDecimal: "$actual_price" },
        //discount_percentage: {
        //  $toInt: { $arrayElemAt: [{ $split: ["$discount_percentage", "%"] }, 0] }
        //}
      },
      metrics: {
        rating: { $toDouble: "$rating" },
        rating_count: { $toInt: "$rating_count" }
      },
      description: "$about_product",
      img_link: 1,
      product_link: 1
    }
  },
  {
    // 3. Guardamos en la nueva colección
    $out: "products"
  }
])

// Este script transforma la colección 'amazon_products_clean' para crear una nueva colección 'reviews' con una estructura optimizada para consultas de reseñas.
db.amazon_products_clean.aggregate([
  {
    // 1. Convertimos los strings separados por comas en Arrays
    $project: {
      _id: 0,
      product_id: 1,
      u_ids: { $split: ["$user_id", ","] },
      u_names: { $split: ["$user_name", ","] },
      r_ids: { $split: ["$review_id", ","] },
      r_titles: { $split: ["$review_title", ","] },
      r_content: { $split: ["$review_content", ","] }
    }
  },
  {
    // 2. "Zipping": Combinamos los arrays en un solo array de objetos
    $project: {
      product_id: 1,
      all_reviews: {
        $map: {
          input: { $range: [0, { $size: "$r_ids" }] },
          as: "idx",
          in: {
            review_id: { $arrayElemAt: ["$r_ids", "$$idx"] },
            user_id: { $arrayElemAt: ["$u_ids", "$$idx"] },
            user_name: { $arrayElemAt: ["$u_names", "$$idx"] },
            title: { $arrayElemAt: ["$r_titles", "$$idx"] },
            content: { $arrayElemAt: ["$r_content", "$$idx"] }
          }
        }
      }
    }
  },
  { 
    // 3. Expandimos el array para que cada reseña sea un documento individual
    $unwind: "$all_reviews" 
  },
  {
    // 4. Estructuramos el documento final
    $project: {
      _id: "$all_reviews.review_id", // ID único de la reseña
      product_id: 1,                // Referencia al producto (Modelo Híbrido)
      user: {
        id: "$all_reviews.user_id",
        name: "$all_reviews.user_name"
      },
      title: "$all_reviews.title",
      content: "$all_reviews.content"
    }
  },
  {
    // 5. Usamos $merge en lugar de $out para manejar posibles duplicados
    // Si encuentra el mismo review_id, simplemente lo actualiza/omite
    $merge: { 
      into: "revieews",
      on: "_id",
      whenMatched: "keepExisting"
    }
  }
])
