import { BasaltLogger, ConsoleLoggerStrategy } from '@basalt-lab/basalt-logger';

import { EnvironmentConfiguration, I18n, Language, packageJsonConfiguration } from '@/Config';
import { HttpServerManager } from '@/HTTP/HttpServerManager';
import { RedpandaProducer, InitializeProducer } from '@/Infrastructure/External/RedPanda/Producer';
import { KafkaLoggerStrategy } from '@/Common';
import { KnexDatabase } from '@/Infrastructure/Database/KnexDatabase';
import { ErrorEntity } from '@/Common/Error';

if (EnvironmentConfiguration.env.NODE_ENV === 'development')
    require('source-map-support/register');

class App {
    private readonly _httpServerManager: HttpServerManager = new HttpServerManager();

    public async start(): Promise<void> {
        // Connect to brokers and initialize producer
        await RedpandaProducer.instance.connect();
        BasaltLogger.addStrategy('kafka', new KafkaLoggerStrategy());
        BasaltLogger.log(I18n.translate('app.redpanda.REDPANDA_PRODUCER_CONNECTED', Language.EN));

    }

    public async stop(): Promise<void> {
        await RedpandaProducer.instance.disconnect();
        if (BasaltLogger.strategies.has('kafka'))
            BasaltLogger.removeStrategy('kafka');
        BasaltLogger.log(I18n.translate('app.redpanda.REDPANDA_PRODUCER_DISCONNECTED', Language.EN));

        BasaltLogger.log(I18n.translate('app.stop', Language.EN, {
            name: packageJsonConfiguration.name
        }));
    }
}

const app: App = new App();
BasaltLogger.addStrategy('console', new ConsoleLoggerStrategy());

async function runApp(): Promise<void> {
    try {
        await app.start();

        const initializeProducer: InitializeProducer = new InitializeProducer();
        await initializeProducer.execute();

        BasaltLogger.log(I18n.translate('app.start', Language.EN, {
            name: packageJsonConfiguration.name
        }));

    } catch (error) {
        if (error instanceof ErrorEntity) {
            error.message = I18n.translate(error.message, Language.EN);
            BasaltLogger.error(error);
        }

        await app.stop();
        BasaltLogger.log(I18n.translate('app.stop', Language.EN, {
            name: packageJsonConfiguration.name
        }));
    }
}

runApp();

process.on('SIGINT', async (): Promise<void> => {
    BasaltLogger.log(I18n.translate('app.signal.SIGINT', Language.EN));
    await app.stop();
});
