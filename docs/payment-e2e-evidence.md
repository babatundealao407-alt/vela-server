# Database-backed payment-flow evidence

`test/payments-full-flow.e2e-spec.ts` is the repository's database-backed
payment lifecycle suite. It exercises payment-request creation, intent
creation, authorization, submission, confirmation, and history lookup through
the HTTP boundary using the test database and mocked Stellar provider.

Run the suite with:

```sh
npm run test:e2e -- --runInBand test/payments-full-flow.e2e-spec.ts
```

The suite must use test credentials and a disposable database. It does not
submit a live transaction to Stellar. Provider failures are represented by
safe public error envelopes; nested causes and database details are not
serialized into the response body.
