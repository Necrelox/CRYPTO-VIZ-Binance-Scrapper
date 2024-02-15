import { RedPandaProducer } from '@/Infrastructure/RedPanda/Producer';
import { Topics } from '@/Infrastructure/RedPanda';
import { IBinanceCryptoDataKline } from '@/Data/DTO';

export class BinanceProducer {
    public async execute(data: IBinanceCryptoDataKline): Promise<void> {
        await RedPandaProducer.instance.send({
            topic: Topics.BINANCE_CONSUMER,
            messages: [
                {
                    value: JSON.stringify(data),
                },
            ],
        });
    }
}
