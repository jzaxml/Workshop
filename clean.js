
// Pipeline para limpiar y transformar los datos de Amazon Products, preparando una colección optimizada
// para análisis y visualización en el Dashboard
[
  {
    $addFields: {
      // 1. RATING: Mantiene decimales (4.2 se queda como 4.2)
      // Se convierten a Double para mantener la precisión decimal, y se manejan errores o valores nulos con 0.0
      rating: {
        $convert: {
          input: "$rating", // Se toma el valor original de rating
          to: "double", // Mantiene la precisión decimal
          onError: 0.0, // En caso de error, se asigna una valoración de 0.0
          onNull: 0.0 // En caso de valor nulo, se asigna una valoración de 0.0
        }
      },

      // 2. RATING_COUNT: Único valor convertido a Entero (No existen 1.5 reseñas)
      // Se eliminan comas y se convierten a Entero para contar reseñas de forma precisa
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
      // Se eliminan símbolos de moneda y comas, y se convierten a Double para mantener la precisión decimal
      discounted_price: {
        $convert: {
          input: {
            $trim: {
              input: {
                $replaceAll: { //
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
      // Se eliminan símbolos de moneda y comas, y se convierten a Double para mantener la precisión decimal
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
      // Se divide la cadena de categorías en un array utilizando el delimitador "|", y se maneja el caso de valores nulos con "Sin Categoría"
      category_list: {
        $split: [{ $ifNull: ["$category", "Sin Categoría"] }, "|"]
      }
    }
  },
  {
    // Se utiliza $out para guardar el resultado del pipeline en una nueva colección llamada "amazon_products_clean", que estará optimizada para análisis y visualización en el Dashboard
    $out: "amazon_products_clean"
  }
]
