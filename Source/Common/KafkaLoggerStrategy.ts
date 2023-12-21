import { ILoggerStrategy, LogLevels } from '@basalt-lab/basalt-logger';

import { LoggerProducer } from '@/Infrastructure/External/RedPanda/Producer';

export class KafkaLoggerStrategy implements ILoggerStrategy {
    public log(level: LogLevels, prefixDate: string, object: unknown): void {
        const producer: LoggerProducer = new LoggerProducer();
        prefixDate = prefixDate.replace('[', '').replace(']', '');
        const date: Date = new Date(prefixDate);
        producer.execute(level, date.toISOString(), object)
            .catch((error: Error): void => {
                throw error;
            });
    }
}
