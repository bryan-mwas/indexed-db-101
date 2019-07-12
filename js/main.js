/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
var idbApp = (function () {
  'use strict';

  // check for support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB')
    return
  }

  // Open the db
  var dbPromise = idb.open('couches-n-things', 5, function (upgradeDb) {
    // Please note that there's no break statement to ensure that all cases are evaluated.
    switch (upgradeDb.oldVersion) {
      case 0:
      // placeholder case, the switch block will execute 
      // when the database is first created.
      case 1:
        console.log('Creating the products object store')
        upgradeDb.createObjectStore('products', { keyPath: 'id' })

      // create 'name' index
      case 2:
        console.log('Creating a name index')
        var store = upgradeDb.transaction.objectStore('products')
        store.createIndex('name', 'name', { unique: true })
      // create 'price' and 'description' indexes
      case 3:
        console.log('Creating price and description index')
        store.createIndex('price', 'price')
        store.createIndex('description', 'description')
      // create an orders object store
      case 4:
        console.log('Creating orders object store')
        upgradeDb.createObjectStore('orders', { keyPath: 'id' })
    }
  });

  function addProducts() {

    // Add objects to the products store
    dbPromise.then(function (db) {
      var tx = db.transaction('products', 'readwrite')
      var store = tx.objectStore('products')
      var items = [
        {
          name: 'Couch',
          id: 'cch-blk-ma',
          price: 499.99,
          color: 'black',
          material: 'mahogany',
          description: 'A very comfy couch',
          quantity: 3
        },
        {
          name: 'Armchair',
          id: 'ac-gr-pin',
          price: 299.99,
          color: 'grey',
          material: 'pine',
          description: 'A plush recliner armchair',
          quantity: 7
        },
        {
          name: 'Stool',
          id: 'st-re-pin',
          price: 59.99,
          color: 'red',
          material: 'pine',
          description: 'A light, high-stool',
          quantity: 3
        },
        {
          name: 'Chair',
          id: 'ch-blu-pin',
          price: 49.99,
          color: 'blue',
          material: 'pine',
          description: 'A plain chair for the kitchen table',
          quantity: 1
        },
        {
          name: 'Dresser',
          id: 'dr-wht-ply',
          price: 399.99,
          color: 'white',
          material: 'plywood',
          description: 'A plain dresser with five drawers',
          quantity: 4
        },
        {
          name: 'Cabinet',
          id: 'ca-brn-ma',
          price: 799.99,
          color: 'brown',
          material: 'mahogany',
          description: 'An intricately-designed, antique cabinet',
          quantity: 11
        }
      ]
      return Promise.all(items.map(item => {
        console.log('Adding item ', item)
        store.add(item)
      })).catch(e => {
        tx.abort()
        console.log(e)
      }).then(() => console.log('All items added successfully'))
    })

  }

  function getByName(key) {
    // Use the get method to get an object by name
    return dbPromise.then(function (db) {
      var tx = db.transaction('products', 'readonly')
      var store = tx.objectStore('products')
      var index = store.index('name')
      return index.get(key)
    })
  }

  function displayByName() {
    var key = document.getElementById('name').value;
    if (key === '') { return; }
    var s = '';
    getByName(key).then(function (object) {
      if (!object) { return; }

      s += '<h2>' + object.name + '</h2><p>';
      for (var field in object) {
        s += field + ' = ' + object[field] + '<br/>';
      }
      s += '</p>';

    }).then(function () {
      if (s === '') { s = '<p>No results.</p>'; }
      document.getElementById('results').innerHTML = s;
    });
  }

  function getByPrice() {
    // Use a cursor to get objects by price
    var lower = document.getElementById('priceLower').value
    var upper = document.getElementById('priceUpper').value
    var lowerNum = Number(lower)
    var upperNum = Number(upper)

    if (lower === '' && upper === '') { return }
    var range
    if (lower !== '' && upper !== '') {
      range = IDBKeyRange.bound(lowerNum, upperNum)
    } else if (lower === '') {
      range = IDBKeyRange.upperBound(upperNum)
    } else {
      range = IDBKeyRange.lowerBound(lowerNum)
    }
    var s = ''
    dbPromise.then((db) => {
      var tx = db.transaction('products', 'readonly')
      var store = tx.objectStore('products')
      var index = store.index('price')
      return index.openCursor(range)
    }).then(function showRange(cursor) {
      if (!cursor) return
      console.log('Cursored at: ', cursor.value.name)
      s += `<h2>Price - ${cursor.value.price} </h2><p>`
      for (let field in cursor.value) {
        s += `${field} =  ${cursor.value[field]} <br/>`
      }
      s += '</p>'
      return cursor.continue().then(showRange)
    }).then(() => {
      if (s === '') {
        s = '<p>No results</p>'
      }
      document.getElementById('results').innerHTML = s
    })
  }

  function getByDesc() {
    var key = document.getElementById('desc').value;
    if (key === '') { return; }
    var range = IDBKeyRange.only(key);
    var s = '';
    dbPromise.then(function (db) {

      // TODO 4.4b - get items by their description

    }).then(function () {
      if (s === '') { s = '<p>No results.</p>'; }
      document.getElementById('results').innerHTML = s;
    });
  }

  function addOrders() {
    // add items to the 'orders' object store
    dbPromise.then((db) => {
      var tx = db.transaction('orders', 'readwrite')
      var store = tx.objectStore('orders')
      var items = [
        {
          name: 'Cabinet',
          id: 'ca-brn-ma',
          price: 799.99,
          color: 'brown',
          material: 'mahogany',
          description: 'An intricately-designed, antique cabinet',
          quantity: 7
        },
        {
          name: 'Armchair',
          id: 'ac-gr-pin',
          price: 299.99,
          color: 'grey',
          material: 'pine',
          description: 'A plush recliner armchair',
          quantity: 3
        },
        {
          name: 'Couch',
          id: 'cch-blk-ma',
          price: 499.99,
          color: 'black',
          material: 'mahogany',
          description: 'A very comfy couch',
          quantity: 3
        }
      ]
      return Promise.all(items.map(order => {
        console.log('Adding order: ', order)
        store.add(order)
      })).catch(e => {
        tx.abort()
        console.log(external)
      }).then(() => console.log('Successfully created orders.'))
    })
  }

  function showOrders() {
    var s = '';
    dbPromise.then(function (db) {
      var tx = db.transaction('orders', 'readonly')
      var store = tx.objectStore('orders')
      return store.openCursor()
    }).then(function showOrders(cursor) {
      if (!cursor) return
      console.log('Cursor at: ', cursor.value.name)
      s += `<h2>Name - ${cursor.value.name} </h2><p>`
      for (let field in cursor.value) {
        s += `${field} = ${cursor.value[field]} <br/>`
      }
      s += '</p>'
      return cursor.continue().then(showOrders)
    }).then(function () {
      if (s === '') { s = '<p>No results.</p>'; }
      document.getElementById('orders').innerHTML = s;
    });
  }

  function getOrders() {
    // get all objects from 'orders' object store
    return dbPromise.then((db) => {
      var tx = db.transaction('orders', 'readonly')
      var store = tx.objectStore('orders')
      console.log(store.getAll())
      return store.getAll()
    })
  }

  function fulfillOrders() {
    getOrders().then(function (orders) {
      return processOrders(orders);
    }).then(function (updatedProducts) {
      updateProductsStore(updatedProducts);
    });
  }

  function processOrders(orders) {
    // Get items in the 'products' store matching the orders
    return dbPromise.then((db) => {
      var tx = db.transaction('products')
      var store = tx.objectStore('products')
      return Promise.all(
        orders.map((order) => {
          return store.get(order.id).then(product => {
            return decrementQuantity(product, order)
          })
        })
      )
    })
  }

  function decrementQuantity(product, order) {
    // Check the quantity of remaining products
    return new Promise((resolve, reject) => {
      var item = product
      var qtyRemaining = item.quantity - order.quantity
      const warning = `Not enough ${product.id} left in stock`;
      if (qtyRemaining < 0) {
        console.log(warning)
        document.getElementById('receipt').innerHTML = `<h3>${warning}</h3>`
        throw 'Out of stock!'
      }
      item.quantity = qtyRemaining
      resolve(item)
    })
  }

  function updateProductsStore(products) {
    dbPromise.then(function (db) {
      // Update the items in the 'products' object store
      var tx = db.transaction('products', 'readwrite')
      var store = tx.objectStore('products')
      return Promise.all(products.map(product => {
        console.log(`Updating products...`)
        store.put(product)
      }))
    }).then(function () {
      console.log('Orders processed successfully!');
      document.getElementById('receipt').innerHTML =
        '<h3>Order processed successfully!</h3>';
    });
  }

  return {
    dbPromise: (dbPromise),
    addProducts: (addProducts),
    getByName: (getByName),
    displayByName: (displayByName),
    getByPrice: (getByPrice),
    getByDesc: (getByDesc),
    addOrders: (addOrders),
    showOrders: (showOrders),
    getOrders: (getOrders),
    fulfillOrders: (fulfillOrders),
    processOrders: (processOrders),
    decrementQuantity: (decrementQuantity),
    updateProductsStore: (updateProductsStore)
  };
})();
