# This project has been archived, and all code can now be found in the [site repository](https://github.com/mixDrinks/site)
------------
# The backend service for [mixdrinks.org](https://mixdrinks.org/). The service for home cocktails cooking.

[Our website](https://mixdrinks.org/)

### The API provides rest api about cocktails, receipts, goods and tools which your need to create the cocktails.

The service provide api for
* Cocktails
* Goods
* Tools
* Tags
* Filter by tags, goods, tools, alcohol, alcohol voluem

### Using

[Link to docker hub](https://hub.docker.com/r/vovochkastelmashchuk/)

- `latest` - the production version of the app
- sha-{{commit_short_sha}}, example: `sha-1234567`

### Envirment variable
DB_URL=<mongo url connection string>
IMAGE_URL_START=<image cdn domain>
APP_PORT=3000 | or you port

### Images ..
We use s3 bucket for store image (R2 clound flare)

## Find a bug?

If you found an issue or would like to submit an improvement to this project, please submit an issue using the issues
tab above. If you would like to submit a PR with a fix, reference the issue you created!

## CI/CD

The project use github actions for CI/CD. The CI/CD pipelines is described in the folder `.github/workflows/`
The job verify the code style, run the tests and build the docker image for each pull request.
After push to the main branch the job build the docker image with tags latest and sha-{short_commit_sha} and push it to
the docker hub. After the push the job trigger the digital ocean app platform to deploy the new version of the app, we
use the sha for identify the version, we cannot use the latest tag because the latest tag is not immutable, and be
doesn't have opportunity to rollback.

### Deploy process

All changes from main branch immediately deploy to production. The project doesn't have stage environment I trust the
tests and the deployment workflow.
