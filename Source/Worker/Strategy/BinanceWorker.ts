import { WebSocket } from 'ws';

import { BinanceProducer } from '@/Infrastructure/RedPanda/Producer';
import { IDataWorker } from '@/Worker/Interface';
import { IBinanceCryptoDataKline, IBinanceInitDTO } from '@/Data/DTO';

export class BinanceWorker implements IDataWorker {
    private readonly _binanceProducer: BinanceProducer = new BinanceProducer();
    private _ws: WebSocket | undefined;
    private readonly _params: string[] = [
        'btcusdt@kline_1s',
        'ethusdt@kline_1s',
        'ltcusdt@kline_1s',
    ];

    public start(): void {
        this._ws = new WebSocket('wss://stream.binance.com:9443/ws');
        this._ws.on('open', (): void => {
            this._ws?.send(JSON.stringify({
                method: 'SUBSCRIBE',
                params: this._params,
                id: 1
            }));
        });

        this._ws.on('message', async (message: ArrayBuffer): Promise<void> => {
            const data: IBinanceCryptoDataKline | IBinanceInitDTO = JSON.parse(message.toString());
            if ((data as IBinanceCryptoDataKline).e === 'kline')
                await this._binanceProducer.execute(data as IBinanceCryptoDataKline);
        });
    }

    public stop(): void {
    }

}
