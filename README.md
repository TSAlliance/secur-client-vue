# Secur Client for VueJS
Alliance Secur client lib for VueJS (Vue 3) applications

## Getting started
Getting started with Secur Client for vuejs applications is pretty straightforward. <br>
First, you have to import the `VueSecurClient` and register it as a plugin in vue.

```javascript
import { createApp } from 'vue'
import VueSecurPlugin from "secur-vue"

const app = createApp(App);


app.use(SecurPlugin, {
    // These options define the api server for authentication
    // For more info on this, read the docs of secur-node project:
    // https://github.com/TSAlliance/secur-node
    protocol: "http",
    host: "localhost",
    port: 3333,
    path: "/",

    // This config is VueSecur specific.
    // You can set routes for specific actions or just redirect to hyperlinks. (e.g.: in loginRoute)
    // Optionally you can define an ErrorHandler implementation from "secur-vue/lib/securErrorHandler"
    guardConfig: {
        homeRoute: { name: "home" },
        loginRoute: "https://tsalliance.eu",
        errorHandler: undefined
    }
})
```

## Error Handling
If you want to have your own error handling implementation, you have to implement different methods from `SecurErrorHandler`.
Below is a table of errors that can be passed to one of these methods you implement:
| Error Class               | Status Code       | Error Code               | Description |
|:--------------------------|:------------------|:-------------------------|:------------|
| SecurAccountNotFoundError | 404               | SECUR_ACCOUNT_MISSING    | This is thrown if the account is not found
| SecurInvalidSessionError  | 403               | SECUR_INVALID_SESSION    | This is thrown if there is an invalid session token
| SecurUnauthorizedError    | 403               | SECUR_UNAUTHORIZED_ERROR | This is thrown if the requested route requires authentication but the authorization process failed
| SecurSessionExpiredError  | 403               | SECUR_SESSION_EXPIRED    | This is throw if the token was valid, but the request is still denied