from invokes import invoke_http

# invoke user microservice to get all users
results = invoke_http("http://localhost:5000/user", method='GET')

print(type(results))
print()
print(results)

# userid = '2'
user_details = {
    "Email": "web2@example.com",
    "Password": "password",
    "Telehandle": "example_telehandle"
}

create_results = invoke_http(
    "http://localhost:5000/user", method='POST',
    json=user_details
)

print()
print(create_results)