import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { createValidationPipe } from './common/pipes/validation.pipe';
import { ConfigurationService } from './config/configuration.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(createValidationPipe());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const config = app.get(ConfigurationService);
  const port = config.appPort;

  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

bootstrap();
