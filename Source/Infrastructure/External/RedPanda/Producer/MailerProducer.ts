import { RedpandaProducer, Topics } from '@/Infrastructure/External/RedPanda/Producer';

export class MailerProducer {
    public async execute(
        username: string,
        email: string,
        mailType: string,
        scheduledEmailDate: string | undefined = undefined,
    ): Promise<void> {
        await RedpandaProducer.instance.send({
            topic: Topics.MAILER_MICROSERVICE,
            messages: [
                {
                    value: JSON.stringify({
                        email,
                        username,
                        mailType,
                        scheduledEmailDate,
                    }),
                },
            ],
        });
    }
}
