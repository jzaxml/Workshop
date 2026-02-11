[{
  $jsonSchema: {
    bsonType: 'object',
    required: [
      '_id',
      'categories',
      'description',
      'img_link',
      'metrics',
      'pricing',
      'product_link',
      'product_name'
    ],
    properties: {
      _id: {
        bsonType: 'string'
      },
      categories: {
        bsonType: 'array',
        items: {
          bsonType: 'string'
        }
      },
      description: {
        bsonType: 'string'
      },
      img_link: {
        bsonType: 'string'
      },
      metrics: {
        bsonType: 'object',
        properties: {
          rating: {
            bsonType: 'double',
            minimum: 0,
            maximum: 5,
            description: 'El valor debe ser un dato numero'
          },
          rating_count: {
            bsonType: 'int',
            minimum: 0
          }
        },
        required: [
          'rating',
          'rating_count'
        ]
      },
      pricing: {
        bsonType: 'object',
        properties: {
          actual_price: {
            bsonType: 'decimal',
            minimum: 0
          },
          discounted_price: {
            bsonType: 'decimal',
            minimum: 0
          }
        },
        required: [
          'actual_price',
          'discounted_price'
        ]
      },
      product_link: {
        bsonType: 'string'
      },
      product_name: {
        bsonType: 'string'
      }
    }
  }
}]

[{
  $jsonSchema: {
    bsonType: 'object',
    required: [
      '_id',
      'content',
      'product_id',
      'title',
      'user'
    ],
    properties: {
      _id: {
        bsonType: 'string'
      },
      content: {
        bsonType: 'string'
      },
      product_id: {
        bsonType: 'string'
      },
      title: {
        bsonType: 'string'
      },
      user: {
        bsonType: 'object',
        properties: {
          id: {
            bsonType: 'string'
          },
          name: {
            bsonType: 'string'
          }
        },
        required: [
          'id',
          'name'
        ]
      }
    }
  }
}]