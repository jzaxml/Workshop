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

