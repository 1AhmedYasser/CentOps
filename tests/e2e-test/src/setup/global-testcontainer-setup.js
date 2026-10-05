import {DockerComposeEnvironment, log, Wait} from 'testcontainers';

let environment;

export async function setup() {
    try {
        // Start the Docker Compose environment
        environment = await new DockerComposeEnvironment('.', './docker-compose-test.yml')
            .withStartupTimeout(120_000)
            .withWaitStrategy('liquibase-test', Wait.forOneShotStartup())
            .withWaitStrategy('ruuter-test', Wait.forLogMessage(/Started RuuterApplication/))
            .withWaitStrategy('resql-test', Wait.forLogMessage(/Started SqlmsApplication/))
            .up();

        console.log('[testcontainers] Router is running');

        globalThis.__DOCKER_ENV__ = {environment};

        log.info("Environment is ready, running tests...");

    } catch (error) {
        console.error('[testcontainers] Error during PostgreSQL connection:', error);
        throw error;
    }
}

export async function teardown() {
    if (globalThis.__DOCKER_ENV__) {
        await globalThis.__DOCKER_ENV__.environment.down();
        globalThis.__DOCKER_ENV__ = null;
    }
}
