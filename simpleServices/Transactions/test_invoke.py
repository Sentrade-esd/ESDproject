from invokes import invoke_http

# invoke book microservice to get all books
results = invoke_http("http://localhost:5000/transaction", method='GET')

print( type(results) )
print()
print( results )

userid = '3'
transaction_details = {
    "Company": "Test Inc.",
    "DateTimestamp": "2024-03-08 14:30:00",
    "BuyAmount": 215.00,
    "SellAmount": 0.00,
    "StopLossSentimentThreshold": 0.05,
    "TotalAccountValue": 5000.00
}

create_results = invoke_http(
        "http://localhost:5000/transaction/" + userid, method='POST', 
        json=transaction_details
    )

# print(create_results.json())

print()
print( create_results )

