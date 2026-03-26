import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const memberServiceUrl =
    process.env.MEMBER_SERVICE_URL || 'http://localhost:3001';
  const bookingServiceUrl =
    process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
  const facilityServiceUrl =
    process.env.FACILITY_SERVICE_URL || 'http://localhost:3003';

  // Proxy → member-service (conserva el path completo)
  app.use(
    '/auth',
    createProxyMiddleware({
      target: memberServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/auth/' },
    }),
  );
  app.use(
    '/members',
    createProxyMiddleware({
      target: memberServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/members/' },
    }),
  );

  // Proxy → booking-service (conserva el path completo)
  app.use(
    '/waitlist',
    createProxyMiddleware({
      target: bookingServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/waitlist/' },
    }),
  );
  app.use(
    '/classes',
    createProxyMiddleware({
      target: bookingServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/classes/' },
    }),
  );
  app.use(
    '/schedules',
    createProxyMiddleware({
      target: bookingServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/schedules/' },
    }),
  );
  app.use(
    '/bookings',
    createProxyMiddleware({
      target: bookingServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/bookings/' },
    }),
  );

  // Proxy → facility-service
  app.use(
    '/gyms',
    createProxyMiddleware({
      target: facilityServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/gyms/' },
    }),
  );
  app.use(
    '/equipment',
    createProxyMiddleware({
      target: facilityServiceUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/equipment/' },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`API Gateway corriendo en puerto ${process.env.PORT ?? 3000}`);
  console.log(`  → Member Service:   ${memberServiceUrl}`);
  console.log(`  → Booking Service:  ${bookingServiceUrl}`);
  console.log(`  → Facility Service: ${facilityServiceUrl}`);
}
bootstrap();
