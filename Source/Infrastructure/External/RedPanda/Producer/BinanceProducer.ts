import { RedpandaProducer, Topics } from '@/Infrastructure/External/RedPanda/Producer';
import { packageJsonConfiguration } from '@/Config';
import { IBinanceCryptoData } from '@/Data/DTO';

export class BinanceProducer {
    public async execute(data: IBinanceCryptoData): Promise<void> {
        await RedpandaProducer.instance.send({
            topic: Topics.BINANCE_CONSUMER,
            messages: [
                {
                    value: JSON.stringify({
                        microservice: packageJsonConfiguration.name,
                        data,
                    }),
                },
            ],
        });
    }
}
