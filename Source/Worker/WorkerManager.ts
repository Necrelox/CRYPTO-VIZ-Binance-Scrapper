import { IDataWorker } from '@/Worker/Interface';
import { BinanceWorker } from '@/Worker/Strategy';

export class WorkerManager {
    private readonly _workers: IDataWorker[] = [];

    public constructor() {
        this._workers = this.initializeProducer();
    }

    private initializeProducer(): IDataWorker[] {
        return [
            new BinanceWorker(),
        ];
    }

    public start(): void {
        this._workers.forEach((consumer: IDataWorker): void => consumer.start());
    }

    public stop(): void {
        this._workers.forEach((consumer: IDataWorker): void => consumer.stop());
    }
}
