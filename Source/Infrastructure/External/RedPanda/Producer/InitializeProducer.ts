import { RedpandaProducer, Topics } from '@/Infrastructure/External/RedPanda/Producer';
import { packageJsonConfiguration, EnvironmentConfiguration } from '@/Config';

export class InitializeProducer {

    public async execute(): Promise<void> {
        await RedpandaProducer.instance.send({
            topic: Topics.INIT_MICROSERVICE,
            messages: [
                {
                    value: JSON.stringify({
                        name: packageJsonConfiguration.name,
                        host: EnvironmentConfiguration.env.HOST,
                        prefix: EnvironmentConfiguration.env.PREFIX,
                        httpPort: EnvironmentConfiguration.env.HTTP_PORT,
                        wsPort: EnvironmentConfiguration.env.WS_PORT,
                        dbHost: EnvironmentConfiguration.env.DB_HOST,
                        dbPort: EnvironmentConfiguration.env.DB_PORT,
                    }),
                },
            ],
        });
    }
}
