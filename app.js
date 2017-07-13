function atvPromoCalculator(items, products) {
  if (items['atv'] && items['atv'].quantity % 3 === 0) {
    var numberOfFreeAtv = items['atv'].quantity / 3;
    items['atv'].discount = numberOfFreeAtv * products['atv'].price;
  }
  return items
}

function ipdPromoCalculator(items, products) {
  if (items['ipd'] && items['ipd'].quantity > 4) {
    items['ipd'].discount = items['ipd'].quantity * this.discount;
  }
  return items
}

function mbpPromoCalculator(items, products) {
  if (items['mbp']) {
    // Checks if already have VGA in checkoutBag
    if (items['vga']) {
      var numberOfFreeVga = items['mbp'].quantity - (items['vga'].free + items['vga'].quantity);
      if (numberOfFreeVga > 0) {
        items['vga'].free = items['mbp'].quantity;
      } else {
        items['vga'].discount = items['mbp'].quantity * products['vga'].price;
      }
    } else {
      // If no VGA in checkoutBag, inits product in checkoutBag
      // Adding to free, instead of mutating quantity actually scanned by user
      items['vga'] = {
        discount: 0,
        free: items['mbp'].quantity,
        quantity: 0,
      }
    }
  }
  return items
}

new Vue({
  el: '#app',
  data: {
    products: {
      "ipd": {
        name: 'Super iPad',
        price: 549.99
      },
      "mbp": {
        name: 'MacBook Pro',
        price: 1399.99
      },
      "atv": {
        name: "Apple TV",
        price: 109.50
      },
      "vga": {
        name: "VGA adapter",
        price: 30
      }
    },
    checkoutBag: {},
    checkoutTotal: 0,
    // An array of active promotions to easily remove/add promos
    activePromotions: [
      {id: 0, name: 'ipdPromo', discount: 50, fn: ipdPromoCalculator},
      {id: 1, name: 'atvPromo', discount: 0, fn: atvPromoCalculator},
      {id: 2, name: 'mbpPromo', discount: 50, fn: mbpPromoCalculator}
    ]
  },
  methods: {
    scan: function (sku) {
      // "Scans" item and puts into user checkoutBag
      if (this.checkoutBag[sku]) {
        // Updates quantity of item in checkoutBag
        this.checkoutBag[sku].quantity += 1;
      } else {
        // Init item in checkoutBag
        this.checkoutBag[sku] = {
          quantity: 1,
          discount: 0,
          free: 0
        };
      }
      // Finds promotions
      this.findPromotions(this.checkoutBag);
    },
    findPromotions: function(items) {
      // Gets list of active promotions and checks checkoutBag against each one
      for (var i in this.activePromotions) {
        items = this.activePromotions[i].fn(items, this.products);
      }
      // From updated checkout bag, gets new total
      this.updateTotal(items);
    },
    updateTotal: function(items) {
      var products = this.products;
      // Calculates checkout total including promotions/discounts
      var total = Object.keys(items).reduce(function(sum, item) {
        return sum + ((products[item].price * items[item].quantity) - items[item].discount);
      }, 0);
      this.checkoutTotal = total.toFixed(2);
    }
  }
})

// SCENARIO #1 249.00
// scan("atv");
// scan("atv");
// scan("atv");
// scan("vga");

// SCENARIO #2 2718.95
// scan("atv");
// scan("ipd");
// scan("ipd");
// scan("atv");
// scan("ipd");
// scan("ipd");
// scan("ipd");

// SCENARIO #3 1949.98
// scan("mbp");
// scan("vga");
// scan("ipd");

// Check totals
console.log(((1399.99*0) + (549.99*0) + (109.50 * 4) + (30 * 0) - (50 * 0)).toFixed(2))
