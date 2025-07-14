# PowerShell script to place an order using curl

# Step 1: Login to get authentication token
Write-Host "Step 1: Logging in..." -ForegroundColor Cyan
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/users/login" -Method Post -ContentType "application/json" -Body @"
{
  "email": "testuser@example.com",
  "password": "password123"
}
"@

    Write-Host "Login successful:" -ForegroundColor Green
    $loginResponse | ConvertTo-Json

    # Extract token from response
    $token = $loginResponse.token

    if ($token) {
        # Step 2: Create a minimal valid order with mock data
        Write-Host "`nStep 2: Placing a minimal valid order..." -ForegroundColor Cyan
        try {
            $orderResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/orders" -Method Post -ContentType "application/json" -Headers @{
                Authorization = "Bearer $token"
            } -Body @"
{
  "orderItems": [
    {
      "name": "Margherita Pizza",
      "quantity": 2,
      "image": "pizza.jpg",
      "price": 450,
      "food": "000000000000000000000001"
    },
    {
      "name": "Chicken Biryani",
      "quantity": 1,
      "image": "biryani.jpg",
      "price": 350,
      "food": "000000000000000000000002"
    }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "paymentMethod": "cash_on_delivery",
  "taxPrice": 63,
  "shippingPrice": 50,
  "totalPrice": 1363
}
"@

            Write-Host "Order placed successfully:" -ForegroundColor Green
            $orderResponse | ConvertTo-Json -Depth 4
        }
        catch {
            Write-Host "Error placing order:" -ForegroundColor Red
            Write-Host $_.Exception.Message
            if ($_.ErrorDetails.Message) {
                Write-Host "Details:" -ForegroundColor Red
                $_.ErrorDetails.Message
            }
        }
    }
    else {
        Write-Host "Authentication failed. No token received." -ForegroundColor Red
    }
}
catch {
    Write-Host "Login failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
