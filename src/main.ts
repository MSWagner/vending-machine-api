import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { setupApp } from "./appSetup";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    setupApp(app);

    const options = new DocumentBuilder()
        .addBearerAuth()
        .setTitle("vending-machine-api")
        .setDescription("vending-machine-api API")
        .setVersion("1.0")
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("api/v1/documentation", app, document);

    await app.listen(3000);
}
bootstrap();
