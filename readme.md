# Bookshop CAP application

This project contains a CAP service and a UI5 application for ordering books.

Run `npm run watch`, then open `/sap.cap.demo.bookshop/index.html`. The Books page supports
multi-selection. The Order page collects a quantity for every selected book and
creates a deep order at `POST /bookshop/Orders`. Orders are created with status
`forApproval`; the service validates stock, deducts it in the same transaction,
and rejects the request when any requested quantity is unavailable. The Orders
page lists all submitted orders and their status.

The sample books are in
`db/data/sap.cap.demo.bookshop-Books.csv`.

## Deploy to SAP BTP (Cloud Foundry, no MTA)

Prerequisites: a running SAP HANA Cloud instance and an HDI container service
instance named `bookshop-workflow-db` (see `services-manifest.yml`).

```bash
cf create-service hana hdi-shared bookshop-workflow-db   # skip if it already exists
cds build --production
cf push
```

`manifest.yml` pushes the database content deployer first, then the service.
The service app is pushed from the project root so that the UI5 app in `app/`
is included and served at `/sap.cap.demo.bookshop/index.html`.

Production settings live in the `cds.requires` section of `package.json`: the
database switches to SAP HANA, and authentication uses the `mocked` strategy
because this demo has no XSUAA instance or AppRouter. Replace it with XSUAA and
an AppRouter before using this in a productive setup.

`app/bookshop/ui5.yaml` deliberately has no `framework` section: `webapp/index.html`
bootstraps OpenUI5 from the CDN. Declaring a framework makes `cds-plugin-ui5`
resolve and install the OpenUI5 packages while the app starts, which stalls the
startup on Cloud Foundry until the health check fails.

Learn more at <https://cap.cloud.sap>.
