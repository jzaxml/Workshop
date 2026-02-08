// Pipeline: Depuración y transformación de datos para Amazon Products
[
  {
    $addFields: {
      // 1. RATING: Mantiene decimales (4.2 se queda como 4.2)
      rating: {
        $convert: {
          input: "$rating",
          to: "double", // Mantiene la precisión decimal
          onError: 0.0,
          onNull: 0.0
        }
      },

      // 2. RATING_COUNT: Único valor convertido a Entero (No existen 1.5 reseñas)
      rating_count: {
        $convert: {
          input: { 
            $replaceAll: { 
              input: { $toString: { $ifNull: ["$rating_count", "0"] } }, 
              find: ",", 
              replacement: "" 
            }
          },
          to: "int",
          onError: 0,
          onNull: 0
        }
      },

      // 3. PRECIOS: Convertidos a Double para no perder los centavos o precisión
      discounted_price: {
        $convert: {
          input: {
            $trim: {
              input: {
                $replaceAll: {
                  input: { $replaceAll: { input: { $toString: "$discounted_price" }, find: "₹", replacement: "" } },
                  find: ",",
                  replacement: "."
                }
              }
            }
          },
          to: "double",
          onError: 0.0,
          onNull: 0.0
        }
      },
      actual_price: {
        $convert: {
          input: {
            $trim: {
              input: {
                $replaceAll: {
                  input: { $replaceAll: { input: { $toString: "$actual_price" }, find: "₹", replacement: "" } },
                  find: ",",
                  replacement: ""
                }
              }
            }
          },
          to: "double",
          onError: 0.0,
          onNull: 0.0
        }
      },

      // 4. CATEGORÍA: Convertida a Array (Lista)
      category_list: {
        $split: [{ $ifNull: ["$category", "Sin Categoría"] }, "|"]
      }
    }
  },
  {
    // 5. Guardar en nueva colección limpia
    $out: "amazon_products_clean"
  }
]
