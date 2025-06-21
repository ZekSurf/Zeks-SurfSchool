// Setup script to create test discount codes
// Run this with: node setup-discount-codes.js

const testDiscountCodes = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountAmount: 10,
    description: 'Welcome discount - 10% off your first lesson',
    minOrderAmount: 0,
    maxUses: 100,
    expiresAt: null // No expiration
  },
  {
    code: 'SAVE20',
    discountType: 'fixed',
    discountAmount: 20,
    description: 'Save $20 on any lesson',
    minOrderAmount: 50,
    maxUses: 50,
    expiresAt: null
  },
  {
    code: 'SUMMER25',
    discountType: 'percentage',
    discountAmount: 25,
    description: 'Summer special - 25% off',
    minOrderAmount: 100,
    maxUses: 25,
    expiresAt: '2024-08-31T23:59:59Z'
  },
  {
    code: 'FIRSTTIME',
    discountType: 'fixed',
    discountAmount: 15,
    description: 'First time surfer discount',
    minOrderAmount: 0,
    maxUses: 200,
    expiresAt: null
  },
  {
    code: 'HOLIDAY50',
    discountType: 'fixed',
    discountAmount: 50,
    description: 'Holiday special - $50 off',
    minOrderAmount: 150,
    maxUses: 10,
    expiresAt: '2024-12-31T23:59:59Z'
  }
];

async function setupDiscountCodes() {
  console.log('🏄‍♂️ Setting up discount codes for Zek\'s Surf School...\n');

  for (const discountCode of testDiscountCodes) {
    try {
      const response = await fetch('http://localhost:3000/api/discount/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discountCode),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Created discount code: ${discountCode.code}`);
        console.log(`   Type: ${discountCode.discountType === 'percentage' ? discountCode.discountAmount + '%' : '$' + discountCode.discountAmount} off`);
        console.log(`   Description: ${discountCode.description}`);
        if (discountCode.minOrderAmount > 0) {
          console.log(`   Minimum order: $${discountCode.minOrderAmount}`);
        }
        if (discountCode.maxUses) {
          console.log(`   Max uses: ${discountCode.maxUses}`);
        }
        if (discountCode.expiresAt) {
          console.log(`   Expires: ${new Date(discountCode.expiresAt).toLocaleDateString()}`);
        }
        console.log('');
      } else {
        console.log(`❌ Failed to create ${discountCode.code}: ${result.error}`);
      }
    } catch (error) {
      console.log(`💥 Error creating ${discountCode.code}:`, error.message);
    }
  }

  console.log('🎉 Discount code setup complete!');
  console.log('\n📋 Test codes you can use:');
  console.log('• WELCOME10 - 10% off any lesson');
  console.log('• SAVE20 - $20 off orders over $50');
  console.log('• SUMMER25 - 25% off orders over $100');
  console.log('• FIRSTTIME - $15 off any lesson');
  console.log('• HOLIDAY50 - $50 off orders over $150');
}

// Check if running directly
if (require.main === module) {
  setupDiscountCodes().catch(console.error);
}

module.exports = { setupDiscountCodes, testDiscountCodes }; 