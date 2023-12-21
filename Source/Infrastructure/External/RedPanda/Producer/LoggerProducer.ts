import { RedpandaProducer, Topics } from '@/Infrastructure/External/RedPanda/Producer';
import { packageJsonConfiguration } from '@/Config';

export class LoggerProducer {
    public async execute(level: string, date: string, object: unknown): Promise<void> {
        await RedpandaProducer.instance.send({
            topic: Topics.LOGGER_MICROSERVICE,
            messages: [
                {
                    value: JSON.stringify({
                        microservice: packageJsonConfiguration.name,
                        level,
                        date,
                        object,
                    }),
                },
            ],
        });
    }
}
